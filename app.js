const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); 

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname + "/public"));

// insert connection to db here DELETE WHEN PUSHING!!
mongoose.connect("mongodb+srv://person:person1234@cluster0.ls5nm.mongodb.net/WordVerse",{ useUnifiedTopology: true, useNewUrlParser: true })

const userData = {
  username: String,
  email: String,
  password: String,
  school: String

}
const userStats = {
  cardsReviewed: Number,
  created: Date
}
const userSchema = {
  userData: userData,
  userStats: userStats,
  flashcards: Array
}
const User = mongoose.model("User", userSchema)

// homepage
app.get("/", function(req, res){
  res.render("index");
})

// flashcard widget
app.get("/flashcards", function(req, res){
  res.render("flashcards.ejs")
})

// return page to create an account
app.get("/signup", function(req, res){
  res.render("signup.ejs")
})
// actually create the account and save it to the DB
app.post("/signup", function(req, res){
  // assemble user data
  user =  new User({
    userData: {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      school: req.body.school
    },
    userStats: {
        cardsReviewed: 0,
        created: Date.now()
    },
    flashcards: []
  })

  user.save().then(savedDoc => {
    res.send("Successfully created user: " + savedDoc.userData.username + " | <a href='/login'>Login Now.</a>")
  })
})

// log in to an account
app.get("/login", function(req, res){
  props = {
    badpass: false
  }
  if (req.query.error == "0"){
    props.badpass = true
  }
  res.render("login.ejs", props=props)
})

app.post("/login", function(req, res){
  let usernameIn = req.body.username
  let passwordIn = req.body.password

  User.findOne({ "userData.username" : usernameIn}).then(user => {
    if(user.userData.password == passwordIn){
      res.send("You have logged in. Welcome " + user.userData.username + " from " + user.userData.school)
    }
    else{
      res.redirect("/login?error=0")
    }
  })
  .catch(err => {
    res.redirect("/login")
  })

})


app.listen(3000,function(){
  console.log("Server started on port 3000." + 
  "Type http://localhost:3000/ into your browser to access the application.");
})
