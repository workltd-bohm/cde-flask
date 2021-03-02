var alreadyIn = false;
var suggest = false;
var currentArr = [];
var tagsArr = [];
var keyWordsArr = [];
var currentActiveArr = '';
var currField = '';

function onFocus() {
    $("#terminal-span").show();
    terInput = $('#terminal-input').val();
    if (terInput.split(' ').length > 1) {
        if (currentActiveArr == 'suggests' || currentActiveArr == '') getTags(document.getElementById("terminal-input"));
    } else {
        if (currentActiveArr == 'tags' || currentActiveArr == '') get_help_suggest();
    }
}

function onFocusOut() {
    $("#terminal-input").val("");

}

$(window).keydown(function(e) {
    //    console.log(e.keyCode);
    terInput = $('#terminal-input').val();
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 70) {
        e.preventDefault();
        $('#terminal-input').focus();
        if (terInput.split(' ').length > 1) {
            if (currentActiveArr == 'suggests' || currentActiveArr == '') getTags(document.getElementById("terminal-input"));
        } else {
            if (currentActiveArr == 'tags' || currentActiveArr == '') get_help_suggest();
        }
    }
});


function terminalListen(el) {
    var key = window.event.keyCode;
    if (key != 13)
        return true;
    if (key === 13 && el.shiftKey) {
        return true;
    }
    if ($('#terminal-input').val() == '') {
        return true;
    }
    terminal = $('#terminal-input').val().split(' ');

    $('#terminal-input').val('');

    console.log(terminal);
    // console.log(SESSION);

    switch (terminal[0]) {
        case 'new_folder':
            if (terminal.length > 1) {
                args = {
                    parent_id: SESSION['position'].parent_id,
                    ic_id: SESSION['position'].ic_id,
                    project_name: SESSION['position'].project_name,
                    parent_path: SESSION['position'].path,
                    new_name: terminal.slice(1).join(' ')
                }
                FormSubmit('create_dir', args, true, CreateProject);
            } else {
                PopupOpen(NewFolder, SESSION['position']);
            }
            break;
        case 'create_file':
            // OpenFileDialog(SESSION['position']);
            break;
        case 'open':
            if (SESSION['position'].is_directory) {
                OpenFilterActivity(SESSION['position'], open);
            } else {
                PreviewOpen(OpenFile, SESSION['position'], null, open);
            }
            break;
        case 'rename':
            PopupOpen(RenameFile, SESSION['position']);
            break;
        case 'help':
            PopupOpen(Help);
            break;
        case 'tag':
            addTag(terminal);
            break;
        default:
            if (!keyWordsArr.includes(terminal[0]) && !tagsArr.includes(terminal[0])) {
                console.log(terminal);
                $('#terminal-input').val(terminal.join(' '));
                searchByName(terminal);
            }
            break;

    }
}


function RemoveLastDirectoryPartOf(the_url) {
    var the_arr = the_url.split('/');
    the_arr.pop();
    return (the_arr.join('/'));
}

