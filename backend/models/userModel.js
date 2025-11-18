let mongoose = require("mongoose");

mongoose
.connect("mongodb+srv://code:code@codeide.vzoiryz.mongodb.net/codeIDE")
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.error("MongoDB connection error:", err));

let userSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    date: {
        type: Date,
        default: Date.now,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("User", userSchema); // 'User' is the name of the collection
