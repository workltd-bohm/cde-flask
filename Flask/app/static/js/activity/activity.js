
function OpenActivity(html){
    ACTION.html(html);
    $ACTION.parent().addClass("opend");
    $ACTION.parent().removeClass("closed");
}

function ClearActivity(html){
  ACTION.html("");
  $ACTION.parent().removeClass("opend");
  $ACTION.parent().addClass("closed");
}