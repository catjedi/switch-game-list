const mongoose = require("mongoose");

// Schema setup, which establishes the foundation of a document
// that will be embedded into the database
let gameSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

// Models are for "creating and reading documents from
// the underlying MongoDB database"
module.exports = mongoose.model("Game", gameSchema);
