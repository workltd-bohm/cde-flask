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
        PopupOpen(NewFolder, SESSION['position']);
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
            LoadStop();
            location.reload();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            LoadStop();
        }
    });
}