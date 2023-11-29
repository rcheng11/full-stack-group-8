function flashPopUp(message){
    $("#popup-message").html(message)
    $("#popup-container").show()
    $("#popup-container").delay(1000).hide(0)
    console.log("flash")
}