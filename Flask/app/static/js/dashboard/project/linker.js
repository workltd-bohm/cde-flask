
function WrapGetProject(data){
    var tmp = {choose_project: data.name};
    //console.log(tmp)
    FormSubmit('select_project', tmp, true, CreateProject);
    //PopupOpen(GetProjects);
}

function WrapNewProject(){
    PopupOpen(NewProject);
}

function WrapUploadProject(){
    PopupOpen(UploadProject);
//    OpenFolderDialog();
}

function WrapCreateFolder(data){
    var tmp = data.values.data;
    //console.log(tmp);
    PopupOpen(NewFolder, tmp);
}

function WrapOpenFile(data, open=true){
    if(g_project.overlay){
        data.values.data.values.text.style("opacity", 100);
        g_project.overlay.remove();
        g_project.overlay = false;
    }
    var o = Object.values(CHECKED);
    var tmp = (o.length > 0)? o[0] : data.values.data;
    console.log(tmp)
    if(tmp.is_directory){
        console.log("dir",tmp);
        //OpenActivity(null, null, open);
        OpenFilterActivity(tmp, open);
    }else{
        console.log("tmp",open);
        PreviewOpen(OpenFile, tmp, null, open);
    }
//    PopupOpen(NewFile, tmp);
//    OpenFileDialog(tmp);
}

function WrapCreateFile(data){
    var tmp = data.values.data;
    //console.log(tmp);
//    PopupOpen(NewFile, tmp);
    OpenFileDialog(tmp);
}

function WrapRename(data){
    var o = Object.values(CHECKED);
    var tmp = (o.length > 0)? o[0] : data.values.data;
    //console.log(tmp);
    PopupOpen(RenameFile, tmp);
}

function WrapDelete(data){
    var tmp = data.values.data;
    PopupOpen(DeleteFile, tmp);
}

function WrapMove(data){
    //var o = Object.values(CHECKED);
    //var multi = [];
    //for (var i = 0; i < o.length; i++) multi.push({ic_id: o[i].ic_id, parent_id: o[i].parent_id});
}

function WrapCopy(){
    //var o = Object.values(CHECKED);
    //var multi = [];
    //for (var i = 0; i < o.length; i++) multi.push({ic_id: o[i].ic_id, parent_id: o[i].parent_id});
}

function WrapPaste(){

}

function WrapShare(data){
    //var o = Object.values(CHECKED);
    //var multi = [];
    //for (var i = 0; i < o.length; i++) multi.push({ic_id: o[i].ic_id, parent_id: o[i].parent_id});

    var tmp = data.values.data;
    tmp.project_name = SESSION["name"];

    var dummy = document.createElement('input'),
    text = window.location.href + 'get_shared_file/' + tmp.name + tmp.type;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    MakeSnackbar("Copied to clipboard");
    
}

function WrapDownload(data){
    var tmp = data.values.data;

    DownloadICs(tmp);
}

function WrapShareProject(data){
    var tmp = data.values.data;

    PopupOpen(SharePopup, tmp);
}
