
function NewProject(form){
  LoadStart();
  $.get( "/get_new_project")
      .done(function( data ) {
          input_json = JSON.parse(data);
          html = input_json['html'];
          form.empty();
          form.append(html);
          LoadStop();
      })
      .fail(function($jqXHR, textStatus, errorThrown){
          console.log( errorThrown + ": " + $jqXHR.responseText );
          LoadStop();
      });
}
