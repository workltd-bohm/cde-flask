
function OpenActivity(html, head=null){
  ACTIVITY.html(html);
    if (head) {
      ACTIVITY_HEAD.html(head);
    }
    else ACTIVITY_HEAD.style("display","none");
    $ACTIVITY.parent().addClass("opend");
    $ACTIVITY.parent().removeClass("closed");
}

function ClearActivity(close=true){
  ACTIVITY.html("");
  if(close){
    $ACTIVITY.parent().removeClass("opend");
    $ACTIVITY.parent().addClass("closed");
  }
}

function AppendActivity(html){
    $ACTIVITY.append(html);
}