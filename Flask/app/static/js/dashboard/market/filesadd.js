var images = [];
documents = [];

var dropAreaImage = null;
var dropAreaDoc = null;

function DropAreaInit() {
    dropAreaImage = document.getElementById('drop-area-image');
    dropAreaDoc = document.getElementById('drop-area-doc');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropAreaImage.addEventListener(eventName, preventDefaults, false);
        dropAreaDoc.addEventListener(eventName, preventDefaults, false);
    });

    dropAreaImage.addEventListener('drop', handleDrop, false);
    dropAreaImage.type = 'image';
    dropAreaDoc.addEventListener('drop', handleDrop, false);
    dropAreaDoc.type = 'doc';

    ['dragenter', 'dragover'].forEach(eventName => {
        dropAreaImage.addEventListener(eventName, highlight, false);
        dropAreaDoc.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropAreaImage.addEventListener(eventName, unhighlight, false);
        dropAreaDoc.addEventListener(eventName, unhighlight, false);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}



function highlight(e) {
    dropAreaImage.classList.add('drop-highlight');
    dropAreaDoc.classList.add('drop-highlight');
}

function unhighlight(e) {
    dropAreaImage.classList.remove('drop-highlight');
    dropAreaDoc.classList.remove('drop-highlight');
}



function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;

    // console.log(e);

    handleFiles(files, e.currentTarget.type);
}

function handleFiles(files, fileType) {
    files = [...files];
    files.forEach(function(file) {
        uploadPostFile(file, fileType)
    });
    // if (fileType == 'image') {
    //     files.forEach(previewEditImage);
    // } else {
    //     files.forEach(previewEditFile);
    // }
}

function SelectFocus(el) {
    [].forEach.call(el.options, function(o) {
        o.textContent = o.getAttribute('value').split(',')[0] + ', ' + o.getAttribute('data-descr');
    });
}

function SelectBlur(el) {
    [].forEach.call(el.options, function(o) {
        o.textContent = o.getAttribute('value').split(',')[0];
    });
}

