
// -------------------------------------------------------

$( document ).ready(function(){
    //CreateProject();
    SelectProject();
});

// -------------------------------------------------------

function SelectProject(){
    ClearProject();

    $.ajax({
        url: "/get_root_project",
        type: 'POST',
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                DashboardCreate([data.json.root_ic], data.project_position);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function CreateProject(parent=false){
    if (g_project.project_position_mix){
        g_project.project_position = g_project.project_position_mix;
        g_project.project_position_mix = null;
    }
    $.ajax({
        url: "/set_project_position",
        type: 'POST',
        data: JSON.stringify({project_position: g_project.project_position}),
        timeout: 5000,
        success: function(data){
            ClearProject();
            $.ajax({
                url: "/get_project",
                type: 'POST',
                timeout: 5000,
                success: function(data){
                    data = JSON.parse(data);
                    if(data){
                        DashboardCreate([data.json.root_ic], data.project_position);
                    }
                },
                error: function($jqXHR, textStatus, errorThrown) {
                    console.log( errorThrown + ": " + $jqXHR.responseText );
                    MakeSnackbar($jqXHR.responseText);
                }
            });
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function WrapGetProject(data){
    var tmp = {choose_project: data.name};
    //console.log(tmp)
    FormSubmit('select_project', JSON.stringify(tmp), true, CreateProject);
    //PopupOpen(GetProjects);
}

function WrapNewProject(){
    PopupOpen(NewProject);
}

function WrapCreateFolder(data){
    var tmp = data.values.data;
    //console.log(tmp);
    PopupOpen(NewFolder, tmp);
}

function WrapCreateFile(data){
    var tmp = data.values.data;
    //console.log(tmp);
    PopupOpen(NewFile, tmp);
}

function WrapRename(data){
    var tmp = data.values.data;
    //console.log(tmp);
    PopupOpen(RenameFile, tmp);
}

function WrapDelete(data){
    var tmp = data.values.data;
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
