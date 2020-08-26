
// -------------------------------------------------------

$( document ).ready(function(){
    $.get( "/get_project", function( data ) {
        if(data){
            DashboardCreate([data.root_ic]);
            PathCreation([data.root_ic]);
        }
    });
});

// -------------------------------------------------------

function WrapCreateFolder(data){
    new_folder_modal.style.display = "block";
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
