var mongoose = require("mongoose");

// saving reference to schema constructor
var Schema = mongoose.Schema;

// Schema constructor to create new UserSchema object
var articleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

var article = mongoose.model("Article", articleSchema);

module.exports = article;