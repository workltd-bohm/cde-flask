
$("li[class='menu-link'][href*='/']").click(function(){location.href= $(this).attr("href");});

$(".menu-fixed > .open").click(function(d){
    $(this).parent().addClass("opend");
    $(this).parent().removeClass("closed");
});

$(".menu-fixed > .close").click(function(d){
    $(this).parent().removeClass("opend");
    $(this).parent().addClass("closed");
});