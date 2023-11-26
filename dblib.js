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
    created: Date // date of creation, implemented during user sign up
}
const userSchema = {
    userData: userData, 
    userStats: userStats,
    flashcards: Array // a list of ids to flashcards
}

// FLASHCARD
const fContent = { // more flexible to allow for more customization of cards
    headers: Array, // e.g ["front", "back"] or ["front", "back", "hint"]
    content: Array // e.g ["Mitochondria", "Powerhouse"] or ["Mitochondria", "Powerhouse", "You Know"]
}
const flashcardSchema = {
    content: fContent,
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