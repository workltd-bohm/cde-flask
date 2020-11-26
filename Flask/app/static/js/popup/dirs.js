

function OpenFile(form, json, file, open){
    LoadStartPreview();
    console.log(json);
    $.ajax({
        url: "/get_open_file",
        type: 'POST',
        data: JSON.stringify({
            name: json.name,
            type: json.type,
            parent_id: json.parent_id,
            ic_id: json.ic_id
        }),
        timeout: 5000,
        success: function(data){
            input_json2 = JSON.parse(data);
            html = input_json2['html'];
            activity = input_json2['activity'];
            if(form) form.empty();
            if(form) form.append(html);

            OpenActivity(activity, null, open);

            FilterSwap('details');

            LoadStopPreview();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });
}


function NewFolder(form, json){
    LoadStart();
    $.ajax({
        url: "/get_new_folder",
        type: 'POST',
        data: JSON.stringify({
            parent_id: json.parent_id,
            ic_id: json.ic_id,
            parent_path:json.path,
        }),
        timeout: 5000,
        success: function(data){
            input_json = JSON.parse(data);
            html = input_json['html'];
            form.empty();
            form.append(html);

            listing = document.getElementById('listing');
            box = document.getElementById('box');
            dropArea = document.getElementById("dropAreaFolders");
            dropArea.addEventListener("dragover", dragHandler);
            dropArea.addEventListener("dragleave", dragLeave);
            dropArea.addEventListener("change", filesDroped);
            dropArea.addEventListener("drop", filesDroped);

            folders_only = true;

            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });
}

// ------------------------------------------

var input_json = "";
var file_extension;
var name1;
var new_name;
var projectNameFile;
var dir_path;
var sel;
var sel1;
var sel2;
var sel3;
var sel4;
var sel5;
var sel6;
var sel7;
var fileList = null;

var updated_name = ['AAA', 'AAA', 'AA', '00', 'AA', 'A', '0000', 'A0', 'A0', 'Default'];


function FileDataInit(){

    file_extension = document.getElementById('file_extension');
    name1 = document.getElementById('name');
    new_name = document.getElementById('new_name');
    projectNameFile = document.getElementById('project_name_file');
    dir_path = document.getElementById('dir_path');
    sel = document.getElementById('project_volume_or_system');
    sel1 = document.getElementById('project_level');
    sel2 = document.getElementById('type_of_information');
    sel3 = document.getElementById('role_code');
    sel4 = document.getElementById('file_number');
    sel5 = document.getElementById('status');
    sel6 = document.getElementById('revision');
    sel7 = document.getElementById('uniclass_2015');

    updated_name[0] = $("#project_code").val();
    updated_name[1] = $("#company_code").val();

};

function updateName(position, el){
//    console.log(el.value);
    text = el.value.split(',')[0];
    if(position == 3 || position == 6){
        text = el.value.split(',')[0].split('.')[0];
    }
    updated_name[position] = text;
    updateNewName();
}
function updateNewName(){
    $("#new_name").attr("value", updated_name.join("-"))
}

function OnFileUpload(file){
//    $("#file").change(function(e){
//        var file = e.target.files[0];
//        fill_options();
        var fileName = file.name.split('.');
        file_extension.value = '.' + fileName[fileName.length-1];
        name1.value = file.name;
        fileList = file;
//        console.log(file);
        updated_name[9] = file.name;
        //updated_name[10] = '.' + fileName[1];
        originalName = fileName[0] + '.' + fileName[1]
        updateNewName();

// });
}

function GetFile(){
    var fd = new FormData();
    var d = {};
    var form = GetForm().serializeArray().map(function(x){d[x.name] = x.value;});

    if(fileList){
        fd.append('data', JSON.stringify(d));
        fd.append('file', fileList)
    }
    else{
        MakeSnackbar("File not selected");
        return null;
    }

    return fd;
}

function OpenFileDialog(data){
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {

       // getting a hold of the file reference
       var file = e.target.files[0];

       PopupOpen(NewFile, data, file);
    }
    input.click();
}

function NewFile(form, json, file){
    LoadStart();
    $.ajax({
        url: "/get_new_file",
        type: 'POST',
        data: JSON.stringify({
            parent_id: json.parent_id,
            ic_id: json.ic_id,
            project_path: json.path,
            is_file: !json.is_directory,
        }),
        timeout: 5000,
        success: function(data){
            input_json2 = JSON.parse(data);
            html = input_json2['html'];
            form.empty();
            form.append(html);

            FileDataInit();
            OnFileUpload(file);

            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });
}

// ------------------------------------------

function RenameFile(form, json){
//    console.log(json);
    LoadStart();
    var newOldName = json.name;
    if(json.hasOwnProperty("type") && json.type != null){
//        console.log(data.name);
        newOldName = json.name + json.type
    }
    $.ajax({
        url: "/get_rename_ic",
        type: 'POST',
        data: JSON.stringify({
            parent_id: json.parent_id,
            ic_id: json.ic_id,
            parent_path: json.parent,
            old_name: newOldName,
            is_directory: json.is_directory,
        }),
        timeout: 5000,
        success: function(data){
            input_json2 = JSON.parse(data);
            html = input_json2['html'];
            form.empty();
            form.append(html);

            if(json.is_directory){
//                console.log(html);
                document.getElementById('smart_naming').remove();
                document.getElementById('name_div').style.bottom = "120px";
            }
            else{
                document.getElementById('project_code').value = json.project_code;
                document.getElementById('company_code').value = json.company_code;
//                document.getElementById('name').value = json.original_name;
                var file = {};
                file.name = json.name + json.type;
//                console.log(json);

                FileDataInit();
                OnFileUpload(file);

                updated_name[0] = json.project_code;
                updated_name[1] = json.company_code;
                updated_name[2] = json.project_volume_or_system.split(',')[0];
                updated_name[3] = json.project_level.split(',')[0];
                updated_name[4] = json.type_of_information.split(',')[0];
                updated_name[5] = json.role_code.split(',')[0];
                updated_name[6] = json.file_number.split(',')[0];
                updated_name[7] = json.status.split(',')[0];
                updated_name[8] = json.revision.split(',')[0];
//                updated_name[9] = json.uniclass_2015.split(',')[0];

                updateNewName();

                $('#project_volume_or_system').val(json.project_volume_or_system);
                $('#project_level').val(json.project_level);
                $('#type_of_information').val(json.type_of_information);
                $('#role_code').val(json.role_code);
                $('#file_number').val(json.file_number);
                $('#status').val(json.status);
                $('#revision').val(json.revision);
            }

            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });
}

// ------------------------------------------

function DeleteFile(form, json){
    var o = Object.values(CHECKED);
    var multi = [];
    for (var i = 0; i < o.length; i++) multi.push({
        parent_id: o[i].parent_id,
        ic_id: o[i].ic_id,
        parent_path: o[i].parent,
        delete_name: o[i].name + ((o[i].type)? o[i].type:""),
        is_directory: o[i].is_directory,
    });
    if (o.length > 0) MULTI = {
        parent_id: json.parent_id,
        ic_id: json.ic_id,
        targets : multi,
    };
    
    LoadStart();
    $.ajax({
        url: "/get_delete_ic",
        type: 'POST',
        data: JSON.stringify((o.length > 0)? {
            is_multi: true,
        } : {
            parent_id: json.parent_id,
            ic_id: json.ic_id,
            parent_path: json.parent,
            delete_name: json.name + ((json.type)? json.type:""),
            is_directory: json.is_directory,
        }),
        timeout: 5000,
        success: function(data){
            try {
                input_json2 = JSON.parse(data);
                html = input_json2['html'];
                form.empty();
                form.append(html);
            } catch (e) {
                MakeSnackbar(data);
                CreateProject();
            }


            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });
}

function DownloadMulti(path, multi){
    LoadStart();
    var link = document.createElement('a');
    link.href = path + JSON.stringify(multi);
    link.download = 'BOHM_download.zip';
    link.dispatchEvent(new MouseEvent('click'));

//    window.open(url, "_blank");
    LoadStop();
}

function DownloadIC(path, name){
    console.log(path);
    LoadStart();
    var link = document.createElement('a');
    link.href = path;
    link.download = name;
    link.dispatchEvent(new MouseEvent('click'));

//    window.open(url, "_blank");
    LoadStop();
}

function DownloadICs(json){
    var o = Object.values(CHECKED);
    var multi = [];
    for (var i = 0; i < o.length; i++) multi.push({parent_id: o[i].parent_id,
                                                    ic_name: (!o[i].is_directory)? o[i].name + o[i].type : o[i].name});
    console.log(multi);
    if (o.length > 0){
        if (o.length == 1){
            console.log(o[0]);
            if(o[0].is_directory){
                DownloadIC("/get_folder/" + o[0].parent_id + '/' + o[0].name, o[0].name + '.zip');
            }else{
                DownloadIC("/get_file/" + o[0].name + o[0].type, o[0].name + o[0].type);
            }
        }else{
            DownloadMulti("/get_ic_multi/", multi);
        }
    }
    else{
        if(json.is_directory){
            DownloadIC("/get_folder/" + json.parent_id + '/' + json.name, json.name + '.zip');
        }else{
            DownloadIC("/get_file/" + json.name + json.type, json.name + json.type);
        }
    }
}