function createISORenamingPopup(files, folders) {
    LoadStart();
    position = SESSION['position'];
    form = GetForm();
    $.ajax({
        url: "/get_iso_rename_popup",
        type: 'POST',
        data: JSON.stringify({
            parent_id: position.parent_id,
            ic_id: position.ic_id,
            project_path: position.path,
            is_file: !position.is_directory,
        }),
        timeout: 10000,
        success: function(data) {
            input_json2 = JSON.parse(data);
            html = input_json2['html'];
            htmlBlock = input_json2['html-block'];
            input_file = input_json2['input_file'];
            form.empty();

            form.append(html);
            // console.log(html);
            // console.log(form);
            for (var i = 0; i < files.length; i++) {
                let tr = document.createElement('tr');
                tr.id = 'row_' + i;
                tr.innerHTML = htmlBlock;

                $('#smart_naming').append(tr);

                let file_name = files[i].file.name;
                let extension = '';
                try {
                    splitted = file_name.split('.');
                    file_name = splitted[0];
                    extension = splitted[1];
                } catch {}

                tags = [];
                try {
                    tags = file_name.split('-');
                } catch {}

                if (tags.length == 9 || tags.length == 10) {
                    el = $(tr).find("input[name='project_code']");
                    el.val(tags[0]);
                    changeColorCustom(el, '#3CB371');
                    el = $(tr).find("input[name='company_code']");
                    el.val(tags[1]);
                    changeColorCustom(el, '#3CB371');

                    el = $(tr).find("select[name='project_volume_or_system']");
                    if (tags[2] in input_file.project_volume_or_system) {
                        el.val(tags[2] + ', ' + input_file.project_volume_or_system[tags[2]]);
                        changeColorCustom(el, '#3CB371');
                    } else {
                        changeColorCustom(el, '#FA8072');
                    }

                    el = $(tr).find("select[name='project_level']");
                    if (tags[3] in input_file.project_level) {
                        el.val(tags[3] + ', ' + input_file.project_level[tags[3]]);
                        changeColorCustom(el, '#3CB371');
                    } else {
                        changeColorCustom(el, '#FA8072');
                    }

                    el = $(tr).find("select[name='type_of_information']");
                    if (tags[4] in input_file.type_of_information) {
                        el.val(tags[4] + ', ' + input_file.type_of_information[tags[4]]);
                        changeColorCustom(el, '#3CB371');
                    } else {
                        changeColorCustom(el, '#FA8072');
                    }

                    el = $(tr).find("select[name='role_code']");
                    if (tags[5] in input_file.role_code) {
                        el.val(tags[5] + ', ' + input_file.role_code[tags[5]]);
                        changeColorCustom(el, '#3CB371');
                    } else {
                        changeColorCustom(el, '#FA8072');
                    }

                    el = $(tr).find("select[name='file_number']");
                    if (tags[6] in input_file.file_number) {
                        el.val(tags[6] + ', ' + input_file.file_number[tags[6]]);
                        changeColorCustom(el, '#3CB371');
                    } else {
                        changeColorCustom(el, '#FA8072');
                    }

                    el = $(tr).find("select[name='status']");
                    if (tags[7] in input_file.status) {
                        el.val(tags[7] + ', ' + input_file.status[tags[7]]);
                        changeColorCustom(el, '#3CB371');
                    } else {
                        changeColorCustom(el, '#FA8072');
                    }
                    if (tags.length == 9) {
                        el = $(tr).find("select[name='revision']");
                        if (tags[8].split('_')[0] in input_file.revision) {
                            el.val(tags[8].split('_')[0] + ', ' + input_file.revision[tags[8].split('_')[0]]);
                            changeColorCustom(el, '#3CB371');
                        } else {
                            changeColorCustom(el, '#FA8072');
                        }
                        file_name = tags[8].split('_').slice(1).join('_');
                    }
                    if (tags.length == 10) {
                        el = $(tr).find("select[name='revision']");
                        if (tags[8] in input_file.revision) {
                            el.val(tags[8] + ', ' + input_file.revision[tags[8]]);
                            changeColorCustom(el, '#3CB371');
                        } else {
                            changeColorCustom(el, '#FA8072');
                        }

                        el = $(tr).find("select[name='uniclass_2015']");
                        if (tags[9] in input_file.uniclass_2015) {
                            el.val(tags[9].split('_')[0] + ', ' + input_file.uniclass_2015[tags[9].split('_')[0]]);
                            changeColorCustom(el, '#3CB371');
                        } else {
                            changeColorCustom(el, '#FA8072');
                        }
                        file_name = tags[9].split('_').slice(1).join('_');
                    }
                }

                el = $(tr).find("input[name='name']");
                el.val(file_name);
                changeColorCustom(el, '#3CB371');
                el = $(tr).find("input[name='file_extension']");
                el.val(extension);
                changeColorCustom(el, '#3CB371');
            }

            // FileDataInit();
            // console.log(files);
            OnFileUpload(files, folders);

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


// Function to send a file, call PHP backend
function UploadFiles() {
    d = {};
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

        changedPath = fileList[i].path.split('/');
        changedPath[changedPath.length - 1] = d1['name'] + '.' + d1['file_extension'];
        fileList[i].path = changedPath.join('/');
    }

    total = fileList.length;
    counter = 1;
    listing = document.getElementById('listing');
    box = document.getElementById('box');

    uploadInProgress = true;
    sendFile(fileList, foldereList, 0, d);

    folders_only = true;
}

function uploadPostFile(file, fileType) {
    var url = 'upload_post_file';
    var formData = new FormData();

    formData.append('file', file);
    formData.append('data', JSON.stringify({ file_name: file.name, type: fileType }));
    //  xhr.send(formData)
    LoadStart();
    $.ajax({
        url: url,
        type: 'POST',
        data: formData,
        //dataType: "json",
        processData: false,
        contentType: false,
        timeout: 10000,
        success: function(data) {
            LoadStop();
            input_json = JSON.parse(data);
            if (fileType == 'image') {
                images.push({ id: input_json['id'], name: file.name });
                file.id = input_json['id'];
                previewEditImage(file);
            }
            if (fileType == 'doc') {
                documents.push({ id: input_json['id'], name: file.name });
                file.id = input_json['id'];
                previewEditFile(file);
            }
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


function previewImage(file) {
    //  console.log(file);
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = function() {
        let img = document.createElement('img')
        img.src = reader.result
        document.getElementById('gallery').appendChild(img)
    }
}

function previewEditImage(file) {
    //  console.log(file);
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = function() {
        let div = document.createElement('div');
        div.id = file.name;
        div.className = 'image-preview-div';
        let img = document.createElement('img')
        img.src = reader.result
        let btn = document.createElement('div');
        btn.className = 'image-preview-button';
        btn.textContent = "x";
        btn.addEventListener("click", function(e) {
            file.t = 'image';
            removeFile(file);
        });
        div.appendChild(img);
        div.appendChild(btn);
        document.getElementById('gallery').appendChild(div)
    }
}

function previewFile(file) {
    //  console.log(file);
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function() {
        let div = document.createElement('div');
        div.id = file.name;
        div.className = 'file-preview-div';
        var a = document.createElement('a');
        a.href = "/get_post_image/" + file.id + "?post_id=default";
        if ('post_id' in file) {
            a.href = "/get_post_image/" + file.id + "?post_id=" + file.post_id;
        }
        a.className = 'file-preview-name';
        var link = document.createTextNode(file.name);
        a.appendChild(link);
        a.title = file.name;
        // <embed width="100%" height="100%" name="plugin" src="http://localhost:54149/Documento/VersaoView?chave=FDC4875EE17FB17B" type="application/pdf"></embed>
        // var embed = document.createElement('embed');
        // embed.src = "/get_post_image/" + file.id + "?post_id=" + file.post_id;
        // embed.onclick = previewFileFunction();
        div.appendChild(a);
        document.getElementById('file-preview').appendChild(div);
    }
}

function previewFileFunction() {
    console.log('here');
}

function previewEditFile(file) {
    // console.log(file);
    let reader = new FileReader();
    // console.log(file);
    reader.readAsDataURL(file);
    reader.onloadend = function() {
        let div = document.createElement('div');
        div.id = file.name;
        div.className = 'file-preview-div';
        var a = document.createElement('a');
        a.href = "/get_post_image/" + file.id + "?post_id=default";
        if ('post_id' in file) {
            a.href = "/get_post_image/" + file.id + "?post_id=" + file.post_id;
        }
        a.className = 'file-preview-name';
        var link = document.createTextNode(file.name);
        a.appendChild(link);
        a.title = file.name;
        let btn = document.createElement('div');
        btn.className = 'file-preview-button';
        btn.textContent = "x";
        btn.addEventListener("click", function(e) {
            file.t = 'doc'
            removeFile(file);
        });
        // var embed = document.createElement('embed');
        // embed.src = "/get_post_image/" + file.id + "?post_id=default";
        // embed.onclick = previewFileFunction();
        div.appendChild(a);
        div.appendChild(btn);
        document.getElementById('file-preview').appendChild(div);
    }
}

function removeFile(file) {
    if (file.hasOwnProperty('fromBohm')) {
        if (file.fromBohm) {
            if (file.t == 'image') {
                images.splice(images.findIndex(v => v.id === file.id), 1);
            } else {
                documents.splice(documents.findIndex(v => v.id === file.id), 1);
            }
            document.getElementById(file.name).remove();
        }
    } else {
        var url = 'remove_post_file';
        var formData = new FormData();
        d = { file_id: file.id, file_name: file.name, type: file.t };
        if ('post_id' in file) {
            d = { file_id: file.id, file_name: file.name, post_id: file.post_id, type: file.t };
        }

        // console.log(file);
        // console.log(file.id);

        formData.append('data', JSON.stringify(d));
        //  xhr.send(formData)
        LoadStart();
        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            //dataType: "json",
            processData: false,
            contentType: false,
            timeout: 10000,
            success: function(data) {
                LoadStop();
                //MakeSnackbar(data);
                if (file.t == 'image') {
                    images.splice(images.findIndex(v => v.id === file.id), 1);
                } else {
                    documents.splice(documents.findIndex(v => v.id === file.id), 1);
                }
                document.getElementById(file.name).remove();

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
}

function Set3DPreview() {
    link = $('#3d-view-link').val();
    if (link == '') {
        return;
    }
    // <iframe width="960" height="400" src="{{ dview }}" frameborder="0" allowfullscreen></iframe>
    var iframe = document.createElement('iframe');
    iframe.src = link;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    $('#d3view-preview').append(iframe);
}

function OpenFolderStructure(post_id = '') {
    // console.log(post_id);
    PopupOpen(OpenFolderStructurePopup, post_id, '');
}

var tree = null;

function OpenFolderStructurePopup(form, post_id) {
    LoadStart();
    $.ajax({
        url: "/get_my_projects",
        type: 'POST',
        data: JSON.stringify({}),
        timeout: 10000,
        success: function(data) {
            input_json1 = JSON.parse(data);
            input_json2 = input_json1['data'];
            // console.log(post_id);
            html = input_json1['html'];
            form.empty();
            div = document.getElementById('container');
            // div.id = 'container';
            var root = new TreeNode("projects");
            for (var i = 0; i < input_json2.length; i++) {
                var node = new TreeNode(input_json2[i].project_name);
                // console.log(input_json2[i]);
                for (var j = 0; j < input_json2[i].root_ic.sub_folders.length; j++) {
                    AddSubfolders(node, input_json2[i].root_ic.sub_folders[j]);
                }
                root.addChild(node);
            }

            form.append(html);
            tree = new TreeView(root, "#container", {
                leaf_icon: "<span>&#128441;</span>",
                parent_icon: "<span>&#128449;</span>",
                open_icon: "<span>&#9698;</span>",
                close_icon: "<span>&#9654;</span>"
            });

            // Resets the root-node (TreeNode)
            tree.setRoot(root);

            // tree.collapseAllNodes();
            root.setExpanded(true);

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

function AddSubfolders(node, sub_folder) {
    name = sub_folder.name;
    if (!sub_folder.is_directory) {
        name = sub_folder.name + sub_folder.type;
    }
    var child = new TreeNode(name, {
        ic_id: sub_folder.ic_id,
        name: sub_folder.name,
        parent_id: sub_folder.parent_id,
        parent: sub_folder.parent,
        is_directory: sub_folder.is_directory,
        stored_id: (sub_folder.is_directory) ? '' : sub_folder.stored_id,
        type: (sub_folder.is_directory) ? '' : sub_folder.type
    });
    for (var k = 0; k < sub_folder.sub_folders.length; k++) {
        // console.log(sub_folder.sub_folders[k].name);
        AddSubfolders(child, sub_folder.sub_folders[k]);
    }
    // console.log(sub_folder);
    // node.setOptions({ ic_id: sub_folder.ic_id, name: sub_folder.name, parent_id: sub_folder.parent_id, parent: sub_folder.parent });
    node.addChild(child);
    node.setExpanded(false);
}

function SelectFiles() {
    selectedNodes = tree.getSelectedNodes();

    nodeList = [];

    for (var i = 0; i < selectedNodes.length; i++) {
        selectedNode = selectedNodes[i].getOptions();
        if (Object.keys(selectedNode).length != 0 && selectedNode.constructor === Object && !selectedNode.is_directory && selectedNode.stored_id != '') {
            // console.log(selectedNode);
            nodeList.push(selectedNode);
        }
    }

    // console.log(nodeList);
    nodeList.forEach(async function(selectedNode) {
        let url = '/get_post_image/' + selectedNode.stored_id + '?post_id=default';
        let blob = await fetch(url).then(r => r.blob());
        blob.name = selectedNode.name + selectedNode.type;
        blob.id = selectedNode.stored_id;
        blob.fromBohm = true;
        // blob.post_id = post_id;
        if (!selectedNode.type.match(/.(jpg|jpeg|png|gif)$/i)) {
            documents.push({ id: selectedNode.stored_id, name: selectedNode.name + selectedNode.type });
            previewEditFile(blob);
        } else {
            images.push({ id: selectedNode.stored_id, name: selectedNode.name + selectedNode.type });
            previewEditImage(blob);
        }
    });

    PopupOnlyClose();

}