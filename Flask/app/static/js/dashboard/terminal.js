var alreadyIn = false;
var suggest = false;
var currentArr = [];
var currentActiveArr = '';

key = $(window).keydown(function(e){
//    console.log(e.keyCode);
    terInput = $('#terminal-input').val();
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 70) {
        e.preventDefault();
        $('#terminal-input').focus();
        if(terInput.split(' ').length > 1){
            if(currentActiveArr == 'suggests') getTags(false);
            if(currentActiveArr == '') getTags();
            alreadyIn = true;
        }
        else{
            if(currentActiveArr == 'tags') get_help_suggest(false);
            if(currentActiveArr == '') get_help_suggest();
            suggest = true;
        }
    }
    else{

        if(terInput == '' || terInput.split(' ').length == 1) {
            suggest=false;
            alreadyIn = false;
        }
        if(!suggest){
            get_help_suggest();
            suggest = true;
        }

        key = e.key;
        if((((e.shiftKey || e.metaKey) && e.keyCode === 51) || ((terInput + key) == 'tag ')) && !alreadyIn){
//            console.log(e);
//            console.log(e.keyCode);
//            console.log($('#terminal-input').val() + e.key);
            alreadyIn = true;
            suggest = false;

            if(currentActiveArr == 'suggests') getTags(false);
            if(currentActiveArr == '') getTags();
        }
        if(e.keyCode === 8 && terInput.split(' ').length == 1){
            if(currentActiveArr == 'tags') get_help_suggest(false);
            if(currentActiveArr == '') get_help_suggest();
            suggest = true;
            alreadyIn = false;
        }
        if(terInput.split(' ')[0].toLowerCase() == 'tag'){
            if(currentActiveArr == 'suggests') getTags(false);
            if(currentActiveArr == '') getTags();
            alreadyIn = true;
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
    terminal = $('#terminal-input').val().split(' ');

    $('#terminal-input').val('');

//    console.log(terminal);
//    console.log(SESSION);

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
//        console.log(terminal);
//        console.log(SESSION);
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

function getTags(autocom=true){
    $.get( "/get_all_tags")
        .done(function( data ) {
            input_json = JSON.parse(data);
//            console.log(input_json['data']);
            currentArr = input_json['data'];
            currentActiveArr = 'tags';
            if(autocom){
                terminalAutocomplete(document.getElementById("terminal-input"), input_json['data']);
            }
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
        });
}

function get_help_suggest(autocom=true){
    $.get( "/get_help_suggest")
        .done(function( data ) {
            input_json = JSON.parse(data);
//            console.log(input_json['data']);
            currentArr = input_json['data'];
            currentActiveArr = 'suggests';
            if(autocom){
                terminalAutocomplete(document.getElementById("terminal-input"), input_json['data']);
            }
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
        });
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

function addTagListen(el){
    var key = window.event.keyCode;
    if(key != 13)
        return true;
    if (key === 13 && el.shiftKey){
        return true;
    }
    terminal = $('#add-tag').val().split(' ');

    $('#add-tag').val('');
    if(terminal[0] != "tag"){
        terminal.unshift("tag");
    }
    addTag(terminal);
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

function terminalAutocomplete(inp, arr) {
  var currentFocus=0;
  inp.addEventListener("input", function(e) {
      valArray = this.value.split(' ');
      var a, b, i, val = valArray[valArray.length-1];
      terminalCloseAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      this.parentNode.appendChild(a);
      arr = currentArr;
//      console.log(arr);
      for (i = 0; i < arr.length; i++) {
//        if(i < 5){
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
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
//        }
      }
  });
inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        currentFocus++;
        terminalAddActive(x);
//        console.log(x);
//        console.log('ovde1');
      } else if (e.keyCode == 38) {
        currentFocus--;
        terminalAddActive(x);
//        console.log(x);
//        console.log('ovde2');
      } else if (e.keyCode == 13) {
        e.preventDefault();
//        console.log('ovde3');
//        console.log(currentFocus);
        if (currentFocus > -1) {
          if (x) {
//              console.log(x);
//              console.log('ovde4');
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