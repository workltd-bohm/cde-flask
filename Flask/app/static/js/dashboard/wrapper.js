
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
            MakeSnackbar(textStatus);
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
