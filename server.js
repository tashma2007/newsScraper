//required dependencies
var express = require("express");
var mongoose = require("mongoose");
var logger = require("morgan");
var exphbs = require("express-handlebars");

//scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

//set port
var PORT = process.env.PORT || 8080;

// require all models
var db = require("./models");

// initialize express
var app = express();

var router = express.Router();

//require("./config/routes")(router);

// use mogan logger for logging requests
app.use(logger('dev'));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname + "/public"));

//set handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(router);

// should connect mongoose to my remote mongolab database if deployed, 
//but otherwise will connect to the local mongoHeadlines database on the computer
mongoose.connect("mongodb://localhost/mongoHeadlines", { useNewUrlParser: true });

//ROUTES

// GET route for scraping the Reddit's webdev board
app.get("/scrape", function (req, res) {
  axios.get("https://old.reddit.com/r/webdev/").then(function (response) {
    var $ = cheerio.load(response.data);

    //grabbing healines of articles
    $("article h2").each(function (i, element) {
      // save empty result object
      var result = {};

      // add text and href of every link and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children("a")
        .text();

      // create new article using the 'result' object built from scraping and save to the database
      // The "unique" rule in the Articles model's schema will prevent duplicate articles from being added to the server
      db.Article.create(result)
        .then(function (dbArticle) {
          // view the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // log if error occurs
          console.log(err);
        });
    });
    // send msg to client that scraping is complete
    res.send("Scrape Complete");
  });
});

// route for getting all Articles from the database
app.get("/articles", function (req, res) {
  // grab every document in the Aricles collection
  db.Article.find({})
    .then(function (dbArticle) {
      //if finding articles are sucessful, send back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      //send to client if error occured
      res.json(err);
    })
})

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});