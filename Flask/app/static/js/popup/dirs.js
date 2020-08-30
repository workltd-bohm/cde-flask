
function NewFolder(form, json){

    console.log(json)

    LoadStart();
    $.ajax({
        url: "/get_new_folder",
        type: 'POST',
        data: JSON.stringify({parent_path:json.path}),
        timeout: 5000,
        success: function(data){
            input_json = JSON.parse(data);
            html = input_json['html'];
            form.empty();
            form.append(html);
            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
            PopupClose();
        }
    });
}