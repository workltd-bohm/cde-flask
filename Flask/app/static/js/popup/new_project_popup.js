// Get the modal
var new_project_modal = document.getElementById("newProjectModal");

// Get the button that opens the modal
var new_project_btn = document.getElementById("createProjectBtn");

// Get the <span> element that closes the modal
var new_project_span = document.getElementsByClassName("close2")[0];

// When the user clicks the button, open the modal
new_project_btn.onclick = function() {
  new_project_modal.style.display = "block";1
}

// When the user clicks on <span> (x), close the modal
new_project_span.onclick = function() {
  new_project_modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == new_project_modal) {
    new_project_modal.style.display = "none";
  }
}



var upload_new_project_btn = $("#upload_new_project_btn");
upload_new_project_btn.click(function(){
    var $newProjectForm = $('#newProjectFormId');

    if(! $newProjectForm[0].checkValidity()) {
      $newProjectForm[0].reportValidity()
    }else{
        var projectName = document.getElementById('project_name');
        var data = {project_name: projectName.value,
                    user: {'email': user_json.email, 'id': user_json.id, 'username': user_json.username}
                    };

        new_project_post(data);
    }
 });

function new_project_post(data) {
    $.ajax({
      url: 'create_project',
      data: JSON.stringify(data),
      processData: false,
      contentType: false,
      type: 'POST',
      success: function(data){
        new_project_span.click();
        var x = document.getElementById("snackbar");
        x.className = "show";
        x.innerHTML = data;

        // After 3 seconds, remove the show class from DIV
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
        location.reload();
      }
    });
};