$("#incoming-button").click(function() {
    $("#inbox-incoming-container").show()
    $("#inbox-send-container").hide()
})
$("#send-button").click(function() {
    $("#inbox-incoming-container").hide()
    $("#inbox-send-container").show()
})

// USED FOR SENDING CARDS
let request = null
function ajaxCardSend(cardId, friendId){
    data = {
        cardId : cardId,
        friendId : friendId
    }
    if (request != null)
    request.abort();

    request = $.ajax(
    {
        type: 'POST',
        url: "/sendCard",
        data: data,
        success: ajaxCardSendSuccess
    }
    );
}
function ajaxCardSendSuccess(res){
    flashPopUp(res)
}
function cardSend(e){
    let cardId = $(e).parent().data("id")
    let friendId = $("#friend-select").find(":selected").data("id")
    ajaxCardSend(cardId, friendId)
    
}
// USED FOR ADDING A CARD FROM INBOX

// USED FOR REJECTING A CARD FROM INBOX
let currCard = null
function ajaxCardReject(cardId){
    data = {
        cardId : cardId
    }
    if (request != null)
    request.abort();

    request = $.ajax(
    {
        type: 'POST',
        url: "/cardReject",
        data: data,
        success: ajaxCardRejectSuccess
    }
    );
}
function ajaxCardRejectSuccess(res){
    flashPopUp(res)
    $(currCard).parent().parent().hide()
}
function cardReject(e){
    let cardId = $(e).parent().data("id")
    currCard = e
    ajaxCardReject(cardId)
    
}

function ajaxCardAccept(cardId){
    data = {
        cardId : cardId
    }
    if (request != null)
    request.abort();

    request = $.ajax(
    {
        type: 'POST',
        url: "/cardAccept",
        data: data,
        success: ajaxCardAcceptSuccess
    }
    );
}
function ajaxCardAcceptSuccess(res){
    flashPopUp(res)
    $(currCard).parent().parent().hide()
}
function cardAccept(e){
    let cardId = $(e).parent().data("id")
    currCard = e
    ajaxCardAccept(cardId)
    
}