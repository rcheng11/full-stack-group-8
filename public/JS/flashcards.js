// FLASHCARD NEXT EVENT

function animate_fc_exit(flashcard){
    props = { borderSpacing: 90 }
    opts = {
        step : function(now, fx){
            console.log(now)
            $(fx.elem).css('rotate', now+'deg');
            $(fx.elem).css('left', (now/90) * 80 +'%');
            $(fx.elem).css('top', (now/90) * 60 +'%');

            if(now == fx.end){
                $(fx.elem).hide()
            }
            if(now == fx.end){
                $(fx.elem).hide()
            }
        }
    }
    flashcard.animate(props, options=opts)
}

$(".flashcard-button-next").click(function() {
    curr_flashcard = $(".flashcard-list").find(".shown")
    animate_fc_exit(curr_flashcard)
    console.log("next clicked")
})
$(".flashcard-button-prev").click(function() {
    console.log("prev clicked")
})

// FLASHCARD FLIP ON CLICK EVENT
$(".flashcard").click(function() {
    front = $(this).find(".flashcard-front")
    back = $(this).find(".flashcard-back")

    props = { borderSpacing: -180 }
    opts = {
        step: function(now, fx) {
        $(fx.elem).css('transform','rotateY('+now+'deg)');
        $(fx.elem).children().hide();
        console.log(now)
        if(fx.start == now){
            $(fx.elem).children().hide()
        }
        else if(fx.end == now){
            $(fx.elem).children().show()
        }
    }}
    on_complete = function(front, back) {
        if( front.hasClass("hidden") ){
            front.css("transform", "rotateY(180deg)")
            back.addClass("hidden")
            front.removeClass("hidden")
        }
        else if( back.hasClass("hidden") ){
            back.css("transform", "rotateY(180deg)")
            front.addClass("hidden")
            back.removeClass("hidden")
        }
    }

    $(this).animate(props, options=opts, complete=on_complete(front, back))

})