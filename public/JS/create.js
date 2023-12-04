// helper function
// used for stripping create-entry divs
// of their data
// input a string equal to selector
// check dblib, modeled after fContent for ret data
function getFormData(selector){
    fContent = {}
    data = {
        fContent: fContent
    }
    $(selector).find("input").each(function() {
        fContent[$(this).attr("name")] = $(this).val()
    })
    console.log(fContent)
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
    $("#frontBack-front, #frontBack-back").val("") 
    flashPopUp(message)
}
$("#frontBack-submit").click(function() {
    createCard("#create-frontBack", "frontBack")
})
$("#frontBack-front, #frontBack-back").on("keypress", function(e) {
    if(e.which == 13){
        createCard("#create-frontBack", "frontBack")
    }
})
$("#fillIn-submit").click(function() {
    createCard("#create-fillIn", "fillIn")
})
$("#fillin-content").on("keypress", function(e) {
    if(e.which == 13){
        createCard("#create-fillIn", "fillIn")
    }
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

// PREVIEW MANAGEMENT
$("#frontBack-front").on("input", function(){
    $("#frontBack-exFront").html($("#frontBack-front").val())
})
$("#frontBack-back").on("input", function(){
    $("#frontBack-exBack").html($("#frontBack-back").val())
})
$("#fillin-content").on("input", function() {
    $("#fillin-ex").html(generateFillInHTML($("#fillin-content").val()))
})