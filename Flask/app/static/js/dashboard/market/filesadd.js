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
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropAreaImage.addEventListener(eventName, highlight, false);
    dropAreaDoc.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropAreaImage.addEventListener(eventName, unhighlight, false);
    dropAreaDoc.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropAreaImage.classList.add('highlight');
    dropAreaDoc.classList.add('highlight');
}

function unhighlight(e) {
    dropAreaImage.classList.remove('highlight');
    dropAreaDoc.classList.remove('highlight');
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
        timeout: 5000,
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
    console.log(file);
    let reader = new FileReader();
    console.log(file);
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
    var url = 'remove_post_file';
    var formData = new FormData();
    d = { file_id: file.id, file_name: file.name, type: file.t };
    if ('post_id' in file) {
        d = { file_id: file.id, file_name: file.name, post_id: file.post_id, type: file.t };
    }

    console.log(file);
    console.log(file.id);

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
        timeout: 5000,
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
        }
    });
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
    console.log(post_id);
    PopupOpen(OpenFolderStructurePopup, post_id, '');
}

var tree = null;

function OpenFolderStructurePopup(form, post_id) {
    LoadStart();
    $.ajax({
        url: "/get_my_projects",
        type: 'POST',
        data: JSON.stringify({}),
        timeout: 5000,
        success: function(data) {
            input_json1 = JSON.parse(data);
            input_json2 = input_json1['data'];
            console.log(post_id);
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
    console.log('ovde');
    selectedNodes = tree.getSelectedNodes();

    nodeList = [];

    for (var i = 0; i < selectedNodes.length; i++) {
        selectedNode = selectedNodes[i].getOptions();
        if (Object.keys(selectedNode).length != 0 && selectedNode.constructor === Object && !selectedNode.is_directory && selectedNode.stored_id != '') {
            console.log(selectedNode);
            nodeList.push(selectedNode);
        }
    }

    console.log(nodeList);
    nodeList.forEach(async function(selectedNode) {
        let url = '/get_post_image/' + selectedNode.stored_id + '?post_id=default';
        let blob = await fetch(url).then(r => r.blob());
        blob.name = selectedNode.name + selectedNode.type;
        blob.id = selectedNode.stored_id;
        // blob.post_id = post_id;
        documents.push({ id: selectedNode.stored_id, name: selectedNode.name + selectedNode.type });
        previewEditFile(blob);
    });

    PopupOnlyClose();

}