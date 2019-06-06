var mongoose = require("mongoose");

// saving reference to schema constructor
var Schema = mongoose.Schema;

// Schema constructor to create new UserSchema object
var noteSchema = new Schema({
    title: String,
    body: String
});

var note = mongoose.model("Note", noteSchema);

module.exports = note;