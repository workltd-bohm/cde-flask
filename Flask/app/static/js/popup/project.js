
function GetProjects(form){
    LoadStart();
    $.get( "/get_all_projects")
        .done(function( data ) {
            input_json = JSON.parse(data);
            html = input_json['html'];
            json = input_json['data'];
            form.empty();
            form.append(html);
            form_list = form.find(".form__field");
            for(var i = 0; i < json.length; i++) {
                d3.select(form_list.get(0)).append("option")
                    .attr("value",json[i])
                    .html(json[i]);
            }
            LoadStop();
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
            PopupClose();
        });
}


function NewProject(form){
    LoadStart();
    $.get( "/get_new_project")
        .done(function( data ) {
            input_json = JSON.parse(data);
            html = input_json['html'];
            form.empty();
            form.append(html);
            LoadStop();
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
            PopupClose();
        });
}

function SharePopup(form){
    LoadStart();
    $.get( "/get_share")
        .done(function( data ) {
            input_json = JSON.parse(data);
            html = input_json['html'];
            form.empty();
            form.append(html);
            LoadStop();
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
            PopupClose();
        });
}

function ShareProject(data){
    LoadStart();
    $.ajax({
        url: "/share_project",
        type: 'POST',
        data: JSON.stringify({
            project_id: data,
            user_name: document.getElementById('user_name').value,
            role: $("#role option:selected").text()
        }),
        timeout: 5000,
        success: function(data){
            MakeSnackbar(data);
            PopupClose();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });
}
var counter = 1;
var total = 0;
var listing = null;
var box = null;
function UploadProject(form){
    LoadStart();
    $.get( "/get_upload_project")
        .done(function( data ) {
            input_json = JSON.parse(data);
            html = input_json['html'];
            form.empty();
            form.append(html);
            var picker = document.getElementById("picker");
            listing = document.getElementById('listing');
            box = document.getElementById('box');

            picker.addEventListener('change', e => {
                // Reset previous upload progress
                listing.innerHTML = "";
                // Get total of files in that folder
                total = picker.files.length;
                counter = 1;
                // Process every single file
//                e.preventDefault();
//                e.dataTransfer.effectAllowed = 'copy';
//                e.dataTransfer.setData('Text', this.id);
//                console.log(e.target.webkitEntries);
                for (var i = 0; i < picker.files.length; i++) {
                    var file = e.target.files[i];
//                    console.log(file);
                    sendFile(file, file.webkitRelativePath, i+1);
                }
//                MakeSnackbar("Upload completed!");
//                PopupClose();
//                LoadStop();
            });
            LoadStop();
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
            PopupClose();
        });
}

// Function to send a file, call PHP backend
    sendFile = function(file, path, current) {
//        console.log(file);
        // Set post variables
        var item = document.createElement('li');
        var formData = new FormData();
        var request = new XMLHttpRequest();

        formData.set('file', file); // One object file
        formData.set('path', path); // String of local file's path
        formData.set('counter', current);
        formData.set('total', total);

        $.ajax({
        url: 'upload_existing_project',
        type: 'POST',
        data: formData,
        //dataType: "json",
        processData: false,
        contentType: false,
//        timeout: 20000,
        success: function(data){
//            console.log(data);

            listing.innerHTML = data + " (" + counter + " of " + total + " ) ";
            // Show percentage
            box.innerHTML = Math.min(counter / total * 100, 100).toFixed(2) + "%";

            // Increment counter
            counter = counter + 1;

            if (counter >= total) {
                listing.innerHTML = "Uploading " + total + " file(s) is done!";
                MakeSnackbar(data);
//                PopupClose();
                console.log(data);
                if(data == "Project successfully uploaded"){
                    location.reload();
                }
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });

    };

//function sendFiles(file){
//
//    var fd = new FormData();
//    fd.append('file', file);
////    fd.append('data', 'datatata');
//    console.log(fd.get('file'));
//
//    $.ajax({
//        url: 'upload_existing_project',
//        type: 'POST',
//        data: fd,
//        //dataType: "json",
//        processData: false,
//        contentType: false,
////        timeout: 20000,
//        success: function(data){
////            location.reload();
//            console.log(data);
//            MakeSnackbar(data);
//        },
//        error: function($jqXHR, textStatus, errorThrown) {
//            console.log( errorThrown + ": " + $jqXHR.responseText );
//            MakeSnackbar($jqXHR.responseText);
//            PopupClose();
//        }
//    });
//}


function addFiles(e){
        e.stopPropagation();
        e.preventDefault();
        console.log('++++++++++++++++++++++++++++++++++');
        console.log(e);
        console.log(e.dataTransfer);
        console.log(e.target.files);
        // if directory support is available
        if(e.dataTransfer && e.dataTransfer.items)
        {
            console.log('ovdeeeeeeeeee')
            var items = e.dataTransfer.items;
            for (var i=0; i<items.length; i++) {
                var item = items[i].webkitGetAsEntry();

                if (item) {
                  addDirectory(item);
                }
            }
            return;
        }

        // Fallback
        var files = e.target.files || e.dataTransfer.files;
        if (!files.length)
        {
            alert('File type not accepted');
            return;
        }
        console.log(files);
        for(var i=0; i<files.length; i++){
            sendFiles(files[i]);
        };

    }

    function addDirectory(item) {
        var _this = this;
        if (item.isDirectory) {
            var directoryReader = item.createReader();
            directoryReader.readEntries(function(entries) {
            entries.forEach(function(entry) {
                    _this.addDirectory(entry);
                });
            });
        } else {
            item.file(function(file){
                processFile([file],0);
            });
        }
    }

function readFiles(){

//    var files = document.getElementById("files").files;
//    LoadStart();
//    var fd = new FormData();
//    fd.append('file', files);
//    console.log(fd['file']);
//    for (var file = 0 ; file < files.length; file++) {
//
//        $.ajax({
//            url: "/upload_existing_project",
//            type: 'POST',
//            data: fd,
//            timeout: 5000,
//            success: function(data){
//                console.log(data);
//
//
//            },
//            error: function($jqXHR, textStatus, errorThrown) {
//                console.log( errorThrown + ": " + $jqXHR.responseText );
//                MakeSnackbar($jqXHR.responseText);
//                PopupClose();
//            }
//        });
////        console.log(files.length);
////        console.log(file);
////        var reader = new FileReader();
////        reader.onload = function(e){
////            var object = new Object();
////            object.content = e.target.content;
////            var json_upload = "jsonObject=" + JSON.stringify(object);
////            console.log(json_upload);
////            var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
////            xmlhttp.open("POST", "upload_existing_project");
////            xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
////            xmlhttp.send(json_upload);
////        }
////        reader.readAsBinaryString(file);
//    }

//    $.ajax({
//        url: 'upload_existing_project',
//        type: 'POST',
//        data: fd,
//        //dataType: "json",
//        processData: false,
//        contentType: false,
//        timeout: 5000,
//        success: function(data){
////            location.reload();
//            console.log(data);
//            MakeSnackbar(data);
//        },
//        error: function($jqXHR, textStatus, errorThrown) {
//            console.log( errorThrown + ": " + $jqXHR.responseText );
//            MakeSnackbar($jqXHR.responseText);
//            PopupClose();
//        }
//    });

}

function OpenFolderDialog(){
    var input = document.createElement('input');
    input.webkitdirectory  = True;
    input.directory  = True;
    input.onchange = e => {

       // getting a hold of the file reference
       var file = e.target.files[0];
        console.log('ovde');
//       PopupOpen(NewFile, data, file);
    }
    input.click();
}
