const schemas = require("./dblib")
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")

const app = express();
app.set("view engine", "ejs");
app.use(express.static("/public"));

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
const Flashcard = mongoose.model("Flashcard", schemas.flashcardSchema)

// homepage
app.get("/", function(req, res){
  props = {}
  res.render("index", props=props);
})

// flashcard widget
app.get("/flashcards", function(req, res){
  res.render("flashcards.ejs")
})

// return page to create an account
app.get("/signup", function(req, res){
  props = {}
  res.render("signup.ejs", props=props)
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
        created: Date.now(),
        streak: 0,
        lastLogin: Date.now()
    },
    flashcards: [],
    friends: []
  })

  user.save().then(savedDoc => {
    res.send("Successfully created user: " + savedDoc.userData.username + " | <a href='/login'>Login Now.</a>")
  })
})

// log in to an account page
app.get("/login", function(req, res){
  props = {}
  if (req.query.error == "0"){
    props.loginErr = "Invalid Password"
  }
  else if (req.query.error == "1"){
    props.loginErr = "Account not Found."
  }
  else if (req.query.error == "2"){
    props.loginErr = "Please sign in first."
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
      res.redirect('/');
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
          flashcards: user.flashcards,
          streak: user.userData.streak
        }
        res.render("profile.ejs", props=props)
      }
  })
  .catch(err => {
    res.send("Sorry something went wrong.")
  })
})

app.get("/create", function(req, res) {
  // must be logged in to access this route
  if(!req.session.userId){
    res.redirect("/login?error=2")
  }
  else{
    User.findOne({_id : req.session.userId}).then(user => {
      props = {
        username: user.userData.username,
        school: user.userData.school
      }
      res.render("create.ejs", props=props)
    })
    .catch(err => {
      res.status(500).send("Sorry something went wrong when trying to access the page. Try again later.")
    })
  }
})
app.post("/create", function(req, res) {
  flashcard = new Flashcard({
    content: req.body.fContent,
    type: req.body.type,
    owner: req.session.userId,
    tags: [0]

  })
  flashcard.save().then(savedCard => {
    User.findOne({_id : req.session.userId}).then(user => {
      user.flashcards.push(savedCard._id)
      user.save().then(
        res.send(`Card Added Successfully!`)
      )
      .catch(err => {
        res.send(`Card could not be saved. Try again later.`)
      })
    })
  })
  
})

app.get("/study", function(req, res){
  // must be logged in to access this route
  if(!req.session.userId){
    res.redirect("/login?error=2")
  }
  else{
    User.findOne({_id : req.session.userId}).then(user => {
      props = {
        username: user.userData.username,
        school: user.userData.school
      }
      flashcardIds = user.flashcards
      
      Flashcard.find({"_id" : { $in: flashcardIds}}).then(cards => {
        props.flashcards = cards
        res.render("study.ejs", props=props)
      })
      .catch(err => {
        res.status(500).send("Sorry something went wrong when trying to access the page. Try again later.")
      })
      
    })
    .catch(err => {
      res.status(500).send("Sorry something went wrong when trying to access the page. Try again later.")
    })
  }
})

app.get("/friends", function(req, res) {
  // must be logged in to access this route
  if(!req.session.userId){
    res.redirect("/login?error=2")
  }
  else{
    User.findOne({_id : req.session.userId}).then(user => {
      props = {
        username: user.userData.username,
        school: user.userData.school
      }
      res.render("friends.ejs", props=props)
    })
    .catch(err => {
      res.status(500).send("Sorry something went wrong when trying to access the page. Try again later.")
    })
  }
})

app.listen(3000,function(){
  console.log("Server started on port 3000." + 
  "Type http://localhost:3000/ into your browser to access the application.");
})
app.get("/findFriends", function(req, res){
  User.find({"userData.username" : { $regex : req.query.name}}).then(users => {
    props = {
      users: users
    }
    res.send(props)
  })
})