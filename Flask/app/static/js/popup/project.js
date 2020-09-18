
function GetProjects(form){
    LoadStart();
    $.get( "/get_all_projects")
        .done(function( data ) {
            input_json = JSON.parse(data);
            html = input_json['html'];
            json = input_json['data'];
            form.empty();
            form.append(html);
            form_list = form.find(".form__field");
            for(var i = 0; i < json.length; i++) {
                d3.select(form_list.get(0)).append("option")
                    .attr("value",json[i])
                    .html(json[i]);
            }
            LoadStop();
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar(textStatus);
            PopupClose();
        });
}


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
            MakeSnackbar(textStatus);
            PopupClose();
        });
}

function SharePopup(form){
    LoadStart();
    $.get( "/get_share")
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

function ShareProject(data){
    LoadStart();
    $.ajax({
        url: "/share_project",
        type: 'POST',
        data: JSON.stringify({
            project_id: data,
            user_name: document.getElementById('user_name').value,
            role: $("#role option:selected").text()
        }),
        timeout: 5000,
        success: function(data){
            MakeSnackbar(data);
            PopupClose();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });
}
