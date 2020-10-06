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
      files.forEach(previewFile);
  }
}

function uploadPostFile(file, fileType) {
  var url = 'upload_post_file';
  var formData = new FormData();

  formData.append('file', file);
  formData.append('data', JSON.stringify({file_name: file.name}));
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
            MakeSnackbar(data);
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


function previewFile(file) {
//  console.log(file);
  let reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onloadend = function() {
    let img = document.createElement('img')
    img.src = reader.result
    document.getElementById('gallery').appendChild(img)
  }
}
