$(window).keydown(function(e){
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 70) {
        e.preventDefault();
        $('#terminal-input').focus();
//        get_help_suggest();
    }
    else{
        terInput = $('#terminal-input').val();
        key = e.key;
        if(((e.shiftKey || e.metaKey) && e.keyCode === 51) || ((terInput + key) == 'tag ')){
            console.log(e);
            console.log(e.keyCode);
            console.log($('#terminal-input').val() + e.key);

//            getTags();
        }else{
//            get_help_suggest();
        }

    }
});

function terminalListen(el){
    var key = window.event.keyCode;
    if(key != 13)
        return true;
    if (key === 13 && el.shiftKey){
        return true;
    }
    terminal = $('#terminal-input').val().split(' ');

    $('#terminal-input').val('');

    console.log(terminal);
    console.log(SESSION);

    if(terminal[0] == 'new_folder'){
        if(terminal.length > 1){
            args = {parent_id: SESSION['position'].parent_id,
                    ic_id: SESSION['position'].ic_id,
                    project_name: SESSION['position'].project_name,
                    parent_path: SESSION['position'].path,
                    new_name: terminal[1]
                    }
            FormSubmit('create_dir', args, true, CreateProject);
        }else{
            PopupOpen(NewFolder, SESSION['position']);
        }

    }
    if(terminal[0] == 'create_file'){
        OpenFileDialog(SESSION['position'])
    }
    if(terminal[0] == 'open'){
        if(SESSION['position'].is_directory){
            OpenFilterActivity(SESSION['position'], open);
        }else{
            PreviewOpen(OpenFile, SESSION['position'], null, open);
        }
    }
    if(terminal[0] == 'rename'){
        PopupOpen(RenameFile, SESSION['position']);
    }
    if(terminal[0] == 'help'){
        PopupOpen(Help);
    }
    if(terminal[0] == 'tag'){
        console.log(terminal);
        console.log(SESSION);
        addTag(terminal);
    }


}

function RemoveLastDirectoryPartOf(the_url)
{
    var the_arr = the_url.split('/');
    the_arr.pop();
    return( the_arr.join('/') );
}

function Help(form){
    LoadStart();
    $.get( "/get_help")
        .done(function( data ) {
            input_json = JSON.parse(data);
            html = input_json['html'];
            form.empty();
            form.append(html);
            LoadStop();
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
            PopupClose();
        });
}

function getTags(){
    $.get( "/get_all_tags")
        .done(function( data ) {
            input_json = JSON.parse(data);
            autocomplete(document.getElementById("terminal-input"), input_json['data']);
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
        });
}

function get_help_suggest(){
    $.get( "/get_help_suggest")
        .done(function( data ) {
            input_json = JSON.parse(data);
            console.log(input_json['data']);
//            autocomplete(document.getElementById("terminal-input"), input_json['data']);
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
        });
}

function addTag(terminal){
    LoadStart();
    $.ajax({
        url: "/add_tag",
        type: 'POST',
        data: JSON.stringify({
            project_name: SESSION['position'].project_name,
            ic_id: SESSION['position'].ic_id,
            parent_id: SESSION['position'].parent_id,
            is_directory: SESSION['position'].is_directory,
            tags: terminal
        }),
        timeout: 5000,
        success: function(data){
            MakeSnackbar(data);
            LoadTag(terminal);
            LoadStop();

//            location.reload();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            LoadStop();
        }
    });
}

function addTagListen(el){
    var key = window.event.keyCode;
    if(key != 13)
        return true;
    if (key === 13 && el.shiftKey){
        return true;
    }
    terminal = $('#add-tag').val().split(' ');

    $('#add-tag').val('');
    if(terminal[0] != "Tag"){
        terminal.unshift("Tag");
    }
    addTag(terminal);
}

function removeTag(tagName){
    LoadStart();
    $.ajax({
        url: "/remove_tag",
        type: 'POST',
        data: JSON.stringify({
            project_name: SESSION['position'].project_name,
            ic_id: SESSION['position'].ic_id,
            parent_id: SESSION['position'].parent_id,
            is_directory: SESSION['position'].is_directory,
            tag: tagName
        }),
        timeout: 5000,
        success: function(data){
            MakeSnackbar(data);
            LoadStop();
            t = document.getElementById(tagName);
            t.parentNode.removeChild(t);
//            location.reload();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            LoadStop();
        }
    });
}

function LoadTag(terminal){
    activityTagContainer = document.getElementById('activity-tag-container');
    for(i=1; i<terminal.length; i++){
        if(terminal[i].startsWith('#')){
            var tag = terminal[i];
            var color = 'white';
            if(i < terminal.length-1){
                if(!terminal[i+1].startsWith('#')){
                    color = terminal[i+1];
                    i++;
                }
            }

            activityTagContainer.style.cssText = "display: inline;";

            tagContainer = document.createElement("div");
            tagContainer.className = "tag-container";
            tagContainer.id = tag;

            tagDiv = document.createElement("div");
            tagDiv.className = "tag";
            tagDiv.style.cssText = "background-color: " + color + ";";

            tagI = document.createElement("i");
            var iColor = 'white;';
            if(color == 'white'){
               iColor = 'black;';
            }
            tagI.style.cssText = "color: " + iColor + ";";
            tagI.innerHTML = tag;

            tagSpan = document.createElement("span");
            tagSpan.className = "remove-tag";
            tagSpan.onclick = function(){
                removeTag(tag);
            };
            tagSpan.innerHTML = 'x';
//            tagSpan.style.cssText = "display: none;";

            tagDiv.appendChild(tagI);
            tagContainer.appendChild(tagDiv);
            tagContainer.appendChild(tagSpan);

            activityTagContainer.appendChild(tagContainer);
        }
    }


}