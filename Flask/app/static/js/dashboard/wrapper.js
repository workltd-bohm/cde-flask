
// -------------------------------------------------------

$( document ).ready(function(){
    WrapCreateProject();
});

// -------------------------------------------------------

function WrapCreateProject(){
    ClearProject();

    $.get( "/get_project")
        .done(function( data ) {
            data = JSON.parse(data);
            if(data){
                DashboardCreate([data.root_ic]);
                PathCreation([data.root_ic]);
            }
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            console.log( errorThrown + ": " + $jqXHR.responseText );
            LoadStop();
        });
}

function WrapCreateFolder(data){
    //new_folder_modal.style.display = "block";
    var tmp = data.values.data;
    PopupOpen(NewFolder, tmp);
}

function WrapCreateFile(data){
    modal.style.display = "block";
    if(input_json == ""){
        input_get();
    }
}

function WrapRename(data){
    rename_modal.style.display = "block";
}

function WrapDelete(data){
    
}

function WrapMove(data){
    
}

function WrapShare(data){
    
}

function WrapDownload(data){
    
}

// -------------------------------------------------------
