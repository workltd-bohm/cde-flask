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

function editComment(elem) {
    elem.getElementsByClassName('comment-events')[0];
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
    var box=document.getElementById('newpost');
    var changesign= document.getElementById('plus-rotate');
    var renamett= document.getElementById('renametooltip');
    /*box.style.display = 'block';
    changesign.style.transform= "rotate(45deg)";
    renamett.innerHTML= "";*/
    console.log(box.style.display);

    if (box.style.display != 'none' && box.style.display !="") {
        box.style.display = 'none';
        changesign.style.transform= "rotate(90deg)";
        renamett.innerHTML= "Add Access";
    }
    else {
        box.style.display = 'block';
        changesign.style.transform= "rotate(45deg)";
        renamett.innerHTML= "";

    }
}
    




    
    
