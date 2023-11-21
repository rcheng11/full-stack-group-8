const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); 

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname + "/public"));

// Insert connection to db here DELETE WHEN PUSHING!!
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

// Homepage
app.get("/", function(req, res){
  res.render("index");
})

// Flashcard widget
app.get("/flashcards", function(req, res){
  res.render("flashcards.ejs")
})

// Return page to create an account
app.get("/signup", function(req, res){
  res.render("signup.ejs")
})
// Actually create the account and save it to the DB
app.post("/signup", function(req, res){
  // Assemble user data
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
    res.redirect("/dashboard")
  })

  .catch(err => {
    res.send("Error creating user: " + err.message)
  })
})

// Log in to an account
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
      res.redirect("/dashboard")
    }
    else{
      res.redirect("/login?error=0")
    }
  })
  .catch(err => {
    res.redirect("/login")
  })

})

// Dashboard containing study sets and other info
app.get("/dashboard", function(req, res){
  props = {
    badpass: false
  }
  if (req.query.error == "0"){
    props.badpass = true
  }
  res.render("dashboard.ejs", props=props)
})

// app.post("/dashboard", function(req, res){
//   let usernameIn = req.body.username
//   let passwordIn = req.body.password

//   User.findOne({ "userData.username" : usernameIn}).then(user => {
//     if(user.userData.password == passwordIn){
//       res.send("You have logged in. Welcome " + user.userData.username + " from " + user.userData.school)
//     }
//     else{
//       res.redirect("/login?error=0")
//     }
//   })
//   .catch(err => {
//     res.redirect("/login")
//   })

// })

app.listen(3000,function(){
  console.log("Server started on port 3000." + 
  "Type http://localhost:3000/ into your browser to access the application.");
})
