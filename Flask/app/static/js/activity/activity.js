function OpenActivity(html, head = null, open = true) {
    if (html) ACTIVITY.html(html);
    if (head) {
        ACTIVITY_HEAD.html(head);
    } else ACTIVITY_HEAD.style("display", "none");
    if (open) {
        $ACTIVITY.parent().addClass("opend");
        $ACTIVITY.parent().removeClass("closed");
    }
}

function ExtractActivity(html = null, head = null, open = true) {
    if (html) {
        ACTIVITY.html(html);
    }
    if (head) {
        ACTIVITY_HEAD.html(head);
    } else ACTIVITY_HEAD.style("display", "none");
    if (open) {
        $ACTIVITY.parent().addClass("opend");
        $ACTIVITY.parent().removeClass("closed");
    }
}

function CloseActivity() {
    $ACTIVITY.parent().removeClass("opend");
    $ACTIVITY.parent().addClass("closed");
}

function ClearActivity(close = true) {
    ACTIVITY.html("");
    if (close) {
        $ACTIVITY.parent().removeClass("opend");
        $ACTIVITY.parent().addClass("closed");
    }
}

function AppendActivity(html) {
    $ACTIVITY.append(html);
}

function AppendActivityTab(parent, child) {
    parent.append(child);
}

function ClearActivityTab(parent) {
    parent.html('');
}

