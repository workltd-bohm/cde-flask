function GetProjects(form) {
    LoadStart();
    $.get("/get_all_projects")
        .done(function(data) {
            input_json = JSON.parse(data);
            html = input_json['html'];
            json = input_json['data'];
            form.empty();
            form.append(html);
            form_list = form.find(".form__field");
            for (var i = 0; i < json.length; i++) {
                d3.select(form_list.get(0)).append("option")
                    .attr("value", json[i])
                    .html(json[i]);
            }
            LoadStop();
        })
        .fail(function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar(textStatus);
            PopupClose();
        });
}


function NewProject(form) {
    LoadStart();
    $.get("/get_new_project")
        .done(function(data) {
            input_json = JSON.parse(data);
            html = input_json['html'];
            form.empty();
            form.append(html);
            LoadStop();
        })
        .fail(function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar(textStatus);
            PopupClose();
        });
}

function SharePopup(form) {
    LoadStart();
    $.get("/get_share")
        .done(function(data) {
            input_json = JSON.parse(data);
            html = input_json['html'];
            form.empty();
            form.append(html);
            autocomplete(document.getElementById("user_name_share"), input_json['data']);
            LoadStop();
        })
        .fail(function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar(textStatus);
            PopupClose();
        });
}

function ShareProject(data) {
    LoadStart();
    $.ajax({
        url: "/share_project",
        type: 'POST',
        data: JSON.stringify({
            project_id: data,
            parent_id: SESSION['position'].parent_id,
            user_name: document.getElementById('user_name_share').value,
            role: $("#role_share option:selected").text()
        }),
        timeout: 5000,
        success: function(data) {
            MakeSnackbar(data);
            PopupClose();
            location.reload();
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

function ProjectConfigSubmit() {
    var form = $("#filter-form-project-conf");

    if (!CheckAval(form)) return;
    var d = { project_name: SESSION['name'], 'iso19650': $('#iso19650-checkbox').prop('checked') };
    form.serializeArray().map(function(x) { d[x.name] = x.value; });
    // if (!args) args = d;
    //    console.log(args);
    // console.log(d);

    LoadStart();
    $.ajax({
        url: '/set_project_config',
        type: 'POST',
        data: JSON.stringify(d),
        //dataType: "json",
        processData: false,
        contentType: false,
        timeout: 5000,
        success: function(data) {
            MakeSnackbar(data);
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

var folders_only = false;
var counter = 1;
var total = 0;
var listing = null;
var dropArea = null;
var box = null;
var interval = null;

function UploadProject(form) {
    LoadStart();
    $.get("/get_upload_project")
        .done(function(data) {
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

            folders_only = false;

            LoadStop();
        })
        .fail(function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar(textStatus);
            PopupClose();
        });
}

function sendFilesHelper(files, folders) {
    if (!folders_only || (folders_only && !$("#is_iso19650_checkbox").is(':checked'))) {
        if (folders_only) {
            $("#is_iso19650_checkbox").hide();
            $("#is_iso19650_label").hide();
        }
        total = files.length;
        dropArea.style.display = "none";
        createProject(files, folders);
    } else {
        createISORenamingPopup(files, folders);
    }

}

function createProject(files, folders) {
    var current = 0;
    counter = 1;
    if (folders_only) {
        sendFile(files, folders, current);
    } else {
        if (files.length > 0) {
            project_name = files[current].path.substring(1).split('/')[0];
        } else {
            project_name = folders[current].path.substring(1).split('/')[0];
        }
        let data = { project_name: project_name };
        //        console.log(data);
        listing.innerHTML = 'Crating ' + project_name;
        $.ajax({
            url: 'create_project',
            type: 'POST',
            data: JSON.stringify(data),
            processData: false,
            contentType: false,
            //        timeout: 20000,
            success: function(data) {
                //            console.log(data);
                listing.innerHTML = "Project " + project_name + ' ' + data;

                sendFile(files, folders, current);

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
}

// Function to send a file, call PHP backend
function sendFile(files, folders, current, fileData = {}) {
    file = files[current];
    var formData = new FormData();
    var request = new XMLHttpRequest();
    let path = ''
        // console.log(files);
    if (counter > total) {
        // console.log(folders);
        if (folders.length == 0) {
            CheckSession();
            //CreateProject();
            PopupClose();
            return;
        }
        path = folders[0].path;
        if (folders_only) {
            $('#upload_files_div').hide();
            $('#upload_files_button').hide();
            path = SESSION['position'].path + '/' + path;
            folders.forEach(folder => folder.path = SESSION['position'].path + '/' + folder.path)
        }
        listing.innerHTML = "Uploading " + total + " file(s) is done!<br>Creating folder structure. Please wait";
        box.innerHTML = "";
        interval = setInterval(adjustBox, 500);
        //        adjustBox();
        formData.set('folders', JSON.stringify(folders));
        formData.set('path', path);
        formData.set('is_dir', true);
    } else {
        if (file.path.startsWith('/'))
            path = file.path.substring(1);
        else
            path = file.path;
        if (folders_only) {
            $('#upload_files_div').hide();
            $('#upload_files_button').hide();
            path = SESSION['position'].path + '/' + path;
            file.path = path;
            formData.set('file_data', JSON.stringify(fileData['file_' + current]));
        }
        listing.innerHTML = "Uploading file<br>" + path.split('/').slice(-1)[0] + " (" + counter + " of " + total + " ) ";
        box.innerHTML = Math.min((counter) / total * 100, 100).toFixed(2) + "%";
        formData.set('file', file.file); // One object file
        formData.set('path', path); // String of local file's path
        formData.set('is_dir', false);
    }
    formData.set('counter', counter);
    formData.set('total', total);

    $.ajax({
        url: 'upload_existing_project',
        type: 'POST',
        data: formData,
        //dataType: "json",
        processData: false,
        contentType: false,
        //        timeout: 20000,
        success: function(data) {
            //            console.log(data);

            if (counter > total) {
                listing.innerHTML = data;
                //                box.innerHTML = "<br>Creating " + path.split('/')[0] + " project. This may take several minutes";
                //                adjustBox();
                stopFunction();
                MakeSnackbar(data);
                //                PopupClose();
                //                console.log(data);
                if (data == "Successfully uploaded") {
                    //                    counter = 1;
                    CheckSession();
                    //CreateProject();
                    MakeSnackbar(data);
                    PopupClose();
                }
            } else {
                listing.innerHTML = "Uploaded<br>" + data + " (" + counter + " of " + total + " ) ";
                // Show percentage
                box.innerHTML = Math.min((counter) / total * 100, 100).toFixed(2) + "%";
                counter++;
                sendFile(files, folders, current + 1, fileData);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401 || $jqXHR.status == 409) {
                location.reload();
            }
        }
    });

}

function adjustBox() {
    var wait = document.getElementById("wait");
    if (wait.innerHTML.length > 5)
        wait.innerHTML = "";
    else
        wait.innerHTML += ".";
}

function stopFunction() {
    document.getElementById("wait").innerHTML += "";
    clearInterval(interval);
}

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
        //    console.log("dir", entries, path);
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
        //    console.log("dir path", path.substring(1))
        if (path.startsWith('/'))
            path = file.path.substring(1);
        webkitResultDir.push({ 'path': path, 'isDir': true });

        return Promise.resolve(webkitResultDir);
    }
    // TODO: handle mozilla files
    function listFile(file, path) {
        path = path || file.webkitRelativePath || "/" + file.name;

        //    console.log("file path", path)
        //console.log(`reading ${file.name}, size: ${file.size}, path:${path}`);
        webkitResult.push({ 'path': path, 'file': file, 'isDir': false });
        return Promise.resolve(webkitResult)
    };

    function processFiles(files) {
        Promise.all([].map.call(files, function(file, index) {
                return handleEntries(file, index).then(handleFile)
            }))
            .then(function() {
                //        console.log("complete", webkitResult);
                //        console.log("complete dir", webkitResultDir);
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
                    //          console.log(dir)
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
                            throw new Error("could not process '" + dir[0].name + "' directory" +
                                " at drop event at firefox, upload folders at 'Choose folder...' input");
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