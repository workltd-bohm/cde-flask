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
    if (comment.length < 1) { return; } // prevent sending empty comments

    project_name = $('#project_name').val();
    parent_id = $('#parent_id').val();
    ic_id = $('#ic_id').val();
    div = $('.activity-tab-div-comment');
    post_id = $('#post_id').val();
    console.log(comment);

    $.ajax({
        url: "/send_comment",
        type: 'POST',
        data: JSON.stringify(project_name ? {
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
        '<textarea id="comment-editmode" ' +
        'onkeypress="updateComment(event, this.parentElement.parentElement.parentElement.parentElement.dataset)">' +
        "</textarea>";

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

    if (comment.length < 1) {
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
        data: JSON.stringify(project_name ? {
            comment: comment,
            project_name: project_name,
            parent_id: parent_id,
            ic_id: ic_id,
            comment_id: dataset.id,
            comment: comment,
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

function resetComment() {
    let editmode = document.getElementById('comment-editmode');
    if (editmode) {
        editmode.parentElement.innerHTML = tmp_comment;
    }
}

function deleteComment(elem) {
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
        data: JSON.stringify(project_name ? {
            comment: comment,
            project_name: project_name,
            parent_id: parent_id,
            ic_id: ic_id,
            comment_id: comment_id
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
    console.log(access);
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
    var sel = document.getElementById('posts');
    PopupClose();
    MarketOpen('Posts', '', ViewPost, [obj, sel.value, json])
}

function openToggleAccess() {
    var box = document.getElementById('access-box');
    if (box.style.display != 'none' && box.style.display != "") {
        box.style.display = 'none';
    } else {
        box.style.display = 'block';
    }
}

function openToggleInfoTags() {
    var tags = document.getElementById('tags');
    console.log(tags);
    if (tags.style.display != 'none' && tags.style.display != "") {
        tags.style.display = 'none';

    } else {
        tags.style.display = 'block';
    }
}

function openToggleInfoIC() {
    var ic = document.getElementById('ic');
    console.log(tags);
    if (ic.style.display != 'none' && ic.style.display != "") {
        ic.style.display = 'none';

    } else {
        ic.style.display = 'block';
    }
}

function openToggleInfoHistory() {
    var history = document.getElementById('history');
    console.log(tags);
    if (history.style.display != 'none' && history.style.display != "") {
        history.style.display = 'none';

    } else {
        history.style.display = 'block';
    }
}

function filterDirectoryComments(searchCommentboxText)
{
    console.log("TODO@pamir: filterDirectoryComments");
    numOfAtSymbols = searchCommentboxText.split("@").length - 1;
    noSpacesInSearchText = (searchCommentboxText.lastIndexOf(" ") == -1);
    if (numOfAtSymbols == 1 && noSpacesInSearchText)
    {
        //filter comments from this user

    }
    else
    {
        // filter comments for occurrence of search-text substring
    }
}

function isUsernameSuggestionWanted(searchText)
{
    // check if user wants username suggestions
    posOfLastAt = searchText.lastIndexOf("@");
    userWantsUsernameSuggestions = (posOfLastAt==0);
    if (posOfLastAt > 0)
    {
        userWantsUsernameSuggestions = (searchText.charAt(posOfLastAt-1)==' ') &&
                                        (searchText.substring(posOfLastAt).lastIndexOf(" ") == -1);
    }    
    return userWantsUsernameSuggestions;
}

function autocompleteUsername(searchText, idOfInputHtml)
{
    if (isUsernameSuggestionWanted(searchText))
    {
        $.get( "/get_all_users")
        .done(function(data) {
            response_json = JSON.parse(data);
            allUsers = response_json.users;
            console.log("all users in db = " + allUsers);
            autocomplete(document.getElementById(idOfInputHtml), allUsers);
        });
    } 
}

function serviceCommentSearchQuery(event)
{
    // monitor text in the search-comments box after every key-press event
    // if there's an @ symbol with whitespace or nothing before it, db-query all users and display suggestions
    // if user presses enter, filter directory comments using text in the searchbox, and show results
    let keyPressedByUser = window.event.keyCode;
    let searchCommentBoxId = "seachcomments";
    let searchCommentboxText = $('#'+ searchCommentBoxId).val(); //id of search-comments box = "searchcomments"

    if(keyPressedByUser == 38 || keyPressedByUser == 40) // up-down arrow keys
        return true;

    let enterKeyAscii = 13;
    if (keyPressedByUser == enterKeyAscii)
    {
        commentsearchAutocompleteDivId = "seachcomments" + "autocomplete-list";
        if(document.getElementById(commentsearchAutocompleteDivId)== null || 
        document.getElementById(commentsearchAutocompleteDivId).getElementsByTagName("div").length == 0)
        {
            filterDirectoryComments(searchCommentboxText);
        }
    }
    else
    {
        controlCharacterUpper = 31;
        deleteAscii = 127;
        if ((keyPressedByUser > controlCharacterUpper) && (keyPressedByUser != deleteAscii))
        {
            searchCommentboxText += String.fromCharCode(keyPressedByUser);
            autocompleteUsername(searchCommentboxText, searchCommentBoxId);
        }
        else
            autocompleteUsername(searchCommentboxText, searchCommentBoxId);
    }
}

function commentOnProject(event)
{
    let keyPressedByUser = window.event.keyCode;
    if(keyPressedByUser == 38 || keyPressedByUser == 40) // up-down arrow keys
        return true;

    if (keyPressedByUser != 13)
    {
        commentboxText = $('#comment').val() + String.fromCharCode(keyPressedByUser);
        commentBoxId = "comment";
        autocompleteUsername(commentboxText, commentBoxId);
        return true;
    }
    commentAutocompleteDivId = "comment" + "autocomplete-list";
    if(document.getElementById(commentAutocompleteDivId)== null || 
    document.getElementById(commentAutocompleteDivId).getElementsByTagName("div").length == 0)
    {
        sendComment(event);
    }
}

function autocomplete(inp, arr) {
    var currentFocusHere = -1;
    inp.addEventListener("input", function(e) {
        var a, b, i, searchText = this.value;
        if(!isUsernameSuggestionWanted(searchText)) { return;}
        posOfLastAt = searchText.lastIndexOf("@");
        lookingFor = searchText.substring(posOfLastAt+1);
        var val = lookingFor;
        closeAllLists();
        if (!val) { return false;}
        currentFocusHere = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        for (i = 0; i < arr.length; i++) {
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            b = document.createElement("DIV");
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            b.addEventListener("click", function(e) {
                newText = searchText.substring(0, posOfLastAt) + "@" + this.getElementsByTagName("input")[0].value;
                inp.value = newText;
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          currentFocusHere++;
          addActive(x);
        } else if (e.keyCode == 38) {
          currentFocusHere--;
          addActive(x);
        } else if (e.keyCode == 13) {
          e.preventDefault();
          if (currentFocusHere > -1) {
            if (x) x[currentFocusHere].click();
          }
        }
    });
    function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocusHere >= x.length) currentFocusHere = 0;
      if (currentFocusHere < 0) currentFocusHere = (x.length - 1);
      x[currentFocusHere].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }
