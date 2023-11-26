const schemas = require("./dblib")
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname + "/public"));

const connectURL = "mongodb+srv://person:person1234@cluster0.ls5nm.mongodb.net/WordVerse"
const options = {
  mongoUrl: connectURL,
  ttl: 7 * 24 * 60 * 60, // sessions have 7 day expiry date 
  touchAfter: 1 * 3600, // can only update session once/hour
  autoRemove: "native" // autoremoves expired sessions
}
app.use(session({
  secret: "wordverse123",
  resave: false,
  store: MongoStore.create(options),
  saveUninitialized: false
}))
mongoose.connect(connectURL,{ useUnifiedTopology: true, useNewUrlParser: true })

const User = mongoose.model("User", schemas.userSchema)

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

// log in to an account
app.get("/login", function(req, res){
  props = {
    loginErr: -1
  }
  if (req.query.error == "0"){
    props.loginErr = 0
  }
  else if (req.query.error == "1"){
    props.loginErr = 1
  }
  res.render("login.ejs", props=props)
})
// POST route for logging in, handles authentication
app.post("/login", function(req, res){
  let usernameIn = req.body.username
  let passwordIn = req.body.password

  User.findOne({ "userData.username" : usernameIn}).then(user => {
    if(user.userData.password == passwordIn){
      res.send("You have logged in. Welcome " + user.userData.username + " from " + user.userData.school)
    }
    else{
      res.redirect("/login?error=0") // bad pass
    }
  })
  .catch(err => {
    console.log(err)
    res.redirect("/login?error=1") // account not found
  })

})


app.listen(3000,function(){
  console.log("Server started on port 3000." + 
  "Type http://localhost:3000/ into your browser to access the application.");
})
