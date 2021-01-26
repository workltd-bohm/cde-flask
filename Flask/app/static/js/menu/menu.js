
$( document ).ready(function(){
    $("li").click(function(){
        if ($(this).hasClass("menu-link")){
            if ($(this).attr('href')){
                location.href= $(this).attr("href");
            }
        }
    });

    //d-none
    $(".activity-button").click(function(){
        $(".activity-arrow").toggleClass("d-none");
        $(".activity-menu").toggleClass("opened");
        $("#activity-container").toggleClass("d-none");
    });
    
    $(".menu-fixed > .close").click(function(d){
        $(this).parent().removeClass("opend");
        $(this).parent().addClass("closed");
    });
});