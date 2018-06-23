
var mongoose = require("mongoose");

var Schema = mongoose.Schema;


var NoteSchema = new Schema({
  body: {
    type: String
  }
});


// Create the Note model with the NoteSchema
var Note = mongoose.model("Note", NoteSchema);


module.exports = Note;