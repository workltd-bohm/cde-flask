
function OpenActivity(html, head=null, open=true){
  ACTIVITY.html(html);
    if (head) {
      ACTIVITY_HEAD.html(head);
    }
    else ACTIVITY_HEAD.style("display","none");
    if(open){
      $ACTIVITY.parent().addClass("opend");
      $ACTIVITY.parent().removeClass("closed");
    }
}

function ExtractActivity(html=null, head=null, open=true){
    if(html){
        ACTIVITY.html(html);
    }
    if (head) {
      ACTIVITY_HEAD.html(head);
    }
    else ACTIVITY_HEAD.style("display","none");
    if(open){
      $ACTIVITY.parent().addClass("opend");
      $ACTIVITY.parent().removeClass("closed");
    }
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

function AppendActivityTab(parent, child){
    parent.append(child);
}

function ClearActivityTab(parent){
    parent.html('');
}