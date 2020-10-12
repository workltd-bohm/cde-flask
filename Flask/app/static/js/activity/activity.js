
function OpenActivity(html, head=null, open=true){
  if (html) ACTIVITY.html(html);
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

function CloseActivity(){
    $ACTIVITY.parent().removeClass("opend");
    $ACTIVITY.parent().addClass("closed");
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

function sendComment(el){
    var key = window.event.keyCode;
    if(key != 13)
        return true;
    if (key === 13 && el.shiftKey){
        return true;
    }
    comment = $('#comment').val();
    project_name = $('#project_name').val();
    parent_id = $('#parent_id').val();
    ic_id = $('#ic_id').val();
    div = $('.activity-tab-div-comment');
    console.log(comment);
    $.ajax({
        url: "/send_comment",
        type: 'POST',
        data: JSON.stringify({
            comment: comment,
            project_name: project_name,
            parent_id: parent_id,
            ic_id: ic_id
        }),
        timeout: 5000,
        success: function(data){
//            input_json = JSON.parse(data);
            console.log(data);
            div.append(data);
            $('#comment').val('');
            div.scrollTop(div[0].scrollHeight);
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });

}