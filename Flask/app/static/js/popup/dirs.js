function OpenFile(form, json, file, open) {
    LoadStartPreview();
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
        success: function(data) {
            input_json2 = JSON.parse(data);
            html = input_json2['html'];
            activity = input_json2['activity'];
            if (form) form.empty();
            if (form) form.append(html);

            OpenActivity(activity, null, open);

            checkISOCompliant();

            LoadStopPreview();

            GetShareLink();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}


function NewFolder(form, json) {
    LoadStart();
    $.ajax({
        url: "/get_new_folder",
        type: 'POST',
        data: JSON.stringify({
            parent_id: json.parent_id,
            ic_id: json.ic_id,
            parent_path: json.path,
        }),
        timeout: 5000,
        success: function(data) {
            input_json = JSON.parse(data);
            html = input_json['html'];
            form.empty();
            form.append(html);

            // listing = document.getElementById('listing');
            // box = document.getElementById('box');
            // dropArea = document.getElementById("dropAreaFolders");
            // dropArea.addEventListener("dragover", dragHandler);
            // dropArea.addEventListener("dragleave", dragLeave);
            // dropArea.addEventListener("change", filesDroped);
            // dropArea.addEventListener("drop", filesDroped);

            // folders_only = true;

            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
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
var foldereList = null;

var updated_name = ['AAA', 'AAA', 'AA', '00', 'AA', 'A', '0000', 'A0', 'A0', 'Default'];


function FileDataInit() {

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

function updateName(position, el) {
    text = el.value.split(',')[0];
    if (position == 3 || position == 6) {
        text = el.value.split(',')[0].split('.')[0];
    }
    updated_name[position] = text;
    updateNewName();
}

function updateNewName() {
    $("#new_name").attr("value", updated_name.join("-"))
}

function changeValues(element) {
    if ($(element).is("input")) {
        $("input[name='" + element.name + "']").val($(element).val());
        elements_by_name = $("input[name='" + element.name + "']");
    }
    if ($(element).is("select")) {
        $("select[name='" + element.name + "']").val($(element).val());
        elements_by_name = $("select[name='" + element.name + "']");
    }

    for (var i = 0; i < elements_by_name.length; i++) {
        changeColor(elements_by_name[i]);
    }

}

function changeColor(element) {
    $(element).css('border-color', '#3CB371');
}

function changeColorCustom(element, color) {
    $(element).css('border-color', color);
}

function OnFileUpload(files, folders = []) {
    //    $("#file").change(function(e){
    //        var file = e.target.files[0];
    //        fill_options();
    // var fileName = files.name.split('.');
    // file_extension.value = '.' + fileName[fileName.length - 1];
    // name1.value = files.name;
    fileList = files;
    foldereList = folders;
    // updated_name[9] = files.name;
    //updated_name[10] = '.' + fileName[1];
    // originalName = fileName[0] + '.' + fileName[1]
    // updateNewName();

    // });
}

function GetFile() {
    var fd = new FormData();
    var d = {};
    var form = GetForm().serializeArray()
    for (var i = 0; i < form.length; i++) {
        if (form[i].name == 'parent_id')
            d['parent_id'] = form[i].value;
        if (form[i].name == 'ic_id')
            d['ic_id'] = form[i].value;
        if (form[i].name == 'project_name')
            d['project_name'] = form[i].value;
        if (form[i].name == 'parent_path')
            d['parent_path'] = form[i].value;
        if (form[i].name == 'is_file')
            d['is_file'] = form[i].value;
    }


    if (fileList) {
        for (var i = 0; i < fileList.length; i++) {
            row = $('#row_' + i);
            d1 = {};
            d1['project_code'] = $('#row_' + i).find("input[name='project_code']").val();
            d1['company_code'] = $('#row_' + i).find("input[name='company_code']").val();
            d1['project_volume_or_system'] = $('#row_' + i).find("select[name='project_volume_or_system']").val();
            d1['project_level'] = $('#row_' + i).find("select[name='project_level']").val();
            d1['type_of_information'] = $('#row_' + i).find("select[name='type_of_information']").val();
            d1['role_code'] = $('#row_' + i).find("select[name='role_code']").val();
            d1['file_number'] = $('#row_' + i).find("select[name='file_number']").val();
            d1['status'] = $('#row_' + i).find("select[name='status']").val();
            d1['revision'] = $('#row_' + i).find("select[name='revision']").val();
            d1['uniclass_2015'] = $('#row_' + i).find("select[name='uniclass_2015']").val();
            d1['name'] = $('#row_' + i).find("input[name='name']").val();
            d1['file_extension'] = $('#row_' + i).find("input[name='file_extension']").val();

            d['file_' + i] = d1;
        }
        fd.append('data', JSON.stringify(d));
        fd.append('file_' + i, fileList[i].file)
    } else {
        MakeSnackbar("File not selected");
        return null;
    }

    return fd;
}

function OpenFileDialog(data) {
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {

        // getting a hold of the file reference
        var file = e.target.files[0];

        PopupOpen(NewFile, data, file);
    }
    input.click();
}

function NewFile(form, json, file) {
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
        success: function(data) {
            input_json2 = JSON.parse(data);
            html = input_json2['html'];
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

            // FileDataInit();
            // OnFileUpload(file);

            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

// ------------------------------------------

function RenameFile(form, json) {
    LoadStart();
    var newOldName = json.name;
    if (json.hasOwnProperty("type") && json.type != null) {
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
        success: function(data) {
            input_json2 = JSON.parse(data);
            html = input_json2['html'];
            form.empty();
            form.append(html);

            let input = document.getElementById("new_name");
            let split = newOldName.split(".");
            input.value = split.slice(0, split.length - 1).join(".");
            input.select();
            document.getElementById('name_div').style.bottom = "120px";

            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

// ------------------------------------------
function TrashFile(form, json) {
    var o = Object.values(CHECKED);
    var multi = [];

    for (var i = 0; i < o.length; i++) multi.push({
        parent_id: o[i].parent_id,
        ic_id: o[i].ic_id,
        parent_path: o[i].parent,
        delete_name: o[i].name,
        is_directory: o[i].is_directory,
        project_id: o[i].project_id
    });

    if (o.length > 0) {
        MULTI = {
            parent_id: json.parent_id,
            ic_id: json.ic_id,
            targets: multi,
        };
    }

    LoadStart();

    $.ajax({
        url: "/get_trash_ic",
        type: 'POST',
        data: JSON.stringify((o.length > 0) ? {
            is_multi: true,
        } : {
            ic_id: json.ic_id,
            is_directory: json.is_directory,
            delete_name: json.name,
            parent_id: json.parent_id,
            parent_path: json.parent,
            project_id: json.project_id
        }),
        timeout: 5000,
        success: function(data) {
            try {
                input_json2 = JSON.parse(data);
                html = input_json2['html'];
                form.empty();
                form.append(html);
            } catch (e) {
                MakeSnackbar(data);
                GetProject();
            }

            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function RestoreFile(form, json) {
    var o = Object.values(CHECKED);
    var multi = [];

    for (var i = 0; i < o.length; i++) multi.push({
        project_id: o[i].project_id,
        ic_id: o[i].ic_id,
        is_directory: o[i].is_directory,
        restore_name: o[i].name,
        parent_id: o[i].parent_id,
        parent_path: o[i].parent,
    });

    if (o.length > 0) {
        MULTI = {
            project_id: json.project_id,
            parent_id: json.parent_id,
            ic_id: json.ic_id,
            targets: multi,
        };
    }

    LoadStart();

    $.ajax({
        url: "/get_restore_ic",
        type: 'POST',
        data: JSON.stringify((o.length > 0) ? {
            is_multi: true,
        } : {
            project_id: json.project_id,
            ic_id: json.ic_id,
            is_directory: json.is_directory,
            restore_name: json.name,
            parent_id: json.parent_id,
            parent_path: json.parent,
        }),
        timeout: 5000,
        success: function(data) {
            try {
                input_json2 = JSON.parse(data);
                html = input_json2['html'];
                form.empty();
                form.append(html);
            } catch (e) {
                MakeSnackbar(data);
            }

            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function DeleteFile(form, json) {
    var o = Object.values(CHECKED);
    var multi = [];
    for (var i = 0; i < o.length; i++) multi.push({
        project_id: o[i].project_id,
        parent_id: o[i].parent_id,
        ic_id: o[i].ic_id,
        parent_path: o[i].parent,
        delete_name: o[i].name + ((o[i].type) ? o[i].type : ""),
        is_directory: o[i].is_directory,
    });
    if (o.length > 0) MULTI = {
        parent_id: json.parent_id,
        ic_id: json.ic_id,
        targets: multi,
    };

    LoadStart();

    $.ajax({
        url: "/get_delete_ic",
        type: 'POST',
        data: JSON.stringify((o.length > 0) ? {
            is_multi: true,
        } : {
            project_id: json.project_id,
            parent_id: json.parent_id,
            ic_id: json.ic_id,
            parent_path: json.parent,
            delete_name: json.name + ((json.type) ? json.type : ""),
            is_directory: json.is_directory,
        }),
        timeout: 5000,
        success: function(data) {
            try {
                input_json2 = JSON.parse(data);
                html = input_json2['html'];
                form.empty();
                form.append(html);
            } catch (e) {
                MakeSnackbar(data);
                GetProject();
            }


            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function EmptyTrash(form, json) {
    $.ajax({
        url: "/get_empty_trash",
        type: 'POST',
        timeout: 5000,
        success: function(data) {
            try {
                input_json2 = JSON.parse(data);
                html = input_json2['html'];
                form.empty();
                form.append(html);
            } catch (e) {
                MakeSnackbar(data);
                GetProject();
            }

            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function DownloadMulti(path, multi) {
    LoadStart();
    var link = document.createElement('a');
    link.href = path + JSON.stringify(multi);
    link.download = 'BOHM_download.zip';
    link.dispatchEvent(new MouseEvent('click'));

    //    window.open(url, "_blank");
    LoadStop();
}

function DownloadIC(path, name) {
    LoadStart();
    var link = document.createElement('a');
    link.href = path;
    link.download = name;
    link.dispatchEvent(new MouseEvent('click'));

    //    window.open(url, "_blank");
    LoadStop();
}

function DownloadICs(json) {
    var o = Object.values(CHECKED);
    var multi = [];

    for (var i = 0; i < o.length; i++) multi.push({
        parent_id: o[i].parent_id,
        ic_name: (!o[i].is_directory) ? o[i].name + o[i].type : o[i].name
    });

    if (o.length > 0) {
        if (o.length == 1) {
            if (o[0].is_directory) {
                DownloadIC("/get_folder/" + o[0].parent_id + '/' + o[0].name, o[0].name + '.zip');
            } else {
                GetNameAndDownloadIC(o[0])
            }
        } else {
            DownloadMulti("/get_ic_multi/", multi);
        }
    } else {
        if (json.is_directory || json.parent == 'Projects') {
            if (json.parent == 'Projects') {
                DownloadIC("/get_folder/root/" + json.name, json.name + '.zip');
            } else {
                DownloadIC("/get_folder/" + json.parent_id + '/' + json.name, json.name + '.zip');
            }
        } else {
            GetNameAndDownloadIC(json)
                // DownloadIC("/get_file/" + json.ic_id, json.name + json.type);
        }
    }
}

function GetNameAndDownloadIC(o) {
    $.ajax({
        url: "/get_file_name",
        type: 'POST',
        data: JSON.stringify({
            project_id: o.project_id,
            parent_id: o.parent_id,
            ic_id: o.ic_id,
            file_name: o.name,
            type: o.type
        }),
        timeout: 5000,
        success: function(data) {
            input_json2 = JSON.parse(data);
            name = input_json2['name'];
            is_iso19650 = input_json2['is_iso19650']
            if (is_iso19650) {
                // if (checkISOCompliant()) {
                DownloadIC("/get_file/" + o.ic_id, name);
                // } else {
                //     MakeSnackbar('Your file is not ISO 19650 compliant, although it has to be, Please tag it!');
                // }
            } else {
                DownloadIC("/get_file/" + o.ic_id, name);
            }
            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function GetShareLink() {
    $.ajax({
        url: "/get_encoded_data",
        type: 'POST',
        data: JSON.stringify({ project: SESSION }),
        timeout: 5000,
        success: function(data) {
            $('#share-link').val(window.location.href + 'get_shared_ic/' + data);
            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}