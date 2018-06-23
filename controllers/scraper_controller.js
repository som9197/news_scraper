var express = require("express");

var router = express.Router();

var request = require("request");

var cheerio = require("cheerio");

var mongoose = require("mongoose");

mongoose.Promise = Promise;

var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

router.get("/", function(req, res) {
  res.render("index");
});

// This will get the articles scraped / saved in db / show them in list.
router.get("/savedarticles", function(req, res) {

  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
   
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      var hbsArticleObject = {
        articles: doc
      };

      res.render("savedarticles", hbsArticleObject);
    }
  });
});


router.post("/scrape", function(req, res) {

  // Grab the body of the html with request
  request("http://www.nytimes.com/", function(error, response, html) {
   
    var $ = cheerio.load(html);

    // Make empty array for temporarily saving and showing scraped Articles
    var scrapedArticles = {};
    // Grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {

           var result = {};

  
      result.title = $(this).children("a").text();

      console.log("What's the result title? " + result.title);
      
      result.link = $(this).children("a").attr("href");

      scrapedArticles[i] = result;

    });

    console.log("Scraped Articles object built: " + scrapedArticles);

    var hbsArticleObject = {
        articles: scrapedArticles
    };

    res.render("index", hbsArticleObject);

  });
});

router.post("/save", function(req, res) {

  console.log("This is the title: " + req.body.title);

  var newArticleObject = {};

  newArticleObject.title = req.body.title;

  newArticleObject.link = req.body.link;

  var entry = new Article(newArticleObject);

  console.log("We can save the article: " + entry);

  // Save that entry to the db
  entry.save(function(err, doc) {
    // Log any errors
    if (err) {
      console.log(err);
    }
    // Or log the doc
    else {
      console.log(doc);
    }
  });

  res.redirect("/savedarticles");

});

router.get("/delete/:id", function(req, res) {

  console.log("ID is read - delete" + req.params.id);

  console.log("Able to activate delete function.");

  Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
    if (err) {
      console.log("Not able to delete:" + err);
    } else {
      console.log("Able to delete");
    }
    res.redirect("/savedarticles");
  });
});

router.get("/notes/:id", function(req, res) {

  console.log("ID is read - delete" + req.params.id);

  console.log("Able to activate delete function.");

  Note.findOneAndRemove({"_id": req.params.id}, function (err, doc) {
    if (err) {
      console.log("Not able to delete:" + err);
    } else {
      console.log("Able to delete");
    }
    res.send(doc);
  });
});


router.get("/articles/:id", function(req, res) {

  console.log("ID is getting read" + req.params.id);

  Article.findOne({"_id": req.params.id})

  .populate('notes')

  .exec(function(err, doc) {
    if (err) {
      console.log("Not able to find article and get notes.");
    }
    else {
      console.log("We are getting article and maybe notes? " + doc);
      res.json(doc);
    }
  });
});


router.post("/articles/:id", function(req, res) {

 
  var newNote = new Note(req.body);
 
  newNote.save(function(error, doc) {
   
    if (error) {
      console.log(error);
    } 
    else {
     
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {notes: doc._id}}, {new: true, upsert: true})

      .populate('notes')

      .exec(function (err, doc) {
        if (err) {
          console.log("Cannot find article.");
        } else {
          console.log("On note save we are getting notes? " + doc.notes);
          res.send(doc);
        }
      });
    }
  });
});

module.exports = router;