
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
var dropArea = null;
var box = null;
function UploadProject(form){
    LoadStart();
    $.get( "/get_upload_project")
        .done(function( data ) {
            input_json = JSON.parse(data);
            html = input_json['html'];
            form.empty();
            form.append(html);

            listing = document.getElementById('listing');
            box = document.getElementById('box');
            dropArea = document.getElementById("dropArea");
            dropArea.addEventListener("dragover", dragHandler);
            dropArea.addEventListener("dragleave", dragLeave);
            dropArea.addEventListener("change", filesDroped);
            dropArea.addEventListener("drop", filesDroped);


//            var upload_project = document.getElementById("upload_project");
//            var dropArea = document.getElementById("drop-area-folders");
//            dropArea.addEventListener("dragover", dragHandler);
//            dropArea.addEventListener("change", filesDroped);
//            dropArea.addEventListener("drop", filesDroped);

//            var picker = document.getElementById("picker");
//            listing = document.getElementById('listing');
//            box = document.getElementById('box');
//
//            picker.addEventListener('change', e => {
//                // Reset previous upload progress
//                listing.innerHTML = "";
//                // Get total of files in that folder
//                total = picker.files.length;
//                counter = 1;
//                // Process every single file
////                e.preventDefault();
////                e.dataTransfer.effectAllowed = 'copy';
////                e.dataTransfer.setData('Text', this.id);
////                console.log(e.target.webkitEntries);
//                for (var i = 0; i < picker.files.length; i++) {
//                    var file = e.target.files[i];
////                    console.log(file);
//                    sendFile(file, file.webkitRelativePath, i+1);
//                }
////                MakeSnackbar("Upload completed!");
////                PopupClose();
////                LoadStop();
//            });
            LoadStop();
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
            PopupClose();
        });
}


function sendFilesHelper(files, folders){
    total = files.length;
    for (var i = 0; i < files.length; i++) {
        file = files[i];
//                    console.log(file);
        if(i == files.length - 1){
            sendFile(file.file, file.path.substring(1), file.isDir, i+1, folders);
        }else{
            sendFile(file.file, file.path.substring(1), file.isDir, i+1);
        }
    }
//    total = folders.length;
//    for (var i = 0; i < files.length; i++) {
//        file = JSON.parse(files[i]);
////                    console.log(file);
//        sendFile(file.file, file.path, file.isDir, i+1);
//    }
}

