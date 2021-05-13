$(document).ready(function() {
    // bind onclick events

    // calculate height for the dynamic boxes
    setInterval(function() {
        if ($(".activity-comments-container").offset() !== undefined) {
            let someHeight = $(window).height() -
                $(".activity-comments-container").offset().top -
                ($(".activity-menu").css('padding-left')).replace("px", "");
            $(".activity-comments-container").height(someHeight);
        }

        // project conf
        if ($(".activity-project-conf-container").offset() !== undefined) {
            let someHeight = $(window).height() -
                $(".activity-project-conf-container").offset().top -
                $(".btn-update").parent().outerHeight(true)
            $(".activity-project-conf-container").height(someHeight);
        }
    }, 250);

    $("body").on('click', '.activity-collapsible', function() {
        openToggle($(this));
    });

    $("body").on('click', '.activity-tab', function() {
        SwitchTabs($(this));
    });

    $("body").on("change", "#filter-form-project-conf", function() {
        $(".btn-update").addClass("glow");
    });

    $("body").on('click', '.btn-update', function() {
        $(this).removeClass("glow");
    });
});

function OpenActivity(html, head = null, open = true) {
    if (html) {
        ACTIVITY.html(html);
        SwitchTabs($(".activity-tab").first());
    }

    // obsolete (i think x))
    if (head) {
        ACTIVITY_HEAD.html(head);
    } else ACTIVITY_HEAD.style("display", "none");

    if (open) {
        let menu = $(".activity-menu");
        menu.addClass("opened").removeClass("p-0");
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
        $ACTIVITY.parent().addClass("opened");
    }
}

function CloseActivity() {
    $(".activity-menu").removeClass("opened");
}

function HideActivity() {
    let condition = (
        g_project.current_ic.path === "." 
        && g_project.current_ic.overlay_type !== "user" 
        || g_project.current_ic.overlay_type === "search"
    );

    $(".activity-menu").toggleClass("d-none", condition);
}

function ShowActivity() {
    $(".activity-menu").removeClass("d-none");
}

