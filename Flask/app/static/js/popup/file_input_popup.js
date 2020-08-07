// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
var input_json = ""
var file_extension = document.getElementById('file_extension');
var name1 = document.getElementById('name');
var new_name = document.getElementById('new_name');
var dir_path = document.getElementById('dir_path');
var sel = document.getElementById('project_volume_or_system');
var sel1 = document.getElementById('project_level');
var sel2 = document.getElementById('type_of_information');
var sel3 = document.getElementById('role_code');
var sel4 = document.getElementById('file_number');
var sel5 = document.getElementById('status');
var sel6 = document.getElementById('revision');
var sel7 = document.getElementById('uniclass_2015');

//var upload_btn = document.getElementById('upload_btn');

var updated_name = ['AAA', 'AAA', 'AA', '00', 'AA', 'A', '0000', 'A0', 'A0', 'Default'];

var fileList = null;

// When the user clicks the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
  if(input_json == ""){
    input_get();
  }
  else{
    fill_options();
  }
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
var user_json = JSON.parse(user);
console.log(user_json.project_code);
var project_code = document.getElementById("project_code");
var company_code = document.getElementById("company_code");
project_code.value = user_json.project_code;
updated_name[0] = user_json.project_code;
company_code.value = user_json.company_code;
updated_name[1] = user_json.company_code;


function input_get() {
    $.get( "/input")
        .done(function( data ) {
//                console.log(data);
                input_json = JSON.parse(data);
//                fill_options();
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            if($jqXHR.status == 404) {
                console.log( errorThrown + ": " + $jqXHR.responseText );
            }
        });
};

function fill_options(){
    fill(input_json.volume_system_name, sel, input_json.volume_system_code);
    fill(input_json.level_name, sel1, input_json.level_code);
    fill(input_json.type_name, sel2, input_json.type_code);
    fill(input_json.role_name, sel3, input_json.role_code);
    fill(input_json.number_name, sel4, input_json.number_code);
    fill(input_json.status_name, sel5, input_json.status_code);
    fill(input_json.revision_name, sel6, input_json.revision_code);
    fill(input_json.uniclass_name, sel7, '');
}

function fill(json, sel, code){
    for(var i = 0; i < json.length; i++) {
        // create new option element
        var opt = document.createElement('option');
        // create text node to add to option element (opt)
        var text = json[i];
        // set value property of opt
        opt.value = json[i];
        if(code != ''){
            text = code[i] + ', ' + text;
            opt.value = code[i] + ', ' + json[i];
        }
        opt.appendChild( document.createTextNode(text) );

        // add opt to end of select box (sel)
        sel.appendChild(opt);
    }
}

var file_input = $("#file")
file_input.change(function(){
//        create_divs('project_code', "text", 'Project Code');
        fill_options();
        var fullPath = document.getElementById('file');
        var file_name = fullPath.value.split(/(\\|\/)/g).pop().split('.');
        file_extension.value = '.' + file_name[1];
        name1.value = file_name[0];
        fileList = fullPath.files;
        console.log(fileList);
        updated_name[9] = file_name[0];
        updated_name[10] = '.' + file_name[1];
        updateNewName();

 });

 function create_divs(id, type, label_value){
    var div = document.createElement('div');
    div.setAttribute('class', 'form__group field');

    if(type == "text"){
        var input = document.createElement('input');
        input.class = 'form__field';
        input.setAttribute('name', id);
        input.setAttribute('id', id);
        input.setAttribute('type', 'text');
//        input.setAttribute(readonly);

        div.appendChild(input);
    }
    if(type == "input"){
        var input = document.createElement('input');
        input.setAttribute('class', 'form__group field');
        input.setAttribute('name', id);
        input.setAttribute('id', id);
        input.setAttribute('type', 'input');
        input.setAttribute(required);

        div.appendChild(input);
    }
    if(type == "select"){
        var select = document.createElement('select');
        select.setAttribute('class', 'form__group field');
        select.setAttribute('name', id);
        select.setAttribute('id', id);
        select.setAttribute(required);
        var option = document.createElement('option');

        select.appendChild(option);

        div.appendChild(select);
    }
    var label = document.createElement('label');
    label.setAttribute('for', id);
    label.class = 'form__label';
    label.setAttribute('value', label_value);


    div.appendChild(label);

    document.getElementById('modal-content').appendChild(div);
//    $( "#myModal" ).load(window.location.href + " #myModal" );
 }

 function updateName(position, el){
    text = el.value.split(',')[0];
    if(position == 3 || position == 6){
        text = el.value.split(',')[0].split('.')[0];
    }
    updated_name[position] = text;
    updateNewName();

 }

 function updateNewName(){
    var s = "";
    for(var i = 0; i < updated_name.length-2; i += 1) {
        s += updated_name[i] + "-";
    }
    new_name.value = s + updated_name[9] + updated_name[10]
 }


var upload_btn = $("#upload_btn")
upload_btn.click(function(){
    console.log("clicked");
    var data = {project_id: '5f25580d49e1b44fef634b56',
            project_name: 'test-project',
            dir_path: dir_path.value,
            file_name: new_name.value,
            user: user_json,
            file: fileList,
            description: 'test description'};

    file_post(data);
 });

 function file_post(data) {
    $.post( "/upload_file", JSON.stringify(data))
        .done(function( data ) {
//                location.href = '/';
            console.log(data);
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            if($jqXHR.status == 404) {
                console.log( errorThrown + ": " + $jqXHR.responseText );
            }
        });
};