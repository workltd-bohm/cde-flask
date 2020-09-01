
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
    if(data.values.data.parent != '.')
        project_name = data.values.data.parent.split('/')[0];
    else
        project_name = data.values.data.name;

    modal.style.display = "block";
    set_data(project_name, data.values.data.path);
    if(input_json == ""){
        input_get();
    }
}

function WrapRename(data){
    if(data.values.data.parent != '.')
        project_name = data.values.data.parent.split('/')[0];
    else
        project_name = data.values.data.name;
    rename_modal.style.display = "block";
    set_rename_data(project_name, data.values.data.path, data.values.data.name, data.values.data.is_directory);
}

function WrapDelete(data){
    if(data.values.data.parent != '.')
        project_name = data.values.data.parent.split('/')[0];
    else
        project_name = data.values.data.name;

    delete_ic(project_name, data.values.data.path, data.values.data.name, data.values.data.is_directory);
    
}

function WrapMove(data){
    
}

function WrapShare(data){
    
}

function WrapDownload(data){
    
}

// -------------------------------------------------------
