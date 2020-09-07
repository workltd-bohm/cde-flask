
function NewFolder(form, json){
    LoadStart();
    $.ajax({
        url: "/get_new_folder",
        type: 'POST',
        data: JSON.stringify({parent_path:json.path}),
        timeout: 5000,
        success: function(data){
            input_json = JSON.parse(data);
            html = input_json['html'];
            form.empty();
            form.append(html);
            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
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

// ------------------------------------------

function input_get() {
    $.get( "/input")
        .done(function( data ) {
            input_json = JSON.parse(data);
            OnFileUpload();
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            if($jqXHR.status == 404) {
                console.log( errorThrown + ": " + $jqXHR.responseText );
            }
        });
};

function fill_options(){
    fill(input_json.volume_system_name, sel, input_json.volume_system_code);
    fill(input_json.level_name, sel1, input_json.level_code);
    fill(input_json.type_name, sel2, input_json.type_code);
    fill(input_json.role_name, sel3, input_json.role_code);
    fill(input_json.number_name, sel4, input_json.number_code);
    fill(input_json.status_name, sel5, input_json.status_code);
    fill(input_json.revision_name, sel6, input_json.revision_code);
    fill(input_json.uniclass_name, sel7, '');
}

function fill(json, sel, code){
    for(var i = 0; i < json.length; i++) {
        // create new option element
        var opt = document.createElement('option');
        // create text node to add to option element (opt)
        var text = json[i];
        // set value property of opt
        opt.value = json[i];
        if(code != ''){
            text = code[i] + ', ' + text;
            opt.value = code[i] + ', ' + json[i];
        }
        opt.appendChild( document.createTextNode(text) );

        // add opt to end of select box (sel)
        sel.appendChild(opt);
    }
}

function updateName(position, el){
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

function OnFileUpload(){
    $("#file").change(function(e){
        var file = e.target.files[0];
        fill_options();
        var fileName = file.name.split('.');
        file_extension.value = '.' + fileName[1];
        name1.value = file.name;
        fileList = file;
        console.log(file);
        updated_name[9] = file.name;
        //updated_name[10] = '.' + fileName[1];
        originalName = fileName[0] + '.' + fileName[1]
        updateNewName();

 });
}

function GetFile(){
    var fd = new FormData();
    var d = {};
    var form = GetForm().serializeArray().map(function(x){d[x.name] = x.value;});

    fd.append('data', JSON.stringify(d));
    fd.append('file', fileList)

    return fd;
}

function NewFile(form, json){
    LoadStart();
    $.ajax({
        url: "/get_new_file",
        type: 'POST',
        data: JSON.stringify({
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
            input_get();

            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
            PopupClose();
        }
    });
}

// ------------------------------------------

function RenameFile(form, json){
    LoadStart();
    $.ajax({
        url: "/get_rename_ic",
        type: 'POST',
        data: JSON.stringify({
            parent_path: json.path,
            old_name: json.name,
            is_directory: json.is_directory,
        }),
        timeout: 5000,
        success: function(data){
            input_json2 = JSON.parse(data);
            html = input_json2['html'];
            form.empty();
            form.append(html);

            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
            PopupClose();
        }
    });
}

// ------------------------------------------

function DeleteFile(form, json){
    LoadStart();
    $.ajax({
        url: "/get_delete_ic",
        type: 'POST',
        data: JSON.stringify({
            parent_path: json.parent,
            delete_name: json.name,
            is_directory: json.is_directory,
        }),
        timeout: 5000,
        success: function(data){
            input_json2 = JSON.parse(data);
            html = input_json2['html'];
            form.empty();
            form.append(html);

            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
            PopupClose();
        }
    });
}

function DownloadFile(path){
    LoadStart();
    var url = "/get_file/" + path;
    window.open(url, "_blank");
//    $.ajax({
//        url: "/get_file/" + path,
//        type: 'GET',
////        data: JSON.stringify(json),
//        timeout: 5000,
//        success: function(data){
//
////              const blob = new Blob([data]);
////              const url = window.URL.createObjectURL(blob);
//
//
////              const link = document.createElement('a');
////              link.href = url;
////              link.download = path;
////              link.click();
//
//            LoadStop();
//        },
//        error: function($jqXHR, textStatus, errorThrown) {
//            console.log( errorThrown + ": " + $jqXHR.responseText );
//            MakeSnackbar(textStatus);
////            PopupClose();
//        }
//    });
}