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


    




    
    
