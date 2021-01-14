function UserActivity(data) {
    UserProfileActivity();
}

function UpdateUser() {
    var data = {};
    $("#user-form").serializeArray().map(function(x) { data[x.name] = x.value; });
    if (data.lenght == 0) MakeSnackbar("Form empty?");
    return data;
}

function uploadNewProfilePicture(e)
{
    console.log("uploading new profile picture");
    fileInput = document.getElementById("newProfilePictureToUpload");
    selectedImage = fileInput.files[0];

    formData = new FormData();
    formData.append("newProfilePicture", selectedImage);
    fetch('/upload_new_profile_picture', {method: "POST", body: formData});

    fileInput.value = '' //reset fileInput
}

function UserProfileActivity() {
    $.ajax({
        url: "/make_user_profile_activity",
        type: 'POST',
        //data: JSON.stringify({ic_id: data.ic_id, color: data.color}),
        timeout: 5000,
        success: function(data) {
            data = JSON.parse(data);
            if (data) {
                OpenActivity(data.html, data.head);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}