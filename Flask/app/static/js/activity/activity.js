
function OpenActivity(html){
    ACTION.html(html);
    $ACTION.parent().addClass("opend");
    $ACTION.parent().removeClass("closed");
}

function ClearActivity(close=true){
  ACTION.html("");
  if(close){
    $ACTION.parent().removeClass("opend");
    $ACTION.parent().addClass("closed");
  }
}

function AppendActivity(html){
    $ACTION.append(html);
}