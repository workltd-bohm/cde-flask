var images = [];
documents = [];

let dropAreaImage = document.getElementById('drop-area-image');
let dropAreaDoc = document.getElementById('drop-area-doc');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropAreaImage.addEventListener(eventName, preventDefaults, false);
  dropAreaDoc.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults (e) {
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

dropAreaImage.addEventListener('drop', handleDrop, false);
dropAreaDoc.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  let dt = e.dataTransfer;
  let files = dt.files;

  console.log(e);

  handleFiles(files);
}

function handleFiles(files, fileType) {
  files = [...files];
  files.forEach(function(file){
    uploadPostFile(file, fileType)
  });
  if(fileType == 'image'){
      files.forEach(previewEditImage);
  }else{
      files.forEach(previewEditFile);
  }
}

function uploadPostFile(file, fileType) {
  var url = 'upload_post_file';
  var formData = new FormData();

  formData.append('file', file);
  formData.append('data', JSON.stringify({file_name: file.name, type: fileType}));
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
        success: function(data){
            LoadStop();
            //MakeSnackbar(data);
            if(fileType == 'image'){
                images.push(file.name);
            }
            if(fileType == 'doc'){
                documents.push(file.name);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
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
    div.className = 'file-preview-div';
    let img = document.createElement('img')
    img.src = reader.result
    let btn = document.createElement('div');
    btn.className = 'file-preview-button';
    btn.textContent = "x";
    btn.addEventListener("click", function(e) {
        file.t = 'image'
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
    a.href = "/get_post_image/" + file.name + "?post_id=default";
    if('post_id' in file){
        a.href = "/get_post_image/" + file.name + "?post_id=" + file.post_id;
    }
    a.className = 'file-preview-name';
    var link = document.createTextNode(file.name);
    a.appendChild(link);
    a.title = file.name;
    div.appendChild(a);
    document.getElementById('file-preview').appendChild(div);
  }
}

function previewEditFile(file) {
//  console.log(file);
  let reader = new FileReader();
  console.log(file);
  reader.readAsDataURL(file);
  reader.onloadend = function() {
    let div = document.createElement('div');
    div.id = file.name;
    div.className = 'file-preview-div';
    var a = document.createElement('a');
    a.href = "/get_post_image/" + file.name + "?post_id=default";
    if('post_id' in file){
        a.href = "/get_post_image/" + file.name + "?post_id=" + file.post_id;
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
    div.appendChild(a);
    div.appendChild(btn);
    document.getElementById('file-preview').appendChild(div);
  }
}

function removeFile(file){
  var url = 'remove_post_file';
  var formData = new FormData();
  d = {file_name: file.name, type: file.type};
  if('post_id' in file){
    d = {file_name: file.name, post_id: file.post_id, type: file.t};
  }

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
        success: function(data){
            LoadStop();
            //MakeSnackbar(data);
            document.getElementById(file.name).remove();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            LoadStop();
        }
    });
}
