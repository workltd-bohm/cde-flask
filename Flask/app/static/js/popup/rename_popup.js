// Get the modal
var rename_modal = document.getElementById("renameModal");

// Get the button that opens the modal
var rename_btn = document.getElementById("renameBtn");

// Get the <span> element that closes the modal
var rename_span = document.getElementsByClassName("close4")[0];

// When the user clicks the button, open the modal
rename_btn.onclick = function() {
  rename_modal.style.display = "block";1
}

// When the user clicks on <span> (x), close the modal
rename_span.onclick = function() {
  rename_modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == rename_modal) {
    rename_modal.style.display = "none";
  }
}



var rename_ic_btn = $("#rename_ic_btn");
rename_ic_btn.click(function(){
    var $renameForm = $('#renameFormId');

    if(! $renameForm[0].checkValidity()) {
      $renameForm[0].reportValidity()
    }else{
        var renameProjectName = document.getElementById('rename_project_name');
        var renameICPath = document.getElementById('rename_ic_path');
        var renameOldName = document.getElementById('rename_old_name');
        var renameNewName = document.getElementById('rename_new_name');rename_is_dir
        var renameIsDir = document.getElementById('rename_is_dir');
        var data = {project_name: renameProjectName.value,
                    user: {'email': user_json.email, 'id': user_json.id, 'username': user_json.username},
                    path: renameICPath.value,
                    old_name: renameOldName.value,
                    new_name: renameNewName.value,
                    is_directory: renameIsDir.checked
                    };

        rename_post(data);
    }
 });

function rename_post(data) {
    $.ajax({
      url: 'rename_ic',
      data: JSON.stringify(data),
      processData: false,
      contentType: false,
      type: 'POST',
      success: function(data){
        rename_span.click();
        var x = document.getElementById("snackbar");
        x.className = "show";
        x.innerHTML = data;

        // After 3 seconds, remove the show class from DIV
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
        location.reload();
      }
    });
};