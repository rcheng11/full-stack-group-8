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
        streak: 1,
        lastLogin: Date.now()
    },
    flashcards: [],
    friends: [],
    cardRequests: []
  })

  user.save().then(savedDoc => {
    res.redirect('/login');
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
      req.session.username = user.userData.username
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
          userStats: user.userStats
        }

        // Checks streak
        let lastLogin = props.userStats.lastLogin
        let today = new Date()
        let yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)

        if (lastLogin.toDateString() === yesterday.toDateString()) {
          props.userStats.streak += 1
        }
        else if(today.toDateString() === lastLogin.toDateString()){
          props.userStats.streak = props.userStats.streak
        }
        else{
          props.userStats.streak = 1
        }

        props.userStats.lastLogin = today;

        user.save().then((savedUser) => {
          res.render("profile.ejs", props=props);
        })
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

app.get("/collection", function(req, res){
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
        res.render("collection.ejs", props=props)
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

app.get("/findFriends", function(req, res){
  User.find({"userData.username" : { $regex : req.query.name}}).then(users => {
    // remove the passwords before sending over
    let modifiedUsers = []
    for(let i = 0; i < users.length; i++){
      let modifiedUser = users[i]
      modifiedUser.password = "N/A"
      modifiedUsers.push(modifiedUser)
    }
    props = {
      users: modifiedUsers
    }
    res.send(props)
  })
})
app.post("/addFriend", function(req, res){
  User.findOne({_id : req.session.userId}).then(user => {
    User.findOne({"userData.username" : req.body.username }).then(friend => {
      if(user._id.equals(friend._id)){
        res.send("You cannot befriend yourself.")
      }
      // check that they are not already friends
      else if(user.friends.indexOf(friend._id) == -1){
        user.friends.push(friend._id)
        friend.friends.push(user._id)
        user.save().then(savedUser => {
          friend.save().then(savedFriend => {
            res.send("Successfully added " + friend.userData.username + " as a friend!")
          })
          .catch(err => {
            res.send("Failed to add " + friend.userData.username + " as a friend.")
          })
        })
        .catch(err => {
          res.send("Failed to add " + friend.userData.username + " as a friend.")
        })
      }
      else{
        res.send("You're already friends with " + friend.userData.username)
      }
    })
  })
})

app.post("/deleteCard", function(req, res){
  Flashcard.findOne({ _id : req.body.cardId }).then(card => {
    // check that the user can delete the card
    // i.e they are the owner
    if(card.owner == req.session.userId){
      // attempt to delete the card, first from the users card list
      User.findOne({ _id : req.session.userId }).then(user => {
        let idx = user.flashcards.indexOf(req.body.cardId)
        user.flashcards.splice(idx, 1)
        console.log(user.flashcards)
        user.save().then(savedUser => {
          Flashcard.deleteOne({ _id : req.body.cardId }).then(() => {
            res.send("Card deleted successfully!")
          })
          .catch(err => {
            console.log("flashcard deleteOne" + err)
            res.send("Card could not be deleted. Try again later.")
          })
        })
      })
      .catch(err => {
        console.log("first flashcard findOne" + err)
        res.send("Card could not be deleted. Try again later.")
      })
    }
    else{
      res.send("You cannot delete a card you don't own...")
    }
  })
  .catch(err => {
    console.log("flashcard deleteOne" + err)
    res.send("Your card could not be deleted at this time. Try again later.")
  })
})

app.get("/inbox", function(req, res){
  // must be logged in to access this route
  if(!req.session.userId){
    res.redirect("/login?error=2")
  }
  else{
    // find current user
    User.findOne({_id : req.session.userId}).then(user => {
      props = {
        username: user.userData.username,
        school: user.userData.school
      }
      // get flashcards from ids
      let flashcardIds = user.flashcards
      Flashcard.find({"_id" : { $in: flashcardIds}}).then(cards => {
        props.flashcards = cards
        // get card requests from ids
        let cardRequestIds = user.cardRequests.map(req => req.cardId)
        Flashcard.find({"_id" : { $in: cardRequestIds}}).then(cardReqs => {
          props.cardRequests = cardReqs
          props.requestsData = user.cardRequests
          // get friends from ids
          let friendIds = user.friends
          User.find({"_id" : { $in: friendIds}}).then(friends => {
            props.friends = friends
            res.render("inbox.ejs", props=props)
          })
        })
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).send("Sorry something went wrong when trying to access the page. Try again later.")
    })
  }
})
app.post("/sendCard", function(req, res){
  let cardId = req.body.cardId
  let friendId = req.body.friendId
  User.findOne({_id : friendId}).then(friend => {
    // send request only if not already there
    let cardRequestIds = friend.cardRequests.map(card => card.cardId)
    if((cardRequestIds.indexOf(cardId) == -1)
        && (friend.flashcards.indexOf(cardId) == -1)){
      friend.cardRequests.push({
        sender: req.session.username,
        senderId: req.session.userId,
        cardId: cardId
      })
      friend.save().then(savedDoc => {
        res.send(`Card sent to ${friend.userData.username}'s inbox!`)
      })
      .catch(err => {
        console.log(err)
        res.send("Sorry something went wrong. Try again later.")
      })
    }
    else{
      res.send(`Your friend ${friend.userData.username} already has this card in their inbox or collection.`)
    }
  })
  .catch(err => {
    console.log(err)
    res.send("Sorry something went wrong. Try again later.")
  })
})

app.post("/cardReject", function(req, res){
  User.findOne({_id : req.session.userId}).then(user => {
    let idx = user.cardRequests.map(card => card.cardId).indexOf(req.body.cardId)
    user.cardRequests.splice(idx, 1)
    user.save().then(savedDoc => {
      res.send("Card request rejected!")
    })
  })
  .catch(err => {
    res.send("Could not reject request. Try again later.")
  })
})
app.post("/cardAccept", function(req, res){
  User.findOne({_id : req.session.userId}).then(user => {
    let idx = user.cardRequests.map(card => card.cardId).indexOf(req.body.cardId)
    user.flashcards.push(user.cardRequests[idx].cardId)
    user.cardRequests.splice(idx, 1)

    

    user.save().then(savedDoc => {
      res.send("Card added to your collection!")
    })
  })
  .catch(err => {
    res.send("Could not accept request. Try again later.")
  })
})

app.listen(3000,function(){
  console.log("Server started on port 3000." + 
  "Type http://localhost:3000/ into your browser to access the application.");
})