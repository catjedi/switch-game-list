const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// Schema setup, which establishes the foundation of a document
// that will be embedded into the database
const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);