// Function to send a file, call PHP backend
    sendFile = function(file, path, isDir, current, folders=null) {
//        console.log(file);
        // Set post variables
        var item = document.createElement('li');
        var formData = new FormData();
        var request = new XMLHttpRequest();

        formData.set('file', file); // One object file
        formData.set('path', path); // String of local file's path
        formData.set('counter', current);
        formData.set('total', total);
        formData.set('is_dir', isDir);
        if(folders != null){
            formData.set('folders', JSON.stringify(folders));
        }

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
            if(counter == 1){
                dropArea.style.display = "none";
            }

            listing.innerHTML = data + " (" + counter + " of " + total + " ) ";
            // Show percentage
            box.innerHTML = Math.min(counter / total * 100, 100).toFixed(2) + "%";

            // Increment counter
            counter = counter + 1;

            if (counter >= total) {
                listing.innerHTML = "Uploading " + total + " file(s) is done!";
                box.innerHTML = "<br>Creating " + path.split('/')[0] + " project. This may take several minutes";
                adjustBox();
                MakeSnackbar("Uploading " + total + " file(s) is done!");
//                PopupClose();
                console.log(data);
                if(data == "Project successfully uploaded"){
                    counter = 1;
                    location.reload();
                    MakeSnackbar(data);
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

function adjustBox(){

    var dots = window.setInterval( function() {
                var wait = document.getElementById("wait");
                if ( wait.innerHTML.length > 5 )
                    wait.innerHTML = "";
                else
                    wait.innerHTML += ".";
                }, 500);
}

//function addFiles(e){
//        e.stopPropagation();
//        e.preventDefault();
//        console.log('++++++++++++++++++++++++++++++++++');
//        console.log(e);
//        console.log(e.dataTransfer);
//        console.log(e.target.files);
//        // if directory support is available
//        if(e.dataTransfer && e.dataTransfer.items)
//        {
//            console.log('ovdeeeeeeeeee')
//            var items = e.dataTransfer.items;
//            for (var i=0; i<items.length; i++) {
//                var item = items[i].webkitGetAsEntry();
//
//                if (item) {
//                  addDirectory(item);
//                }
//            }
//            return;
//        }
//
//        // Fallback
//        var files = e.target.files || e.dataTransfer.files;
//        if (!files.length)
//        {
//            alert('File type not accepted');
//            return;
//        }
//        console.log(files);
//        for(var i=0; i<files.length; i++){
//            sendFiles(files[i]);
//        };
//
//    }
//
//    function addDirectory(item) {
//        var _this = this;
//        if (item.isDirectory) {
//            var directoryReader = item.createReader();
//            directoryReader.readEntries(function(entries) {
//            entries.forEach(function(entry) {
//                    _this.addDirectory(entry);
//                });
//            });
//        } else {
//            item.file(function(file){
//                processFile([file],0);
//            });
//        }
//    }

//
//function OpenFolderDialog(){
//    var input = document.createElement('input');
//    input.webkitdirectory  = True;
//    input.directory  = True;
//    input.onchange = e => {
//
//       // getting a hold of the file reference
//       var file = e.target.files[0];
//        console.log('ovde');
////       PopupOpen(NewFile, data, file);
//    }
//    input.click();
//}

//var dropArea = document.getElementById("dropArea");
    // var output = document.getElementById("result");
    //var ul = output.querySelector("ul");

function dragHandler(event) {
  event.stopPropagation();
  event.preventDefault();
  dropArea.className = "area drag";
}

function dragLeave(event) {
  event.stopPropagation();
  event.preventDefault();
  dropArea.className = "area";
}

function filesDroped(event) {
  var webkitResult = [];
  var webkitResultDir = [];
  var mozResult = [];
  var files;
  //console.log(event);
  event.stopPropagation();
  event.preventDefault();
  dropArea.className = "area";

  // do mozilla stuff
  // TODO adjust, call `listDirectory()`, `listFile()`
  function mozReadDirectories(entries, path) {
    console.log("dir", entries, path);
    return [].reduce.call(entries, function(promise, entry) {
        return promise.then(function() {
          return Promise.resolve(entry.getFilesAndDirectories() || entry)
            .then(function(dir) {
              return dir
            })
        })
      }, Promise.resolve())
      .then(function(items) {
        var dir = items.filter(function(folder) {
          return folder instanceof Directory
        });
        var files = items.filter(function(file) {
          return file instanceof File
        });
        if (files.length) {
          // console.log("files:", files, path);
          files.forEach(function(file) {
            console.log(file)
          });
          mozResult = mozResult.concat.apply(mozResult, files);
        }
        if (dir.length) {
          // console.log(dir, dir[0] instanceof Directory);
          return mozReadDirectories(dir, dir[0].path || path);

        } else {
          if (!dir.length) {
            return Promise.resolve(mozResult).then(function(complete) {
              return complete
            })
          }
        }

      })

  };

  function handleEntries(entry) {
    let file = "webkitGetAsEntry" in entry ? entry.webkitGetAsEntry() : entry
    return Promise.resolve(file);
  }

  function handleFile(entry) {
    return new Promise(function(resolve) {
      if (entry.isFile) {
        entry.file(function(file) {
          listFile(file, entry.fullPath).then(resolve)
        })
      } else if (entry.isDirectory) {
        var reader = entry.createReader();
        reader.readEntries(webkitReadDirectories.bind(null, entry, handleFile, resolve))
      } else {
        var entries = [entry];
        return entries.reduce(function(promise, file) {
            return promise.then(function() {
              return listDirectory(file)
            })
          }, Promise.resolve())
          .then(function() {
            return Promise.all(entries.map(function(file) {
              return listFile(file)
            })).then(resolve)
          })
      }
    })

    function webkitReadDirectories(entry, callback, resolve, entries) {
      //console.log(entries);
      return listDirectory(entry).then(function(currentDirectory) {
        //console.log(`iterating ${currentDirectory.name} directory`, entry);
        return entries.reduce(function(promise, directory) {
          return promise.then(function() {
            return callback(directory)
          });
        }, Promise.resolve())
      }).then(resolve);
    }

  }
  // TODO: handle mozilla directories, additional directories being selected dropped and listed without
  // creating nested list at `html` where different directory selected or dropped
  function listDirectory(entry) {
//        console.log('listDirectory', entry);
    var path = (entry.fullPath || entry.webkitRelativePath.slice(0, entry.webkitRelativePath.lastIndexOf("/")));
//    var cname = path.split("/").filter(Boolean).join("-");
    console.log("dir path", path.substring(1))
    webkitResultDir.push({'path': path.substring(1), 'isDir': true});

    return Promise.resolve(webkitResultDir);
  }
   // TODO: handle mozilla files
  function listFile(file, path) {
    path = path || file.webkitRelativePath || "/" + file.name;

    console.log("file path", path)
    //console.log(`reading ${file.name}, size: ${file.size}, path:${path}`);
    webkitResult.push({'path': path, 'file': file, 'isDir': false});
    return Promise.resolve(webkitResult)
  };

  function processFiles(files) {
    Promise.all([].map.call(files, function(file, index) {
        return handleEntries(file, index).then(handleFile)
      }))
      .then(function() {
        console.log("complete", webkitResult);
        console.log("complete dir", webkitResultDir);
        sendFilesHelper(webkitResult, webkitResultDir);
      })
      .catch(function(err) {
        alert(err.message);
      })
  }

  if ("getFilesAndDirectories" in event.target) {
    return (event.type === "drop" ? event.dataTransfer : event.target).getFilesAndDirectories()
      .then(function(dir) {
        if (dir[0] instanceof Directory) {
          console.log(dir)
          return mozReadDirectories(dir, dir[0].path || path)
            .then(function(complete) {
              console.log("complete:", complete);
              event.target.value = null;
            });
        } else {
          if (dir[0] instanceof File && dir[0].size > 0) {
          return Promise.resolve(dir)
                .then(function(complete) {
                  console.log("complete:", complete);
                })
          } else {
            if (dir[0].size == 0) {
              throw new Error("could not process '" + dir[0].name + "' directory"
                              + " at drop event at firefox, upload folders at 'Choose folder...' input");
            }
          }
        }
      }).catch(function(err) {
        alert(err)
      })
  }

  // do webkit stuff
  if (event.type === "drop" && event.target.webkitdirectory) {
    files = event.dataTransfer.items || event.dataTransfer.files;
  } else if (event.type === "change") {
    files = event.target.files;
  }

  if (files) {
    processFiles(files)
  }

}

