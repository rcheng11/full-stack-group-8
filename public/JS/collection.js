let currCard = null

let request = null
function ajaxDelete(cardId){
    data = {
        cardId : cardId
    }
    if (request != null)
    request.abort();

    request = $.ajax(
    {
        type: 'POST',
        url: "/deleteCard",
        data: data,
        success: ajaxDeleteSuccess
    }
    );
}
function ajaxDeleteSuccess(res){
    if(res == "Card deleted successfully!"){
        $(currCard).parent().parent().hide()
    }
    flashPopUp(res)
}

function cardDelete(e){
    console.log(request)
    ajaxDelete($(e).parent().data("id"))
    currCard = e
}

function triggerEdit(e){
    console.log($(e).parent().data("id"))
}