function sendComment(el) {
    var key = window.event.keyCode;
    if (key != 13)
        return true;
    if (key === 13 && el.shiftKey) {
        return true;
    }

    comment = $('#comment').val();
    if (comment.length < 1) {return; }  // prevent sending empty comments

    project_name = $('#project_name').val();
    parent_id = $('#parent_id').val();
    ic_id = $('#ic_id').val();
    div = $('.activity-tab-div-comment');
    post_id = $('#post_id').val();
    console.log(comment);

    $.ajax({
        url: "/send_comment",
        type: 'POST',
        data: JSON.stringify(project_name ? 
            {
                comment: comment,
                project_name: project_name,
                parent_id: parent_id,
                ic_id: ic_id
            } : {
                comment: comment,
                post_id: post_id
            }),
        timeout: 5000,
        success: function(data) {
            //            input_json = JSON.parse(data);
            //console.log(data);
            div.prepend(data);
            $('#comment').val('');
            //div.scrollTop(div[0].scrollHeight);
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });

}

var tmp_comment = "";

function editComment(elem) {
    let editmode = document.getElementById('comment-editmode');
    if (editmode) {
        editmode.parentElement.innerHTML = tmp_comment;
    }
    
    tmp_comment = elem.getElementsByClassName('comment-inline')[0].innerHTML;
    let comment_text = elem.getElementsByClassName('comment-events')[0].innerHTML;

    elem.getElementsByClassName('comment-inline')[0].innerHTML = 
        '<textarea id="comment-editmode" ' 
        + 'onkeypress="updateComment(event, this.parentElement.parentElement.parentElement.parentElement.dataset)">' 
        + "</textarea>";

    $('#comment-editmode').focus().val(comment_text.trim());
}

function updateComment(el, dataset) {
    var key = window.event.keyCode;
    if (key != 13)
        return true;
    if (key === 13 && el.shiftKey) {
        return true;
    }

    let editmode = document.getElementById('comment-editmode');
    let parent = editmode.parentElement;
    let comment = editmode.value;

    if (comment.length < 1){
        // prompt to delete
    }

    console.log(dataset['id']);
    project_name = $('#project_name').val();
    parent_id = $('#parent_id').val();
    ic_id = $('#ic_id').val();
    div = $('.activity-tab-div-comment');
    post_id = $('#post_id').val();

    $.ajax({
        url: "/update_comment",
        type: 'POST',
        data: JSON.stringify(project_name ? 
            {
                comment: comment,
                project_name: project_name,
                parent_id: parent_id,
                ic_id: ic_id
            } : {
                post_id: post_id,
                comment_id: dataset.id,
                comment: comment,
            }),
        timeout: 5000,
        success: function(data) {
            //            input_json = JSON.parse(data);
            //console.log(data);
            // div.prepend(data);
            // $('#comment').val('');
            //div.scrollTop(div[0].scrollHeight);
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });

    parent.innerHTML = tmp_comment;
    
    parent.getElementsByClassName('comment-events')[0].innerHTML = comment;
}

function resetComment(){
    let editmode = document.getElementById('comment-editmode');
    if (editmode) {
        editmode.parentElement.innerHTML = tmp_comment;
    }
}

function deleteComment(elem){
    project_name = $('#project_name').val();
    parent_id = $('#parent_id').val();
    ic_id = $('#ic_id').val();
    div = $('.activity-tab-div-comment');
    post_id = $('#post_id').val();
    comment_id = elem.dataset.id;
    console.log(elem);

    $.ajax({
        url: "/delete_comment",
        type: 'POST',
        data: JSON.stringify(project_name ? 
            {
                comment: comment,
                project_name: project_name,
                parent_id: parent_id,
                ic_id: ic_id
            } : {
                post_id: post_id,
                comment_id: comment_id
            }),
        timeout: 5000,
        success: function(data) {
            elem.remove();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });
}

function AddAccess() {
    LoadStart();
    $.ajax({
        url: "/add_access",
        type: 'POST',
        data: JSON.stringify({
            project_name: SESSION['position'].project_name,
            ic_id: SESSION['position'].ic_id,
            parent_id: SESSION['position'].parent_id,
            is_directory: SESSION['position'].is_directory,
            user_name: document.getElementById('user_name').value,
            role: $("#role option:selected").text()
        }),
        timeout: 5000,
        success: function(data) {
            MakeSnackbar(data);
            LoadStop();
            location.reload();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            LoadStop();
        }
    });
}

function removeAccess(access) {
    LoadStart();
    $.ajax({
        url: "/remove_access",
        type: 'POST',
        data: JSON.stringify({
            project_name: SESSION['position'].project_name,
            ic_id: SESSION['position'].ic_id,
            parent_id: SESSION['position'].parent_id,
            is_directory: SESSION['position'].is_directory,
            role: access.role,
            user: access.user
        }),
        timeout: 5000,
        success: function(data) {
            MakeSnackbar(data);
            LoadStop();
            location.reload();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            LoadStop();
        }
    });
}

function addLink(el) {
    var key = window.event.keyCode;
    if (key != 13)
        return true;
    if (key === 13 && el.shiftKey) {
        return true;
    }
    link = $('#3d-view-link').val();
    console.log(link);
    $.ajax({
        url: "/load_viewer",
        type: 'POST',
        data: JSON.stringify({
            link: link
        }),
        timeout: 5000,
        success: function(data) {
            input_json = JSON.parse(data);
            console.log(input_json);
            OpenViewer(input_json['html'], input_json['data']);
            $('#3d-view-link').val('');
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });

}

function OpenPostListPopup(json) {
    PopupOpen(PostList, json);
}

function PostList(form, json) {
    LoadStart();
    $.ajax({
        url: "/get_my_posts_popup",
        type: 'POST',
        data: JSON.stringify(json),
        timeout: 5000,
        success: function(data) {
            input_json = JSON.parse(data);
            html = input_json['html'];
            form.empty();
            form.append(html);
            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });
}

function PostListPopupResults(obj, json) {
    PopupClose();
    var sel = document.getElementById('posts');
    MarketGet('Posts', EditPost, [obj, sel.value, json])
}

function openToggleAccess() {
    var box=document.getElementById('access-box');
    if (box.style.display != 'none' && box.style.display !="") {
        box.style.display = 'none';
    }
    else {
        box.style.display = 'block';
    }
}

function openToggleInfoTags() {
    var tags=document.getElementById('tags');
    console.log(tags);
    if (tags.style.display != 'none' && tags.style.display !="") {
        tags.style.display = 'none';
        
    }
    else {
        tags.style.display = 'block';
    }
}

function openToggleInfoIC() {
    var ic=document.getElementById('ic');
    console.log(tags);
    if (ic.style.display != 'none' && ic.style.display !="") {
        ic.style.display = 'none';
        
    }
    else {
        ic.style.display = 'block';
    }
}

function openToggleInfoHistory() {
    var history=document.getElementById('history');
    console.log(tags);
    if (history.style.display != 'none' && history.style.display !="") {
        history.style.display = 'none';
        
    }
    else {
        history.style.display = 'block';
    }
}


    




    
    