function Help(form) {
    LoadStart();
    $.get("/get_help")
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

function getTags(field) {
    if (tagsArr.length > 0) {
        currentArr = tagsArr;
        currentActiveArr = 'tags';
        if (currField != field) {
            terminalAutocomplete(field, input_json['data']);
            currField = field;
        }
    } else {
        $.get("/get_all_tags")
            .done(function(data) {
                input_json = JSON.parse(data);
                //            console.log(input_json['data']);
                currentArr = input_json['data'];
                tagsArr = input_json['data'];
                currentActiveArr = 'tags';
                //                if(field == ''){
                //                    field = document.getElementById("terminal-input");
                //                    addTagActive = false;
                //                }
                //                else{
                //                    addTagActive = true;
                //                }
                terminalAutocomplete(field, input_json['data']);
                currField = field;


            })
            .fail(function($jqXHR, textStatus, errorThrown) {
                console.log(errorThrown + ": " + $jqXHR.responseText);
                MakeSnackbar(textStatus);
            });
    }
}

function get_help_suggest(field = '') {
    if (keyWordsArr.length > 0) {
        currentArr = keyWordsArr;
        currentActiveArr = 'suggests';
    } else {
        $.get("/get_help_suggest")
            .done(function(data) {
                input_json = JSON.parse(data);
                //            console.log(input_json['data']);
                currentArr = input_json['data'];
                keyWordsArr = input_json['data'];
                currentActiveArr = 'suggests';
                if (field == '') {
                    field = document.getElementById("terminal-input");
                }
                terminalAutocomplete(field, input_json['data']);
            })
            .fail(function($jqXHR, textStatus, errorThrown) {
                console.log(errorThrown + ": " + $jqXHR.responseText);
                MakeSnackbar(textStatus);
            });
    }
}

/* move these to helper.js */
function isColor(strColor) {
    var s = new Option().style;
    s.color = strColor;
    return s.color == strColor;
}

function isString(variable) {
    return typeof variable == 'string';
}
/* * * *  helper fs  * * * */

function createTempTag(name, color = 'white') {
    let t_container;
    let t_inner;
    let tag;
    let all_tags = document.getElementsByClassName('tag-wrapper')[0];
    t_container = document.createElement("div");
    t_container.className = "tag-container";
    t_inner = document.createElement('div');
    t_inner.className = "tag";
    tag = document.createElement('i');
    tag.append(name);

    all_tags.append(t_container);
    t_container.append(t_inner);
    t_inner.append(tag);
    t_inner.style.backgroundColor = color;
    tag.style.color = (color == 'white') ? 'black' : 'white';

    let span_name = document.createElement("span");
    span_name.className = 'tag-x';
    span_name.onclick = function() {
        deleteTempTag(t_container);
    };
    span_name.innerText = "✕";
    t_container.append(span_name);

    // apply changes to container
    all_tags.append(t_container);
}

function deleteTempTag(elem) {
    let name = elem.getElementsByTagName("i")[0].innerText;
    alert(name);
    console.log(tagBuffer);

    for (let i = 0; i < tagBuffer.length; i++) {
        if (tagBuffer[i].tag == name) {
            tagBuffer.splice(i);
            elem.remove();
        }
    }
}

function bufferTag(terminal) {
    for (i = 1; i < terminal.length; i++) {
        if (isString(terminal[i])) {
            if (terminal[i].startsWith("#")) {
                // prevent duplication
                if (tagBuffer.includes(terminal[i])) { continue; }

                // check if has color
                if (i + 1 <= terminal.length) {
                    if (isColor(terminal[i + 1])) {

                        tagBuffer.push({
                            tag: terminal[i],
                            color: terminal[i + 1]
                        });

                        createTempTag(terminal[i], color = terminal[i + 1]);
                        i++;
                        continue;
                    }
                }
                tagBuffer.push({
                    tag: terminal[i]
                });

                createTempTag(terminal[i]);
            }
        }
    }
}

var tagBuffer = [];

function addTag(terminal, buffer = false) {
    LoadStart();

    if (buffer) {
        bufferTag(terminal);
        return;
    }

    let post_id = $("#post_id").val();
    let project_name;
    if (SESSION['position']) {
        // todo when market has session, find another way to filter out
        // etc post_id = SESSION['position'].post_id
        project_name = SESSION['position'].project_name;
        if (project_name == '') {
            project_name = SESSION['name'];
        }
    }

    $.ajax({
        url: "/add_tag",
        type: 'POST',
        data: JSON.stringify(project_name ? {
            project_name: SESSION['position'].project_name,
            ic_id: SESSION['position'].ic_id,
            parent_id: SESSION['position'].parent_id,
            is_directory: SESSION['position'].is_directory,
            iso: 'simple',
            tags: terminal
        } : {
            post_id: post_id,
            tags: terminal
        }),
        timeout: 5000,
        success: function(data) {
            MakeSnackbar(data);
            LoadTag(terminal);
            LoadStop();
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

var addTagActive = false;

function addTagListen(el, buffer = false) {
    if (!addTagActive) {
        getTags(document.getElementById("add-tag"));
    }

    if (el.type !== "click") {
        var key = window.event.keyCode;
        if (key != 13)
            return true;
        if (key === 13 && el.shiftKey) {
            return true;
        }
    }

    if (!$("#add-tag").val()) return;
    tagsValue = $('#add-tag').val().split(' ');

    $('#add-tag').val('');

    if (tagsValue[0] != "tag") {
        tagsValue.unshift("tag");
    }

    addTag(tagsValue, buffer);
}

function refreshTags() {
    let project_name = SESSION['position'].project_name;

    $.ajax({
        url: "/get_ic_tags",
        type: 'POST',
        data: JSON.stringify(project_name ? {
            project_name: SESSION['position'].project_name,
            ic_id: SESSION['position'].ic_id,
            parent_id: SESSION['position'].parent_id,
            is_directory: SESSION['position'].is_directory
        } : {
            post_id: post_id,
            tag: tagName,
            color: tagColor
        }),
        timeout: 5000,
        success: function(data) {
            data = JSON.parse(data);
            $(".tag-container").remove();
            for (let i = 0; i < data.length; i++) {
                console.log(data[i]);
                if (!data[i].tag.includes(",") && data[i].key != 'project_code' && data[i].key != 'company_code') {
                    createTempTag(data[i].tag.replace(/_/, "."), data[i].color);
                }
            }
            LoadStop();
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

function removeTag(tagName, tagColor) {
    LoadStart();

    let post_id = $("#post_id").val();
    let project_name;
    if (SESSION['position']) { // todo when market has session, find another way to filter out
        project_name = SESSION['position'].project_name;
    }

    $.ajax({
        url: "/remove_tag",
        type: 'POST',
        data: JSON.stringify(project_name ? {
            project_name: SESSION['position'].project_name,
            ic_id: SESSION['position'].ic_id,
            parent_id: SESSION['position'].parent_id,
            is_directory: SESSION['position'].is_directory,
            tag: tagName,
            color: tagColor
        } : {
            post_id: post_id,
            tag: tagName,
            color: tagColor
        }),
        timeout: 5000,
        success: function(data) {
            MakeSnackbar(data);
            LoadStop();
            t = document.getElementById(tagName + ' ' + tagColor);
            t.parentNode.removeChild(t);
            //            location.reload();
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

function LoadTag(terminal) {
    console.log(terminal);
    activityTagContainer = document.getElementsByClassName('tag-wrapper')[0];
    for (i = 1; i < terminal.length; i++) {
        if (terminal[i].startsWith('#')) {
            var tag = terminal[i];
            var color = 'white';
            if (i < terminal.length - 1) {
                if (!terminal[i + 1].startsWith('#')) {
                    if (isColor(terminal[i + 1])) {
                        color = terminal[i + 1];
                    }
                    i++;
                }
            }

            existingTags = document.getElementsByClassName('tag-container');

            var alreadyInside = false;
            for (j = 0; j < existingTags.length; j++) {
                if (existingTags[j].id == tag + ' ' + color) {
                    alreadyInside = true;
                }
            }

            if (!alreadyInside) {

                addTagInArrayIfMissing(tag, tagsArr);

                tagContainer = document.createElement("div");
                tagContainer.className = "tag-container mb-1";
                tagContainer.id = tag + ' ' + color;
                tagContainer.style.backgroundColor = color;

                tagDiv = document.createElement("div");
                tagDiv.className = "tag";

                tagI = document.createElement("i");
                var iColor = 'white;';
                if (color == 'white') {
                    iColor = 'black;';
                }
                tagI.style.cssText = "color: " + iColor + ";";
                tagI.innerHTML = tag;

                tagSpan = document.createElement("span");
                tagSpan.className = "tag-x";
                tagSpan.style.backgroundColor = color;
                tagSpan.onclick = function() {
                    removeTag(tag, color);
                };
                tagSpan.innerHTML = '✕';

                tagDiv.appendChild(tagI);
                tagContainer.appendChild(tagDiv);
                tagContainer.appendChild(tagSpan);

                activityTagContainer.appendChild(tagContainer);
            }
        }
    }
}

function isColor(strColor) {
    var s = new Option().style;
    s.color = strColor;
    return s.color == strColor;
}

function addTagInArrayIfMissing(element, array) {
    array.indexOf(element) === -1 ? array.push(element) : console.log("This item already exists in the local array");
}

let iso_number = "ISO 19650";

function checkISOCompliant() {
    let form = $("#complex_tags");
    let elem = $("#iso_compliant");
    let color = 'green';
    let is_compliant = ' ';
    let response = true;
    form.serializeArray().map(function(x) {
        if (x.name !== "uniclass_2015") {
            if (x.value === "") {
                color = 'red';
                is_compliant = ' not ';
                response = false;
            }
        }
    });
    if ($("#project_code").val() === "" || $("#company_code").val() === "" || $("#role_code").val() === "") {
        color = 'red';
        is_compliant = 'Not ';
        response = false;
    }

    elem.css("color", color);
    elem.text(is_compliant + iso_number + ' compliant');
    return response
}

function updateComplexTags(element) {
    let form = $("#complex_tags");
    args = {}
    form.serializeArray().map(function(x) { args[x.name] = x.value; });

    args['company_code'] = $("#company_code").val();
    args['role_code'] = $("#role_code").val();

    if (!SESSION) {
        alert("Error. No active session found.")
        return;
    }

    let ic = SESSION.position;

    console.log(SESSION);

    // TODO only pass filled parameters

    $.ajax({
        url: "/update_iso_tags",
        type: 'POST',
        data: JSON.stringify({
            project_name: SESSION['name'],
            ic_id: ic.ic_id,
            parent_id: ic.parent_id,
            iso: 'ISO19650',
            tags: args
        }),
        timeout: 5000,
        success: function(data) {
            MakeSnackbar(data);
            LoadStop();
            refreshTags();
            // TODO update current tags (append complex tags to normal tags)
            checkISOCompliant();
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

function terminalAutocomplete(inp, arr) {
    var currentFocus = -1;
    inp.addEventListener("input", function(e) {
        valArray = this.value.split(' ');
        var a, b, i, val = valArray[valArray.length - 1];
        if (valArray.length > 1 || val.toLowerCase() == 'tag' ||
            val.toLowerCase() == 'new_folder' ||
            val.startsWith('#')) {
            if (currentActiveArr == 'suggests' || currentActiveArr == '') getTags(document.getElementById("terminal-input"));
            //            alreadyIn = true;
        } else {
            //            if(currentActiveArr == 'tags') get_help_suggest(false);
            if (currentActiveArr == 'tags' || currentActiveArr == '') get_help_suggest();
            //            suggest = true;
        }
        terminalCloseAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items ps-1");
        this.parentNode.appendChild(a);
        arr = currentArr;
        //      console.log(arr);
        count = 0;
        for (i = 0; i < arr.length; i++) {
            if (count < 10) {
                if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                    count++;
                    b = document.createElement("DIV");
                    b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                    b.innerHTML += arr[i].substr(val.length);
                    b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                    b.addEventListener("click", function(e) {
                        if (valArray.slice(0, -1).length == 0) {
                            preValue = '';
                        } else {
                            preValue = valArray.slice(0, -1).join(' ') + ' ';
                        }
                        inp.value = preValue + this.getElementsByTagName("input")[0].value;
                        terminalCloseAllLists();
                    });
                    a.appendChild(b);
                }
            }
        }
    });
    inp.addEventListener("keydown", function(e) {
        //      console.log(e.keyCode);
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 32) {
            if ($('#terminal-input').is(":focus")) {
                // console.log($('#terminal-input').val());
                if ($('#terminal-input').val().startsWith('#')) {
                    currValArray = $('#terminal-input').val().split('#');
                    // console.log(currValArray);
                    for (i = 0; i < currValArray.length; i++) {
                        if (!currValArray[i].startsWith('#') && currValArray[i] != '') {
                            currValArray[i] = "#" + currValArray[i]
                        }
                    }

                } else {
                    currValArray = $('#terminal-input').val().split(' ');
                }
                for (i = 0; i < currValArray.length; i++) {
                    if (currValArray[i] == '') {
                        currValArray.indexOf(currValArray[i])
                        if (i !== -1) {
                            currValArray.splice(i, 1);
                        }
                    }
                }
                // console.log(currValArray);
                if (currentArr.length > 0) {
                    if (currValArray[0].startsWith('#')) {
                        console.log(currValArray);
                        searchByTag(currValArray);
                    } else {
                        if (!keyWordsArr.includes(currValArray[0]) && !tagsArr.includes(currValArray[0])) {
                            console.log(currValArray);
                            searchByName(currValArray);
                        }
                    }
                }
            }
        }
        if (e.keyCode == 40) {
            currentFocus++;
            terminalAddActive(x);
        } else if (e.keyCode == 38) {
            currentFocus--;
            terminalAddActive(x);
        } else if (e.keyCode == 13) {

            if (!x) {
                $(this).keydown();
            } else {
                if (x.length > 0) {
                    terminalCloseAllLists();
                    e.preventDefault();
                }
            }
            if (currentFocus > -1) {
                if (x) {
                    if ($('#terminal-input').is(":focus")) {
                        if ($('#terminal-input').val().startsWith('#')) {
                            currValArray = $('#terminal-input').val().split('#');
                            for (i = 0; i < currValArray.length; i++) {
                                if (!currValArray[i].startsWith('#') && currValArray[i] != '') {
                                    currValArray[i] = "#" + currValArray[i]
                                }
                            }
                        } else {
                            currValArray = $('#terminal-input').val().split(' ');
                        }
                        // console.log(currValArray);
                        currValArray.splice(currValArray.length - 1);
                        for (i = 0; i < currValArray.length; i++) {
                            if (currValArray[i] == '') {
                                currValArray.indexOf(currValArray[i])
                                if (i !== -1) {
                                    currValArray.splice(i, 1);
                                }
                            }
                        }
                        // console.log(currValArray);
                        currVal = x[currentFocus].getElementsByTagName('input')[0].value;
                        currValArray.push(currVal);
                        // console.log(currValArray);
                        if (currentArr.length > 0) {
                            if (currValArray[0].startsWith('#')) {
                                console.log(currValArray);
                                searchByTag(currValArray);
                            } else {
                                if (!keyWordsArr.includes(currValArray[0]) && !tagsArr.includes(currValArray[0])) {
                                    console.log(currValArray);
                                    searchByName(currValArray);
                                }
                            }
                        }
                    }
                    x[currentFocus].click();
                } else {
                    curr = $('#terminal-input').val().split(' ')[0].toLowerCase()
                    if (curr != 'tag' && curr != 'new_folder' && !curr.startsWith('#'))
                        terminalListen(inp);
                    //                $(window).off('keydown');
                    //                $(window).keydown = key;
                }
            } else {
                terminalListen(inp);
                //            $(window).off('keydown');
                //            $(window).keydown = key;
            }
        }
    });

    function terminalAddActive(x) {
        if (!x) return false;
        terminalRemoveActive(x);
        //    if (!currentFocus) currentFocus = -1;
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }

    function terminalRemoveActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function terminalCloseAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
        //    $(document).off("keydown");
    }
    document.addEventListener("click", function(e) {
        terminalCloseAllLists(e.target);
        console.log(currField.id);
        if (currField.id == 'terminal-input') {
            currField = '';
            $('#terminal-input').focus();
            if ($('#terminal-input').val().startsWith('#')) {
                currValArray = $('#terminal-input').val().split('#');
                // console.log(currValArray);
                for (i = 0; i < currValArray.length; i++) {
                    if (!currValArray[i].startsWith('#') && currValArray[i] != '') {
                        currValArray[i] = "#" + currValArray[i]
                    }
                }

            } else {
                currValArray = $('#terminal-input').val().split(' ');
            }
            for (i = 0; i < currValArray.length; i++) {
                if (currValArray[i] == '') {
                    currValArray.indexOf(currValArray[i])
                    if (i !== -1) {
                        currValArray.splice(i, 1);
                    }
                }
            }
            console.log(currValArray.length);
            if (currentArr.length > 0 && currValArray.length > 0) {
                if (currValArray[0].startsWith('#')) {
                    console.log(currValArray);
                    searchByTag(currValArray);
                } else {
                    if (!keyWordsArr.includes(currValArray[0]) && !tagsArr.includes(currValArray[0])) {
                        console.log(currValArray);
                        searchByName(currValArray);
                    }
                    if (keyWordsArr.includes(currValArray[0])) {
                        terminalListen(document);
                    }
                }
            }
        }
        if (currField.id == 'add-tag') {
            $('#add-tag').focus();
            currField = '';
        }
    });
}

var searchArr = [];

function searchByTag(currValArray) {
    //    tempArr = currValArray;
    // console.log('search arr', searchArr);
    // console.log('curr val arr', currValArray);
    if (!arraysEqual(searchArr, currValArray)) {
        console.log('searchByTag');
        searchArr = currValArray;
        //        LoadStart();
        $.ajax({
            url: "/search_by_tags",
            type: 'POST',
            data: JSON.stringify({
                project_name: SESSION['position'].project_name,
                search_tags: searchArr
            }),
            timeout: 5000,
            success: function(data) {
                data = JSON.parse(data);
                if (data) {
                    data = data.root_ic;
                    g_project.data = data;
                    g_project.skip = SEARCH_HISTORY;
                    GetWarp(data);
                    g_project.search = data;
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
    } else {
        console.log('skipping searchByTag');
    }
}

function searchByName(currValArray) {
    //    tempArr = currValArray;
    if (!arraysEqual(searchArr, currValArray)) {
        console.log('searchByName');
        searchArr = currValArray;
        //        LoadStart();
        $.ajax({
            url: "/search_by_name",
            type: 'POST',
            data: JSON.stringify({
                project_name: SESSION['position'].project_name,
                search_names: searchArr
            }),
            timeout: 5000,
            success: function(data) {
                data = JSON.parse(data);
                if (data) {
                    data = data.root_ic;
                    g_project.data = data;
                    g_project.skip = SEARCH_HISTORY;
                    GetWarp(data);
                    g_project.search = data;
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
    } else {
        console.log('skipping searchByName');
    }
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function deleteTerminalInput() {
    location.reload();
}

function copyToClipboard(elem, selector) {
    var range = document.createRange();
    range.selectNode(elem.querySelector(selector));
    window.getSelection().removeAllRanges(); // clear current selection
    window.getSelection().addRange(range); // to select text
    document.execCommand("copy");
    window.getSelection().removeAllRanges(); // to deselect
    MakeSnackbar("Copied!");
}