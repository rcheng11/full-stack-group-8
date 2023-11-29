// FLASHCARD NEXT EVENT

function animate_fc_exit(flashcard, direction){
    side = ""
    rotation_constant = ""
    $(flashcard).removeAttr("style")
    $(flashcard).find(".flashcard-contents").removeAttr("style")

    if (direction == "right"){
        side = "left"
        rotation_constant = ""
    }
    else if (direction == "left"){
        side = "right"
        rotation_constant = "-"
    }

    props = { borderSpacing: 90 }
    opts = {
        step : function(now, fx){
            $(fx.elem).css('rotate', rotation_constant+now+'deg');
            $(fx.elem).css(side, (now/90) * 80 +'%');
            $(fx.elem).css('top', (now/90) * 60 +'%');

            if(now == fx.end){
                $(fx.elem).hide()
                $(fx.elem).removeClass("shown")
                $(fx.elem).addClass("in-deck")
                $(fx.elem).removeAttr("style")

                $(fx.elem).find(".flashcard-front").removeClass("hidden")
                $(fx.elem).find(".flashcard-back").addClass("hidden")
            }
        }
    }
    flashcard.animate(props, options=opts, duration=1000)
}
function animate_fc_enter(flashcard, direction){
    $(flashcard).show()
    $(flashcard).css("transform", "none")
    $(flashcard).css("border-spacing", "0")
    $(flashcard).css("display", "flex")

    side = ""
    rotation_constant = ""

    if (direction == "right"){
        side = "left"
        rotation_constant = ""
    }
    else if (direction == "left"){
        side = "right"
        rotation_constant = "-"
    }

    props = { borderSpacing: 90 }
    opts = {
        step : function(now, fx){
            frame = 90 - now
            $(fx.elem).css('rotate', rotation_constant+frame+'deg');
            $(fx.elem).css(side, (frame/90) * 80 +'%');
            $(fx.elem).css('top', (frame/90) * 60 +'%');

            if(now == fx.end){
                $(fx.elem).removeClass("in-deck")
                $(fx.elem).addClass("shown")
                $(fx.elem).removeAttr("style")
            }
        }
    }
    flashcard.animate(props, options=opts)
}

// DECK BUTTONS

$(".flashcard-button-prev").click(function() {
    curr_flashcard = $(".flashcard-list").find(".shown")
    next_flashcard = curr_flashcard.prev()
    if(next_flashcard.length > 0){
        $(".flashcard-button-next").removeAttr("disabled")
        animate_fc_exit(curr_flashcard, "right")
        setTimeout(() => animate_fc_enter(next_flashcard, "left"), 400)
        if(next_flashcard.prev().length == 0){
            $(".flashcard-button-prev").attr("disabled", "true")
        }
    }
})
$(".flashcard-button-next").click(function() {
    curr_flashcard = $(".flashcard-list").find(".shown")
    next_flashcard = curr_flashcard.next()
    console.log(next_flashcard)
    if(next_flashcard.length > 0){
        $(".flashcard-button-prev").removeAttr("disabled")
        animate_fc_exit(curr_flashcard, "left")
        setTimeout(() => animate_fc_enter(next_flashcard, "right"), 400)
        if(next_flashcard.next().length == 0){
            $(".flashcard-button-next").attr("disabled", "true")
        }
    }
})

// FLASHCARD FLIP ON CLICK EVENT
$(".flashcard").click(function() {
    $(this).css("border-spacing", "0")
    front = $(this).find(".flashcard-front")
    back = $(this).find(".flashcard-back")

    props = { borderSpacing: -180 }
    opts = {
        step: function(now, fx) {
        $(fx.elem).css('transform','rotateY('+now+'deg)');
        $(fx.elem).children().hide();
        if(fx.start == now){
            $(fx.elem).children().hide()
        }
        else if(fx.end == now){
            $(fx.elem).children().show()
        }
    }}

    on_complete = function(front, back) {
        // if back is shown
        if( front.hasClass("hidden") ){
            back.addClass("hidden")
            front.removeClass("hidden")
        }
        // if front is shown
        else if( back.hasClass("hidden") ){
            back.css("transform", "none")
            front.addClass("hidden")
            back.removeClass("hidden")
        }
        // if back shown flip
        if(front.hasClass("hidden")){
            front.parent().css("transform", "rotateY(180deg)")
        }
    }

    $(this).animate(props, options=opts, complete=on_complete(front, back))

})