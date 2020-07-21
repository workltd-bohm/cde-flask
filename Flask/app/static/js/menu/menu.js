
$("li[class='menu-link'][href*='/']").click(function(){location.href= $(this).attr("href");});