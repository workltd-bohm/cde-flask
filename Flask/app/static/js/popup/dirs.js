
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

// ------------------------------------------

function input_get(file) {
    $.get( "/input")
        .done(function( data ) {
            input_json = JSON.parse(data);
            OnFileUpload(file);
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
        opt.text = text;
        sel.add(opt);
//        opt.appendChild( document.createTextNode(text) );

        // add opt to end of select box (sel)
//        sel.appendChild(opt);
    }
}

function updateName(position, el){
    console.log(el.value);
    text = el.value.split(',')[0];
    console.log(text);
    if(position == 3 || position == 6){
        text = el.value.split(',')[0].split('.')[0];
    }
//    console.log(el.value);
//    console.log(el.selectedIndex);
//    el.innerHTML = text;
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
        file_extension.value = '.' + fileName[1];
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

       // setting up the reader
//       var reader = new FileReader();
//       reader.readAsText(file,'UTF-8');
//
//       // here we tell the reader what to do when it's done reading...
//       reader.onload = readerEvent => {
//          var content = readerEvent.target.result; // this is the content!
//          console.log( content );
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
    if(json.hasOwnProperty("type")){
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
                file.name = json.original_name;

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

//                console.log(sel);
//                console.log(json.project_volume_or_system);
//                sel.value = json.project_volume_or_system;

//                var option = document.createElement("option");
//                option.text = json.project_volume_or_system;
//                sel.add(option, sel.options[0]);
//                setSelectedIndex(sel, json.project_volume_or_system);
                $('#project_volume_or_system').val(json.project_volume_or_system);
                $('#project_level').val(json.project_level);
                $('#type_of_information').val(json.type_of_information);
                $('#role_code').val(json.role_code);
                $('#file_number').val(json.file_number);
                $('#status').val(json.status);
                $('#revision').val(json.revision);

//                console.log(document.getElementById('project_volume_or_system').value);
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

function setSelectedIndex(s, valsearch)
{
    Array.from(s).forEach(function(item) {
   console.log(item);
});
    for (i = 0; i< s.options.length; i++)
    {
        console.log(s.options.namedItem(valsearch));
        console.log(s.options.length);
        console.log(s.options[1]);

        console.log(valsearch);
        if (s.options[i].value == valsearch)
        {
            console.log('ovdeeee11111');
            s.options[i].selected = true;
            break;
        }
    }
    return;
}

// ------------------------------------------

function DeleteFile(form, json){
    LoadStart();
    $.ajax({
        url: "/get_delete_ic",
        type: 'POST',
        data: JSON.stringify({
            parent_id: json.parent_id,
            ic_id: json.ic_id,
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
            MakeSnackbar($jqXHR.responseText);
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