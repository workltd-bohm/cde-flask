// Get the modal
var choose_project_modal = document.getElementById("chooseProjectModal");

// Get the button that opens the modal
var choose_project_btn = document.getElementById("chooseProjectBtn");

// Get the <span> element that closes the modal
var choose_project_span = document.getElementsByClassName("close3")[0];

// REMOVED FROM MENU
// When the user clicks the button, open the modal
// choose_project_btn.onclick = function() {
//   choose_project_modal.style.display = "block";
//   choose_input_get();
// }

// When the user clicks on <span> (x), close the modal
choose_project_span.onclick = function() {
  choose_project_modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == choose_project_modal) {
    choose_project_modal.style.display = "none";
  }
}

function choose_input_get(){
    $.get( "/get_all_projects")
        .done(function( data ) {
                console.log(data);
                input_json = JSON.parse(data);
                fill_choose_options(input_json['projects']);
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            if($jqXHR.status == 404) {
                console.log( errorThrown + ": " + $jqXHR.responseText );
            }
        });
};

function fill_choose_options(json){
    var sel = document.getElementById('choose_project');
    for(var i = 0; i < json.length; i++) {
        // create new option element
        var opt = document.createElement('option');
        // create text node to add to option element (opt)
        var text = json[i];
        // set value property of opt
        opt.value = json[i];

        opt.appendChild( document.createTextNode(text) );

        // add opt to end of select box (sel)
        sel.appendChild(opt);
    }
}

var choose_project_btn = $("#choose_project_btn");
choose_project_btn.click(function(){
    var $chooseProjectForm = $('#chooseProjectFormId');

    if(! $chooseProjectForm[0].checkValidity()) {
      $chooseProjectForm[0].reportValidity()
    }else{
        var chooseProject = document.getElementById('choose_project');
        var data = {project_name: chooseProject.value,
                    user: {'email': user_json.email, 'id': user_json.id, 'username': user_json.username}
                    };

        choose_post(data);
    }
 });

function choose_post(data) {
    $.ajax({
      url: 'select_project',
      data: JSON.stringify(data),
      processData: false,
      contentType: false,
      type: 'POST',
      success: function(data){
        choose_project_span.click();
//        var x = document.getElementById("snackbar");
//        x.className = "show";
//        x.innerHTML = data;
//
//        // After 3 seconds, remove the show class from DIV
//        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
        setTimeout(function(){ location.reload(); }, 1000);
      }
    });
};