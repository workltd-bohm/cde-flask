
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

function WrapCreateFile(data){
    var tmp = data.values.data;
    //console.log(tmp);
//    PopupOpen(NewFile, tmp);
    OpenFileDialog(tmp);
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

function WrapShareProject(data){
    var tmp = data.values.data;

    PopupOpen(SharePopup, tmp);
}
