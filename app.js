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

// log in to an account page
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
      // create a user
      req.session.userId = user._id
      res.redirect("/profile")
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

app.post("/logout", function(req, res){
  req.session.destroy(err => {
    if(err) {
      console.log(err)
      return res.status(500).send("An error occurred trying to log you out.")
    }
    else{
      res.send("Log out successful. <a href='/login'>Return to login page.</a>")
    }
  })
})

app.get("/profile", function(req, res){
  User.findOne({ _id : req.session.userId }).then(user => {
    // only return necessary data for flashcards page
      // not whole user
      if(!user){
        res.redirect("/login")
      }
      else{
        props = {
          username: user.userData.username,
          school: user.userData.school,
          flashcards: user.flashcards
        }
        res.render("flashcards.ejs", props=props)
      }
  })
  .catch(err => {
    res.send("Sorry something went wrong.")
  })
})

app.listen(3000,function(){
  console.log("Server started on port 3000." + 
  "Type http://localhost:3000/ into your browser to access the application.");
})
