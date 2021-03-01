
$( document ).ready(function(){
    $("li").click(function(){
        if ($(this).hasClass("menu-link")){
            if ($(this).attr('href')){
                location.href= $(this).attr("href");
            }
        }
    });

    // activity button functionality
    $(".activity-button").click(function(){
        // set activity to open
        let menu = $(".activity-menu").toggleClass("opened");       
        
        // add padding to activity when opened (by default it displays when closed) 
        menu.hasClass("opened") ? menu.removeClass("p-0") : menu.addClass("p-0");
    });

    // when clicked on workspace, remove right click menu
    $(".workspace").on("click", () => {
        $(".context-menu-wrapper").remove();
    });

    // disable right click
    document.addEventListener('contextmenu', event => event.preventDefault());
});