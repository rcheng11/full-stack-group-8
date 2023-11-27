// helper function
// used for stripping create-entry divs
// of their data
// input a string equal to selector
// check dblib, modeled after fContent for ret data
function getFormData(selector){
    fContent = {
        headers: [],
        content: []
    }
    data = {
        fContent: fContent
    }
    console.log($(selector).children("input"))
    $(selector).children("input").each(function() {
        fContent.headers.push($(this).attr("name"))
        fContent.content.push($(this).val())
    })
    return data
}


$("#create-frontBack").show()
$("#create-btn-frontBack").click(function() {
    $("#card-create").children().hide()
    $("#create-frontBack").show()
})

// ajax request to create a card
// displays success message, or failure message
// requires card type and selector of form
let request = null
function createCard(selector, type){
    data = getFormData(selector)
    data.type = type
    if (request != null)
    request.abort();

    request = $.ajax(
    {
        type: 'POST',
        url: "/create",
        data: data,
        success: cardSuccess
    }
    );
}
function cardSuccess(message){
    $("#popup-message").html(message)
    $("#popup-container").show()
    $("#popup-container").delay(1000).hide(0)
}
$("#frontBack-submit").click(function() {
    createCard("#create-frontBack", "frontBack")
})

// CREATE HINTS AND FILL INS

$("#create-btn-hint").click(function() {
    $("#card-create").children().hide()
    $("#create-hint").show()
})
$("#create-btn-fillIn").click(function() {
    $("#card-create").children().hide()
    $("#create-fillIn").show()
})