const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({extended:true}))

// homepage
app.get("/", function(req, res){
  res.render("index");
})

// flashcard widget
app.get("/flashcards", function(req, res){
  res.render("flashcards.ejs")
})

app.listen(3000,function(){
  console.log("Server started on port 3000." + 
  "Type http://localhost:3000/ into your browser to access the application.");
})
