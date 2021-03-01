
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
        let menu = $(".activity-menu");
        menu.toggleClass("opened");
        
        menu.hasClass("opened") ? menu.removeClass("p-0") : menu.addClass("p-0");
    });
    
    $(".menu-fixed > .close").click(function(d){
        $(this).parent().removeClass("opend");
        $(this).parent().addClass("closed");
    });

    $(".workspace").on("click", () => {
        $(".context-menu-wrapper").remove();
    });

    document.addEventListener('contextmenu', event => event.preventDefault());
});