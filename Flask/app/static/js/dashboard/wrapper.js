
// -------------------------------------------------------

$( document ).ready(function(){
    WrapCreateProject();
});

// -------------------------------------------------------

function WrapCreateProject(){
    ClearProject();

    // $.get( "/get_project")
    //     .done(function( data ) {
    //         data = JSON.parse(data);
    //         if(data){
    //             DashboardCreate([data.root_ic]);
    //             PathCreation([data.root_ic]);
    //         }
    //     })
    //     .fail(function($jqXHR, textStatus, errorThrown){
    //         console.log( errorThrown + ": " + $jqXHR.responseText );
    //     });
    $.ajax({
        url: "/get_project",
        type: 'POST',
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                DashboardCreate([data.json.root_ic], data.project_position);
                PathCreation([data.json.root_ic]);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function WrapCreateFolder(data){
    var tmp = data.values.data;
    console.log(tmp);
    PopupOpen(NewFolder, tmp);
}

function WrapCreateFile(data){
    var tmp = data.values.data;
    console.log(tmp);
    PopupOpen(NewFile, tmp);
}

function WrapRename(data){
    var tmp = data.values.data;
    console.log(tmp);
    PopupOpen(RenameFile, tmp);
}

function WrapDelete(data){
    var tmp = data.values.data;
    console.log(tmp);
    PopupOpen(DeleteFile, tmp);
}

function WrapMove(data){
    
}

function WrapShare(data){
    var tmp = data.values.data;

    var dummy = document.createElement('input'),
    text = window.location.href + 'get_file/' + tmp.name + tmp.type;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    MakeSnackbar("Copied to clipboard");
    
}

function WrapDownload(data){
    var tmp = data.values.data;

    DownloadFile(tmp.name + tmp.type)
}

// -------------------------------------------------------
