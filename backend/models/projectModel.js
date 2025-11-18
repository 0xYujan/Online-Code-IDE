const mongoose = require("mongoose");

mongoose
.connect("mongodb+srv://code:code@codeide.vzoiryz.mongodb.net/codeIDE")
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.error("MongoDB connection error:", err));

const projectSchema = new mongoose.Schema({
    title: String,
    createdBy: String,
    date: {
        type: Date,
        default: Date.now,
    },
    htmlCode: {
        type: String,
        default: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
    
    </body>
    </html>`,
    },
    cssCode: {
        type: String,
        default: `
    body{
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }`,
    },
    jsCode: {
        type: String,
        default: '//console.log("Hello World")',
    },
    collaborators: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Assuming the user model is named "User"
        },
    ],
    versionHistory: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            username: String,
            timestamp: {
                type: Date,
                default: Date.now,
            },
            changeType: {
                type: String,
                enum: ["html", "css", "js", "all"],
            },
            description: String,
            htmlCode: String,
            cssCode: String,
            jsCode: String,
        },
    ],
    lastModified: {
        type: Date,
        default: Date.now,
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

module.exports = mongoose.model("Project", projectSchema);
