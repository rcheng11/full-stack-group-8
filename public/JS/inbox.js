function cardSend(e){
    let cardId = $(e).parent().data("id")
    let userId = $("#friend-select").find(":selected").data("id")
    console.log(cardId, userId)
    flashPopUp("Card request successfully sent!")
}