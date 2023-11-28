// SCHEMAS
// USER
const userData = {
    username: String, // i.e "John", allow dups for now but not in future
    email: String, // john.wick@yale.edu same as above
    password: String, // dups are always allowed
    school: String // users can enter whatever they want

}
const userStats = {
    cardsReviewed: Number, // general statistic to be shown on website
    created: Date, // date of creation, implemented during user sign up
    streak: Number, // keeps track of the number of consecutive log in days
    lastLogin: Date, // last time the user logged in
}
const userSchema = {
    userData: userData, 
    userStats: userStats,
    flashcards: Array, // a list of ids to flashcards
    friends: Array, // a list of ids to other users
    cardRequests: Array
}

const flashcardSchema = {
    content: Object,
    type: String, // currently only supporting "basic", but will add "hint" and "fill-in" 
    owner: String, // same as User Id of who created it, only owner can edit
    tags: Array // a list of tags e.g ["Biology", "Anatomy"]
}

// SESSION
const sessionSchema = {
    userId: String,
    expirationDate: Date
}

// schemas exported
module.exports = { userSchema, flashcardSchema, sessionSchema }