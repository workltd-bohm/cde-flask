
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

function sendComment(){
    comment = $('#comment').val();
    project_name = $('#project_name').val();
    parent_id = $('#parent_id').val();
    ic_id = $('#ic_id').val();
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
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });

}