function ClearActivity(close = true) {
    ACTIVITY.html("");
    if (close) {
        $ACTIVITY.parent().removeClass("opened");
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

function getComments() {
    // prevent from firing on user profile or when there is no comment section
    if (!document.getElementById("activity-comments-container")) { return; }

    $.ajax({
        url: "/get_comments",
        type: "POST",
        data: JSON.stringify({
            project_name: SESSION['position'].project_name,
            ic_id: SESSION['position'].ic_id,
            parent_id: SESSION['position'].parent_id,
        }),
        timeout: 10000,
        success: function(data) {
            data = JSON.parse(data);

            let comments = $(".activity-comments-container").children();

            // add only new comments
            for (let i = 0; i < data.length; i++) {
                let id = $.parseHTML(data[i])[0].dataset.id;
                for (let j = 0; j < comments.length; j++) {
                    if (comments[j].dataset.id === id) {
                        delete data[i];
                    }
                }
            }

            for (let i = 0; i < data.length; i++) {
                $(".activity-comments-container").prepend(data[i]);
            }
        }
    });
}

function sendCommentPress() {
    comment = $('#comment').val();
    if (comment.length < 1) { return; } // prevent sending empty comments

    let project_name = $('#project_name').val();
    let parent_id = $('#parent_id').val();
    let ic_id = $('#ic_id').val();
    let div = $('#activity-comments-container');
    let post_id = $('#post_id').val();
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
        timeout: 10000,
        success: function(data) {
            //            input_json = JSON.parse(data);
            //console.log(data);
            div.prepend(data);
            $('#comment').val('');
            div.animate({ scrollTop: "0" });
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function sendComment(el) {
    console.log("sending comment");
    var key = window.event.keyCode;
    if (key != 13)
        return true;
    if (key === 13 && el.shiftKey) {
        return true;
    }
    comment = $('#comment').val();
    if (comment.length < 1) { return; } // prevent sending empty comments

    let project_name = $('#project_name').val();
    let parent_id = $('#parent_id').val();
    let ic_id = $('#ic_id').val();
    let post_id = $('#post_id').val();
    let div = $('#activity-comments-container');
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
        timeout: 10000,
        success: function(data) {
            //            input_json = JSON.parse(data);
            //console.log(data);
            div.prepend(data);
            $('#comment').val('');
            div.animate({ scrollTop: "0" });
            updateCommentSearchBuffer();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });

}

var tmp_comment = "";

function editComment(elem) {
    elem = elem.closest('.activity-comment-box');

    // find editable comment and change it back to last saved tmp comment
    let editmode = document.getElementById('comment-editmode');
    if (editmode) {
        editmode.parentElement.innerHTML = tmp_comment;
    }

    tmp_comment = elem.getElementsByClassName('comment-info')[0].innerHTML;
    let comment = elem.getElementsByClassName('comment-info-text')[0];
    let comment_text = comment.textContent;
    comment.classList.add("d-none");

    let edit_box = document.createElement("textarea");
    edit_box.className = "form-control w-100";
    edit_box.id = "comment-editmode";
    edit_box.onkeypress = function(event) {
        updateComment(event, this);
    }
    elem.getElementsByClassName('comment-info')[0].appendChild(edit_box);
    // elem.getElementsByClassName('comment-info-text')[0].innerHTML =
    //     '<textarea id="comment-editmode" ' +
    //     'onkeypress="updateComment(event, this)"></textarea>';

    // set focus and cursor at the end of the text
    $('#comment-editmode').focus().val(comment_text.trim());
}

function updateComment(el, elem) {
    var key = window.event.keyCode;
    if (key != 13)
        return true;
    if (key === 13 && el.shiftKey) {
        return true;
    }

    // get comment's dataset & comment text element
    elem = elem.closest('.activity-comment-box');
    let dataset = elem.dataset;
    let comment = elem.getElementsByClassName('comment-info-text')[0];

    // get edited comment values and remove editable comment
    let editmode = document.getElementById('comment-editmode');
    let comment_text = editmode.value;
    editmode.remove();

    // prompt to delete if comment submitted is empty
    if (comment_text.length < 1) {
        if (confirm("Delete this comment?")) {
            deleteComment(comment);
        } else {
            // show non-updated comment
            comment.classList.remove("d-none");
        }
        return;
    }

    // update and show the comment
    comment.textContent = comment_text;
    comment.classList.remove("d-none");

    let project_name = $('#project_name').val();
    let parent_id = $('#parent_id').val();
    let ic_id = $('#ic_id').val();
    let div = $('.activity-tab-div-comment');
    let post_id = $('#post_id').val();

    $.ajax({
        url: "/update_comment",
        type: 'POST',
        data: JSON.stringify(project_name ? {
            // project's ics' comment
            project_name: project_name,
            parent_id: parent_id,
            ic_id: ic_id,
            comment_id: dataset.id,
            comment: comment_text,
        } : {
            // marketplace posts' comment
            post_id: post_id,
            comment_id: dataset.id,
            comment: comment_text,
        }),
        timeout: 10000,
        success: function(data) {
            MakeSnackbar(data);
            updateCommentSearchBuffer();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }

            // TODO mark comment with red, as 'not sent'
        }
    });
}

function resetComment() {
    let editmode = document.getElementById('comment-editmode');
    if (editmode) {
        editmode.parentElement.innerHTML = tmp_comment;
    }
}

function deleteComment(elem) {
    elem = elem.closest('.activity-comment-box');

    // data
    project_name = $('#project_name').val();
    parent_id = $('#parent_id').val();
    ic_id = $('#ic_id').val();
    div = $('.activity-tab-div-comment');
    post_id = $('#post_id').val();
    comment_id = elem.dataset.id;

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
        timeout: 10000,
        success: function(data) {
            elem.remove();
            MakeSnackbar(data);
            updateCommentSearchBuffer();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function SwitchTabs(elem) {
    if (!elem) { return; }
    if (elem.hasClass("selected")) { return; }
    $(".activity-tab").removeClass("selected");
    elem.addClass("selected");
    let tab = elem.data("tab");
    $(".activity-box").hide();
    $("#activity-" + tab).fadeIn();


    // TODO
    // show edit-post button only on details tab
    // editPostButton = document.getElementById("edit-post-button");
    // if (target != "details") {
    //     if (editPostButton != null)
    //         editPostButton.style.display = 'none';
    // } else {
    //     if (editPostButton != null)
    //         editPostButton.style.display = 'block';
    // }
}

function AddAccess() {
    /*LoadStart();*/
    let add_username = document.getElementById("access-add-username").value;
    let add_role = document.getElementById("access-add-role").value;
    let add_exp_date = document.getElementById("access-exp-date").value;
    if (add_exp_date == '')
        add_exp_date = 'indefinitely'

    if (!add_username || !add_role) {
        MakeSnackbar("Please fill all required fields");
        return;
    }

    $.ajax({
        url: "/add_access",
        type: 'POST',
        data: JSON.stringify({
            project_name: SESSION['position'].project_name,
            ic_id: SESSION['position'].ic_id,
            parent_id: SESSION['position'].parent_id,
            is_directory: SESSION['position'].is_directory,
            user_name: add_username,
            role: add_role,
            exp_date: add_exp_date
        }),
        timeout: 10000,
        success: function(data) {
            getAccess();
            MakeSnackbar(data);
            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            LoadStop();
            // if ($jqXHR.status == 401) {
            //     location.reload();
            // }
        }
    });
}

function getAccess() {
    let project_name = SESSION['position'].project_name;
    let ic_id = SESSION['position'].ic_id;
    let parent_id = SESSION['position'].parent_id;

    $.ajax({
        url: "/get_access",
        type: "POST",
        data: JSON.stringify({
            project_name: project_name,
            ic_id: ic_id,
            parent_id: parent_id
        }),
        success: function(data) {
            document.getElementById("activity-access").outerHTML = data;
        },
        timeout: 10000,
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            LoadStop();
        }
    });
}

function updateAccessRole(access, role, date) {
    console.log(role);
    $.ajax({
        url: "/update_access",
        type: 'POST',
        data: JSON.stringify({
            project_name: SESSION['position'].project_name,
            ic_id: SESSION['position'].ic_id,
            parent_id: SESSION['position'].parent_id,
            is_directory: SESSION['position'].is_directory,
            old_role: access.role,
            new_role: role,
            exp_date: date,
            user: access.user
        }),
        timeout: 10000,
        success: function(data) {
            getAccess();
            MakeSnackbar(data);
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            LoadStop();
            if ($jqXHR.status == 401) {
                // location.reload();
            }
        }
    });
}

function removeAccess(access) {
    console.log(access);
    if (access.exp_date == '')
        access.exp_date = 'indefinitely'
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
            exp_date: access.exp_date,
            user: access.user
        }),
        timeout: 10000,
        success: function(data) {
            getAccess();
            MakeSnackbar(data);
            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            LoadStop();
            if ($jqXHR.status == 401) {
                location.reload();
            }
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
        timeout: 10000,
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
            if ($jqXHR.status == 401) {
                location.reload();
            }
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
        timeout: 10000,
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
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function PostListPopupResults(obj, json) {
    var sel = document.getElementById('posts');
    PopupClose();
    MarketOpen('Posts', '', ViewPost, [obj, sel.value, json])
}

function openToggle(elem) {
    elem.toggleClass("selected");
}

function updateCommentSearchBuffer() {
    allProjectComments = divWithAllComments.innerHTML;
}

var allProjectComments = null;

function filterDirectoryComments(searchCommentboxText) {
    isClearSearchButtonVisible(true);
    divWithAllComments = document.getElementById("activity-comments-container");

    if (allProjectComments == null)
        updateCommentSearchBuffer();
    else
        divWithAllComments.innerHTML = allProjectComments;


    comments = divWithAllComments.children;
    numOfAtSymbols = searchCommentboxText.split("@").length - 1;
    noSpacesInSearchText = (searchCommentboxText.lastIndexOf(" ") == -1);
    if (numOfAtSymbols == 1 && noSpacesInSearchText) {
        //filter comments from this user
        console.log("showing all comments from " + searchCommentboxText);
        numComments = comments.length;
        whichComment = 0;
        while (whichComment < numComments) {
            username = comments[whichComment].getElementsByClassName("comment-info-user")[0].innerText;
            if (username.toLowerCase() == searchCommentboxText.toLowerCase().substring(1)) //1 to skip @
            {
                whichComment++;
            } else {
                divWithAllComments.removeChild(comments[whichComment]);
                numComments--;
            }
        }
    } else {
        // filter comments for occurrence of search-text substring
        console.log("searching through " + divWithAllComments.childElementCount + " comments");
        numComments = comments.length;
        whichComment = 0;
        while (whichComment < numComments) {
            comment = comments[whichComment].getElementsByClassName("comment-info-text")[0].innerText;
            if (comment.toLowerCase().includes(searchCommentboxText.toLowerCase())) {
                whichComment++;
            } else {
                divWithAllComments.removeChild(comments[whichComment]);
                numComments--;
            }
        }
    }
}

function isClearSearchButtonVisible(isVisible) {
    if (isVisible)
        document.getElementById("resetCommentSearchButton").style.visibility = "visible";
    else
        document.getElementById("resetCommentSearchButton").style.visibility = "hidden";
}

function resetCommentSearch(event) {
    console.log("reset search");
    if (allProjectComments != null) {
        document.getElementById("activity-comments-container").innerHTML = allProjectComments;
        document.getElementById("searchcomments").value = "";
    }
    isClearSearchButtonVisible(false);
}

function isUsernameSuggestionWanted(searchText) {
    // check if user wants username suggestions
    posOfLastAt = searchText.lastIndexOf("@");
    userWantsUsernameSuggestions = (posOfLastAt == 0);
    if (posOfLastAt > 0) {
        userWantsUsernameSuggestions = (searchText.charAt(posOfLastAt - 1) == ' ') &&
            (searchText.substring(posOfLastAt).lastIndexOf(" ") == -1);
    }
    return userWantsUsernameSuggestions;
}

function autocompleteUsername(searchText, idOfInputHtml) {
    if (isUsernameSuggestionWanted(searchText)) {
        $.get("/get_all_users")
            .done(function(data) {
                response_json = JSON.parse(data);
                allUsers = response_json.users;
                console.log("all users in db = " + allUsers);
                autocomplete(document.getElementById(idOfInputHtml), allUsers);
            });
    }
}

var focusIsOnSearch = false;

function searchIfSearchIsActive() {
    if (focusIsOnSearch) {
        searchCommentboxText = $("#searchcomments").val();
        filterDirectoryComments(searchCommentboxText);
    }
}

function serviceCommentSearchQuery(event) {
    // monitor text in the search-comments box after every key-press event
    // if there's an @ symbol with whitespace or nothing before it, db-query all users and display suggestions
    // if user presses enter, filter directory comments using text in the searchbox, and show results
    focusIsOnSearch = true; //global
    keyPressedByUser = window.event.keyCode;
    searchCommentBoxId = "searchcomments";
    searchCommentboxText = $('#' + searchCommentBoxId).val(); //id of search-comments box = "searchcomments"

    if (keyPressedByUser == 38 || keyPressedByUser == 40) // up-down arrow keys
        return true;

    commentsearchAutocompleteDivId = searchCommentBoxId + "autocomplete-list";
    autocompleteDivExists = (document.getElementById(commentsearchAutocompleteDivId) != null);
    autocompleteDivHasOptions = autocompleteDivExists ? (document.getElementById(commentsearchAutocompleteDivId).innerHTML != "") : false;

    switch (keyPressedByUser) {
        case 13: // enter
            if (!autocompleteDivExists || !autocompleteDivHasOptions) {
                filterDirectoryComments(searchCommentboxText);
            }
            break;
        case 27: // escape
            if (autocompleteDivExists) {
                if (autocompleteDivHasOptions) {
                    autocompleteDiv = document.getElementById(commentsearchAutocompleteDivId);
                    autocompleteDiv.innerHTML = "";
                } else
                    resetCommentSearch();
            } else {
                resetCommentSearch();
            }
            break;
        default:
            controlCharacterUpper = 31;
            deleteAscii = 127;
            if ((keyPressedByUser > controlCharacterUpper) && (keyPressedByUser != deleteAscii)) {
                searchCommentboxText += String.fromCharCode(keyPressedByUser);
                autocompleteUsername(searchCommentboxText, searchCommentBoxId);
            } else
                autocompleteUsername(searchCommentboxText, searchCommentBoxId);

            filterDirectoryComments(searchCommentboxText);
            break;
    }

    // if (keyPressedByUser == 13) //enter
    // {
    //     if (!autocompleteDivExists || !autocompleteDivHasOptions) {
    //         filterDirectoryComments(searchCommentboxText);
    //     }
    // } else if (keyPressedByUser == 27) //esc
    // {
    //     if (autocompleteDivExists) {
    //         if (autocompleteDivHasOptions) {
    //             autocompleteDiv = document.getElementById(commentsearchAutocompleteDivId);
    //             autocompleteDiv.innerHTML = "";
    //         } else
    //             resetCommentSearch();
    //     } else {
    //         resetCommentSearch();
    //     }
    // } else {
    //     controlCharacterUpper = 31;
    //     deleteAscii = 127;
    //     if ((keyPressedByUser > controlCharacterUpper) && (keyPressedByUser != deleteAscii)) {
    //         searchCommentboxText += String.fromCharCode(keyPressedByUser);
    //         autocompleteUsername(searchCommentboxText, searchCommentBoxId);
    //     } else
    //         autocompleteUsername(searchCommentboxText, searchCommentBoxId);

    //     filterDirectoryComments(searchCommentboxText);
    // }
}

function commentOnProject(event) {
    focusIsOnSearch = false; //global
    let keyPressedByUser = window.event.keyCode;
    if (keyPressedByUser == 38 || keyPressedByUser == 40) // up-down arrow keys
        return true;

    let commentAutocompleteDivId = "comment" + "autocomplete-list";
    if (keyPressedByUser == 27) //esc key
    {
        if (document.getElementById(commentAutocompleteDivId) != null)
            document.getElementById(commentAutocompleteDivId).innerHTML = "";
    }

    if (keyPressedByUser != 13) {
        commentboxText = $('#comment').val() + String.fromCharCode(keyPressedByUser);
        commentBoxId = "comment";
        autocompleteUsername(commentboxText, commentBoxId);
        return true;
    }

    autocompleteDivNotPresent = (document.getElementById(commentAutocompleteDivId) == null);
    noOptionsInAutocompleteDiv = autocompleteDivNotPresent ? true : (document.getElementById(commentAutocompleteDivId).getElementsByTagName("div").length == 0);
    if (autocompleteDivNotPresent || noOptionsInAutocompleteDiv) {
        event.preventDefault();
        if (!event.shiftKey) {
            sendComment(event);
            document.getElementById("comment").value = ""; //clear after sending
        } else {
            document.getElementById("comment").value += "\n";
        }
    }
}

function autocomplete(inp, arr) {
    var currentFocusHere = -1;
    inp.addEventListener("input", function(e) {
        var a, b, i, searchText = this.value;
        if (!isUsernameSuggestionWanted(searchText)) { return; }
        posOfLastAt = searchText.lastIndexOf("@");
        lookingFor = searchText.substring(posOfLastAt + 1);
        var val = lookingFor;
        closeAllLists();
        if (!val) { return false; }
        currentFocusHere = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items ps-1");
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

                    searchIfSearchIsActive();
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
    document.addEventListener("click", function(e) {
        closeAllLists(e.target);
    });
}

function openDate() {
    var x = document.getElementById("experation-date");
    var y = document.getElementById("permanet");
    var z = document.getElementById("role");
    var i = document.getElementById("button-for-date");
    console.log("t");
    if (x.style.display === "none") {
        x.style.display = "block";
        y.style.display = "none";
        z.style.width = "103%";
        i.style.left = "35px";
    } else {
        x.style.display = "none";
        y.style.display = "block";
        z.style.width = "49%";
        i.style.left = "";
    }
}

var users = [];
function GetUsers(element) {
    // Get The Input Box Text
    let input = element.value;

    // Clear Input And Return If Length Is Zero
    if (!input.length) { 
        users = [];
        ClearInput();
        return;
    }

    // Make A Request If Array Is Empty
    if (!users.length) {
        $.ajax({
            url: '/get_all_users',
            method: 'GET',
            timeout: 10000,
            success: function(data) {
                users = JSON.parse(data)['users'];
                CreateSuggestionDropdown();
            },
            error: function($jqXHR, textStatus, errorThrown) {
                console.log(errorThrown + ": " + $jqXHR.responseText);
                MakeSnackbar($jqXHR.responseText);
                if ($jqXHR.status == 401) {
                    // Handle Failure
                }
            }
        });
    // If Users Are Fetched - Make A Dropdown
    } else {
        CreateSuggestionDropdown();
    }

    function CreateSuggestionDropdown() {
        let user_list = [];
        for (user of users) {
            // Add User To "The List"
            if (user.toLowerCase().startsWith(input.toLowerCase())) {
                user_list.push(user);
            }
        }
        
        // Remove Any Existing
        ClearInput();

        // Create & Style Dropdown Element
        let dropdown = document.createElement("DIV");
        dropdown.id = "autocomplete-dropdown";

        // Iterate Through Results And Create Item For Each
        user_list.forEach((user) => {
            let item = document.createElement("DIV");
            item.className = "autocomplete-result";

            // Add Text To The Item
            let name = document.createElement("SPAN");
            name.textContent = user;
            item.appendChild(name);

            // Autocomplete
            item.onclick = function() {
                element.value = user;
                users = [];
                ClearInput();
            }
            
            // Navigate Through Options
                // ... 

            // Add Item To Dropdown
            dropdown.appendChild(item);
        });

        // Add Dropdown To The Input Group
        element.parentElement.appendChild(dropdown);
    }

    function ClearInput() {
        // Remove Any Existing
        $("#autocomplete-dropdown").remove();
    }
}