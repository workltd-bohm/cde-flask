
function UserActivity(data){
    UserProfileActivity();
}

function UpdateUser(){
    var data = {};
    $("#user-form").serializeArray().map(function(x){data[x.name] = x.value;}); 
    if(data.lenght == 0) MakeSnackbar("Form empty?");
    return data;
}

function UserProfileActivity(){
    $.ajax({
        url: "/make_user_profile_activity",
        type: 'POST',
        //data: JSON.stringify({ic_id: data.ic_id, color: data.color}),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                OpenActivity(data.html, data.head);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}