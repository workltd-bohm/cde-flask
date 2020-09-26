var images = [];

let dropArea = document.getElementById('drop-area');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults (e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
  dropArea.classList.add('highlight');
}

function unhighlight(e) {
  dropArea.classList.remove('highlight');
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  let dt = e.dataTransfer;
  let files = dt.files;

  handleFiles(files);
}

function handleFiles(files) {
  files = [...files]
  files.forEach(uploadPostFile)
  files.forEach(previewFile)
}


function uploadPostFile(file) {
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
            images.push(file.name);
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            LoadStop();
        }
    });
}


function previewFile(file) {
  let reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onloadend = function() {
    let img = document.createElement('img')
    img.src = reader.result
    document.getElementById('gallery').appendChild(img)
  }
}
