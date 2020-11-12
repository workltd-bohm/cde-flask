var alreadyIn = false;
var suggest = false;
var currentArr = [];
var tagsArr = [];
var keyWordsArr = [];
var currentActiveArr = '';
var currField = '';

function onFocus(){
    terInput = $('#terminal-input').val();
    if(terInput.split(' ').length > 1){
            if(currentActiveArr == 'suggests' || currentActiveArr == '') getTags(document.getElementById("terminal-input"));
    }
    else{
        if(currentActiveArr == 'tags' || currentActiveArr == '') get_help_suggest();
    }
}

$(window).keydown(function(e){
//    console.log(e.keyCode);
    terInput = $('#terminal-input').val();
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 70) {
        e.preventDefault();
        $('#terminal-input').focus();
        if(terInput.split(' ').length > 1){
            if(currentActiveArr == 'suggests' || currentActiveArr == '') getTags(document.getElementById("terminal-input"));
        }
        else{
            if(currentActiveArr == 'tags' || currentActiveArr == '') get_help_suggest();
        }
    }
});


function terminalListen(el){
    var key = window.event.keyCode;
    if(key != 13)
        return true;
    if (key === 13 && el.shiftKey){
        return true;
    }
    if ($('#terminal-input').val() == ''){
        return true;
    }
    terminal = $('#terminal-input').val().split(' ');

    $('#terminal-input').val('');

//    console.log(terminal);
    console.log(SESSION);

    if(terminal[0] == 'new_folder'){
        if(terminal.length > 1){
            args = {parent_id: SESSION['position'].parent_id,
                    ic_id: SESSION['position'].ic_id,
                    project_name: SESSION['position'].project_name,
                    parent_path: SESSION['position'].path,
                    new_name: terminal[1]
                    }
            FormSubmit('create_dir', args, true, CreateProject);
        }else{
            PopupOpen(NewFolder, SESSION['position']);
        }

    }
    if(terminal[0] == 'create_file'){
        OpenFileDialog(SESSION['position'])
    }
    if(terminal[0] == 'open'){
        if(SESSION['position'].is_directory){
            OpenFilterActivity(SESSION['position'], open);
        }else{
            PreviewOpen(OpenFile, SESSION['position'], null, open);
        }
    }
    if(terminal[0] == 'rename'){
        PopupOpen(RenameFile, SESSION['position']);
    }
    if(terminal[0] == 'help'){
        PopupOpen(Help);
    }
    if(terminal[0] == 'tag'){
        addTag(terminal);
    }


}

function RemoveLastDirectoryPartOf(the_url)
{
    var the_arr = the_url.split('/');
    the_arr.pop();
    return( the_arr.join('/') );
}

