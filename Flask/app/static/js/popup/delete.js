function delete_ic(project_name, path, name, is_directory){
        var data = {project_name: project_name,
                    user: {'email': user_json.email, 'id': user_json.id, 'username': user_json.username},
                    path: path,
                    name: name,
                    is_directory: is_directory
                    };

        delete_post(data);
 }

function delete_post(data) {
    $.ajax({
      url: '/delete_ic',
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