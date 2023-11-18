// SCHEMAS
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
const user = {
    userData: userData,
    userStats: userStats,
    flashcards: Array
}

export function getUser(userData){

}

export function createUser(signupData){
    /* Expects signupData as an object in the form:
    {
        username: String,
        email: String,
        password: String,
        school: String
    }
    */
   userToAdd = {
        userData: signupData,
        userStats: {
            cardsReviewed: 0,
            created: Date.now()
        },
        flashcards: []
   }
   

}

export function addFlashcard(flashcardData){

}