function Help(form){
    LoadStart();
    $.get( "/get_help")
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

function getTags(field){
    if(tagsArr.length > 0){
        currentArr = tagsArr;
        currentActiveArr = 'tags';
        if(currField != field){
            terminalAutocomplete(field, input_json['data']);
            currField = field;
        }
    }else{
        $.get( "/get_all_tags")
            .done(function( data ) {
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
            .fail(function($jqXHR, textStatus, errorThrown){
                console.log( errorThrown + ": " + $jqXHR.responseText );
                MakeSnackbar(textStatus);
            });
   }
}

function get_help_suggest(field=''){
    if(keyWordsArr.length > 0){
        currentArr = keyWordsArr;
        currentActiveArr = 'suggests';
    }else{
        $.get( "/get_help_suggest")
            .done(function( data ) {
                input_json = JSON.parse(data);
    //            console.log(input_json['data']);
                currentArr = input_json['data'];
                keyWordsArr = input_json['data'];
                currentActiveArr = 'suggests';
                if(field == ''){
                    field = document.getElementById("terminal-input");
                }
                terminalAutocomplete(field, input_json['data']);
            })
            .fail(function($jqXHR, textStatus, errorThrown){
                console.log( errorThrown + ": " + $jqXHR.responseText );
                MakeSnackbar(textStatus);
            });
    }
}

function addTag(terminal){
    LoadStart();
    $.ajax({
        url: "/add_tag",
        type: 'POST',
        data: JSON.stringify({
            project_name: SESSION['position'].project_name,
            ic_id: SESSION['position'].ic_id,
            parent_id: SESSION['position'].parent_id,
            is_directory: SESSION['position'].is_directory,
            tags: terminal
        }),
        timeout: 5000,
        success: function(data){
            MakeSnackbar(data);
            LoadTag(terminal);
            LoadStop();

//            location.reload();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            LoadStop();
        }
    });
}

var addTagActive = false;
function addTagListen(el){
    if(!addTagActive){
        getTags(document.getElementById("add-tag"));

    }
    var key = window.event.keyCode;
    if(key != 13)
        return true;
    if (key === 13 && el.shiftKey){
        return true;
    }
    tagsValue = $('#add-tag').val().split(' ');

    $('#add-tag').val('');
    if(tagsValue[0] != "tag"){
        tagsValue.unshift("tag");
    }
    addTag(tagsValue);
}

function removeTag(tagName){
    LoadStart();
    $.ajax({
        url: "/remove_tag",
        type: 'POST',
        data: JSON.stringify({
            project_name: SESSION['position'].project_name,
            ic_id: SESSION['position'].ic_id,
            parent_id: SESSION['position'].parent_id,
            is_directory: SESSION['position'].is_directory,
            tag: tagName
        }),
        timeout: 5000,
        success: function(data){
            MakeSnackbar(data);
            LoadStop();
            t = document.getElementById(tagName);
            t.parentNode.removeChild(t);
//            location.reload();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            LoadStop();
        }
    });
}

function LoadTag(terminal){
    console.log(terminal);
    activityTagContainer = document.getElementById('activity-tag-container');
    for(i=1; i<terminal.length; i++){
        if(terminal[i].startsWith('#')){
            var tag = terminal[i];
            var color = 'white';
            if(i < terminal.length-1){
                if(!terminal[i+1].startsWith('#')){
                    color = terminal[i+1];
                    i++;
                }
            }

            existingTags = document.getElementsByClassName('tag-container');

            var alreadyInside = false;
            for(j=0; j<existingTags.length; j++){
                if(existingTags[j].id == tag + ' ' + color){
                    alreadyInside = true;
                }
            }

            if(!alreadyInside){

                addTagInArrayIfMissing(tag, tagsArr);

                activityTagContainer.style.cssText = "display: inline;";

                tagContainer = document.createElement("div");
                tagContainer.className = "tag-container";
                tagContainer.id = tag + ' ' + color;

                tagDiv = document.createElement("div");
                tagDiv.className = "tag";
                tagDiv.style.cssText = "background-color: " + color + ";";

                tagI = document.createElement("i");
                var iColor = 'white;';
                if(color == 'white'){
                   iColor = 'black;';
                }
                tagI.style.cssText = "color: " + iColor + ";";
                tagI.innerHTML = tag;

                tagSpan = document.createElement("span");
                tagSpan.className = "remove-tag";
                tagSpan.onclick = function(){
                    removeTag(tag + ' ' + color);
                };
                tagSpan.innerHTML = 'x';

                tagDiv.appendChild(tagI);
                tagContainer.appendChild(tagDiv);
                tagContainer.appendChild(tagSpan);

                activityTagContainer.appendChild(tagContainer);
            }
        }
    }
}

function addTagInArrayIfMissing(element, array){
    array.indexOf(element) === -1 ? array.push(element) : console.log("This item already exists in the local array");
}

function terminalAutocomplete(inp, arr) {
  var currentFocus=-1;
  inp.addEventListener("input", function(e) {
      valArray = this.value.split(' ');
      var a, b, i, val = valArray[valArray.length-1];
      if(valArray.length > 1 || val.toLowerCase() == 'tag' ||
                                val.toLowerCase() == 'new_folder' ||
                                val.startsWith('#'))
        {
            if(currentActiveArr == 'suggests' || currentActiveArr == '') getTags(document.getElementById("terminal-input"));
//            alreadyIn = true;
        }
        else{
//            if(currentActiveArr == 'tags') get_help_suggest(false);
            if(currentActiveArr == 'tags' || currentActiveArr == '') get_help_suggest();
//            suggest = true;
        }
      terminalCloseAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      this.parentNode.appendChild(a);
      arr = currentArr;
//      console.log(arr);
      count = 0;
      for (i = 0; i < arr.length; i++) {
        if(count < 10){
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
              count++;
              b = document.createElement("DIV");
              b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
              b.innerHTML += arr[i].substr(val.length);
              b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
              b.addEventListener("click", function(e) {
                  if(valArray.slice(0, -1).length == 0){
                    preValue = '';
                  }
                  else{
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
          if($('#terminal-input').is(":focus")){
              currValArray = $('#terminal-input').val().split(' ');
              if(currValArray[0].startsWith('#')){
                console.log(currValArray);
                search(currValArray);
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

        if(!x){
            $(this).keydown();
        }else{
            if(x.length > 0){
                terminalCloseAllLists();
                e.preventDefault();
            }
        }
        if (currentFocus > -1) {
          if (x) {
              if($('#terminal-input').is(":focus")){
                  currValArray = $('#terminal-input').val().split(' ');
                  currValArray.splice(currValArray.length-1);
                  currVal = x[currentFocus].getElementsByTagName('input')[0].value;
                  currValArray.push(currVal);
                  if(currValArray[0].startsWith('#')){
                    console.log(currValArray);
                    search(currValArray);
                  }
              }
              x[currentFocus].click();
          }else{
            curr = $('#terminal-input').val().split(' ')[0].toLowerCase()
            if(curr != 'tag' && curr != 'new_folder' && !curr.startsWith('#'))
                terminalListen(inp);
//                $(window).off('keydown');
//                $(window).keydown = key;
            }
        }else{
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
  document.addEventListener("click", function (e) {
      terminalCloseAllLists(e.target);
  });
}

var searchArr = [];
function search(currValArray){
//    tempArr = currValArray;
    if(!arraysEqual(searchArr, currValArray)){
        console.log('search');
        searchArr = currValArray;
//        LoadStart();
        $.ajax({
            url: "/search",
            type: 'POST',
            data: JSON.stringify({
                project_name: SESSION['position'].project_name,
                search_tags: searchArr
            }),
            timeout: 5000,
            success: function(data){
                data = JSON.parse(data);
                if(data){
                    data = data.root_ic;
                    g_root.universe.data = data;
                    g_project.skip = SEARCH_HISTORY;
                    GetWarp(data);
                    g_project.search = data;
                }
            },
            error: function($jqXHR, textStatus, errorThrown) {
                console.log( errorThrown + ": " + $jqXHR.responseText );
                MakeSnackbar($jqXHR.responseText);
                LoadStop();
            }
        });
    }else{
        console.log('skipping search');
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