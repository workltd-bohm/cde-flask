// Get the modal
var new_folder_modal = document.getElementById("newFolderModal");

// Get the button that opens the modal
var new_folder_btn = document.getElementById("createFolderBtn");

// Get the <span> element that closes the modal
var new_folder_span = document.getElementsByClassName("close1")[0];

// When the user clicks the button, open the modal
new_folder_btn.onclick = function() {
  new_folder_modal.style.display = "block";1
}

// When the user clicks on <span> (x), close the modal
new_folder_span.onclick = function() {
  new_folder_modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == new_folder_modal) {
    new_folder_modal.style.display = "none";
  }
}



var upload_btn = $("#upload_new_folder_btn");
upload_btn.click(function(){
    var $newFolderForm = $('#newFolderFormId');

    if(! $newFolderForm[0].checkValidity()) {
      $newFolderForm[0].reportValidity()
    }else{
        var parent_path = document.getElementById('parent_path');
        var folder_name = document.getElementById('folder_name');
        var data = {project_id: '5f25580d49e1b44fef634b56',
                project_name: 'test-project',
                parent: parent_path.value,
                folder_name: folder_name.value};

        data  = jsonConcat(data);

        folder_post(data);
    }
 });

function folder_post(data) {
    $.ajax({
      url: 'create_dir',
      data: JSON.stringify(data),
      processData: false,
      contentType: false,
      type: 'POST',
      success: function(data){
        new_folder_span.click();
        var x = document.getElementById("snackbar");
        x.className = "show";
        x.innerHTML = data;

        // After 3 seconds, remove the show class from DIV
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
      }
    });
};