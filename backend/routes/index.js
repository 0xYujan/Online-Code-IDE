var express = require("express");
var router = express.Router();
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var userModel = require("../models/userModel");
var projectModel = require("../models/projectModel");

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", {title: "Express"});
});

const secret = "secret"; // secret key for jwt

router.post("/signUp", async (req, res) => {
    try {
        let {username, name, email, password} = req.body;
        let emailCon = await userModel.findOne({email: email});
        if (emailCon) {
            return res.json({success: false, message: "Email already exists"});
        } else {
            bcrypt.genSalt(10, function (err, salt) {
                if (err) {
                    return res.json({success: false, message: "Error creating account", error: err.message});
                }
                bcrypt.hash(password, salt, async function (err, hash) {
                    if (err) {
                        return res.json({success: false, message: "Error creating account", error: err.message});
                    }
                    try {
                        let user = await userModel.create({
                            username: username,
                            name: name,
                            email: email,
                            password: hash,
                        });
                        return res.json({success: true, message: "User created successfully"});
                    } catch (error) {
                        return res.json({success: false, message: "Error saving user", error: error.message});
                    }
                });
            });
        }
    } catch (error) {
        return res.json({success: false, message: "Server error", error: error.message});
    }
});

router.post("/login", async (req, res) => {
    let {email, password} = req.body;
    let user = await userModel.findOne({email: email});

    if (user) {
        // Rename the second `res` to avoid conflict
        bcrypt.compare(password, user.password, function (err, isMatch) {
            if (err) {
                return res.json({success: false, message: "An error occurred", error: err});
            }
            if (isMatch) {
                let token = jwt.sign({email: user.email, userId: user._id}, secret);
                return res.json({
                    success: true,
                    message: "User logged in successfully",
                    token: token,
                    userId: user._id,
                });
            } else {
                return res.json({success: false, message: "Invalid email or password"});
            }
        });
    } else {
        return res.json({success: false, message: "User not found!"});
    }
});

router.post("/getUserDetails", async (req, res) => {
    console.log("Called");
    let {userId} = req.body;
    let user = await userModel.findOne({_id: userId});
    if (user) {
        return res.json({success: true, message: "User details fetched successfully", user: user});
    } else {
        return res.json({success: false, message: "User not found!"});
    }
});

router.post("/createProject", async (req, res) => {
    let {userId, title} = req.body;
    let user = await userModel.findOne({_id: userId});
    if (user) {
        let project = await projectModel.create({
            title: title,
            createdBy: userId,
        });

        return res.json({success: true, message: "Project created successfully", projectId: project._id});
    } else {
        return res.json({success: false, message: "User not found!"});
    }
});

router.post("/getProjects", async (req, res) => {
    let {userId} = req.body;
    let user = await userModel.findOne({_id: userId});
    if (user) {
        // Find projects where user is either the creator OR a collaborator
        let projects = await projectModel.find({
            $or: [{createdBy: userId}, {collaborators: userId}],
        });
        return res.json({success: true, message: "Projects fetched successfully", projects: projects});
    } else {
        return res.json({success: false, message: "User not found!"});
    }
});

router.post("/deleteProject", async (req, res) => {
    let {userId, progId} = req.body;
    let user = await userModel.findOne({_id: userId});
    if (user) {
        let project = await projectModel.findOneAndDelete({_id: progId});
        return res.json({success: true, message: "Project deleted successfully"});
    } else {
        return res.json({success: false, message: "User not found!"});
    }
});

router.post("/getProject", async (req, res) => {
    let {userId, projId} = req.body;
    let user = await userModel.findOne({_id: userId});
    if (user) {
        let project = await projectModel.findOne({_id: projId});
        return res.json({success: true, message: "Project fetched successfully", project: project});
    } else {
        return res.json({success: false, message: "User not found!"});
    }
});

router.post("/updateProject", async (req, res) => {
    let {userId, htmlCode, cssCode, jsCode, projId, changeType, description} = req.body;
    let user = await userModel.findOne({_id: userId});

    if (user) {
        // Create version history entry
        let versionEntry = {
            userId: userId,
            username: user.username,
            timestamp: new Date(),
            changeType: changeType || "all",
            description: description || "Code update",
            htmlCode: htmlCode,
            cssCode: cssCode,
            jsCode: jsCode,
        };

        let project = await projectModel.findOneAndUpdate(
            {_id: projId},
            {
                htmlCode: htmlCode,
                cssCode: cssCode,
                jsCode: jsCode,
                lastModified: new Date(),
                lastModifiedBy: userId,
                $push: {versionHistory: versionEntry},
            },
            {new: true} // This option returns the updated document
        );

        if (project) {
            return res.json({success: true, message: "Project updated successfully"});
        } else {
            return res.json({success: false, message: "Project not found!"});
        }
    } else {
        return res.json({success: false, message: "User not found!"});
    }
});

router.post("/addCollaborator", async (req, res) => {
    const {projId, collaboratorId, htmlCode, cssCode, jsCode} = req.body;

    // Verify that the user exists

    // Verify that the collaborator exists
    let collaborator = await userModel.findOne({_id: collaboratorId});
    if (!collaborator) {
        return res.json({success: false, message: "Collaborator not found!"});
    }

    // Add collaborator to the project
    let project = await projectModel.findByIdAndUpdate(
        projId,
        {$push: {collaborators: collaboratorId}},
        {htmlCode: htmlCode, cssCode: cssCode, jsCode: jsCode},
        {new: true} // Return the updated project
    );

    return res.json({success: true, message: "Collaborator added successfully", project: project});
});

router.post("/getVersionHistory", async (req, res) => {
    let {projId} = req.body;
    try {
        let project = await projectModel.findOne({_id: projId}).populate("versionHistory.userId", "username name");
        if (project) {
            return res.json({success: true, versionHistory: project.versionHistory});
        } else {
            return res.json({success: false, message: "Project not found!"});
        }
    } catch (error) {
        return res.json({success: false, message: "Error fetching version history", error: error.message});
    }
});

module.exports = router;
