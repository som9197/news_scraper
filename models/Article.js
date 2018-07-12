
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({

  title: {
    type: String,
    required: true
  },
 
  link: {
    type: String,
    required: true
  },
  // Saves array of notes.
  notes: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);


module.exports = Article;