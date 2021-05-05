function WrapGetProject(data) {
    var tmp = { choose_project: data.name };
    //console.log(tmp)
    FormSubmit('select_project', tmp, true, GetProject);
    //PopupOpen(GetProjects);
}

function WrapNewProject() {
    PopupOpen(NewProject);
}

function WrapUploadProject() {
    PopupOpen(UploadProject);
    //    OpenFolderDialog();
}

function WrapCreateFolder(data) {
    var tmp = data.values.data;
    //console.log(tmp);
    PopupOpen(NewFolder, tmp);
}

function WrapOpenFile(data, open = true) {
    ShowActivity();
    
    if (g_project.overlay) {
        // data.values.data.values.text.style("opacity", 100);
        g_project.overlay.remove();
        g_project.overlay = false;
    }
    
    var o = Object.values(CHECKED);
    var tmp = (o.length > 0) ? o[0] : data.values.data;
    SESSION["position"] = {
        project_name: tmp.path.split('/')[0],
        parent_id: tmp.parent_id,
        ic_id: tmp.ic_id,
        path: tmp.path,
        is_directory: tmp.is_directory,
        name: tmp.name,
        type: tmp.type ? tmp.type : null,
        parent: tmp.parent,
        project_code: tmp.project_code,
        company_code: tmp.company_code,
        project_volume_or_system: tmp.project_volume_or_system,
        project_level: tmp.project_level,
        type_of_information: tmp.type_of_information,
        role_code: tmp.role_code,
        file_number: tmp.file_number,
        status: tmp.status,
        revision: tmp.revision
    };

    if (tmp.is_directory) {
        //console.log("dir",tmp);
        //OpenActivity(null, null, open);
        OpenFilterActivity(tmp, open);
    } else {
        // console.log("tmp",open);
        PreviewOpen(OpenFile, tmp, null, open);
    }
    //    PopupOpen(NewFile, tmp);
    //    OpenFileDialog(tmp);
}

function WrapCreateFile(data) {
    var tmp = data.values.data;
    //console.log(tmp);
    PopupOpen(NewFile, tmp);
    // OpenFileDialog(tmp);
}

function WrapRename(data) {
    var o = Object.values(CHECKED);
    var tmp = (o.length > 0) ? o[0] : data.values.data;
    //console.log(tmp);
    PopupOpen(RenameFile, tmp);
}

function WrapDelete(data) {
    var tmp = data.values.data;
    PopupOpen(DeleteFile, tmp); // todo when hard delete, user must type in "DELETE" to submit the form
}

function WrapTrash(data) {
    var tmp = data.values.data;
    PopupOpen(TrashFile, tmp);
}

function WrapRestore(data) {
    var tmp = data.values.data;
    PopupOpen(RestoreFile, tmp);
}

function WrapEmptyTrash(data) {
    var tmp = data.values.data;
    PopupOpen(EmptyTrash, tmp);
}

function WrapMove(data) {
    var tmp = data.values.data;
    MoveObject(tmp, false);
    MoveCreate(tmp.values.back.values.this, tmp.values.back);
}

function WrapCopy(data) {
    var tmp = data.values.data;
    MoveObject(tmp, true);
    MoveCreate(tmp.values.back.values.this, tmp.values.back);
}

function WrapPaste() {

}

function WrapShare(data) {
    //var o = Object.values(CHECKED);
    //var multi = [];
    //for (var i = 0; i < o.length; i++) multi.push({ic_id: o[i].ic_id, parent_id: o[i].parent_id});

    console.log(data);
    console.log(SESSION);
    let tmp = data.values.data;
    tmp.project_name = SESSION["name"];

    // var dummy = document.createElement('input'),
    //     text = window.location.href + 'get_shared_file/' + tmp.name + tmp.type;
    // TODO create a function for session update and use it here
    let d = {...SESSION };
    d.position.ic_id = data.ic_id;
    d.position.name = data.name;
    d.position.parent = data.parent;
    d.position.parent_id = data.parent_id;
    d.position.path = data.path;
    d.position.project_name = data.project_name;

    $.ajax({
        url: "/get_encoded_data",
        type: 'POST',
        data: JSON.stringify({ project: d }),
        timeout: 10000,
        success: function(data) {
            var dummy = document.createElement('input'),
                text = window.location.href + 'get_shared_ic/' + data;

            document.body.appendChild(dummy);
            dummy.value = text;
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
            MakeSnackbar("Copied to clipboard");
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

function GetFileURL(data) {
    return '/get_thumb/' + data.thumb_id;
}

function GetDefaultImg(data) {
    var path;

    $.ajax({
        async: false,
        url: '/get_static_img/folder',
        type: 'POST',
        success: function(result) {
            path = result;
        }
    });

    return path;
}

function WrapDownload(data) {
    var tmp = data.values.data;

    DownloadICs(tmp);
}

function WrapShareProject(data) {
    var tmp = data.values.data;

    PopupOpen(SharePopup, tmp);
}