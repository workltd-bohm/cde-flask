
// -------------------------------------------------------

$( document ).ready(function(){
    //CreateProject();
    SelectProject();
});

// -------------------------------------------------------

function UserProfile(){
    ClearProject();
    SwitchDash(0);
    $.ajax({
        url: "/get_user_profile",
        type: 'POST',
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                DashboardCreate([data.json.root_ic], data.project_position);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function SelectProject(){
    ClearProject();
    SwitchDash(0);
    $.ajax({
        url: "/get_root_project",
        type: 'POST',
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                DashboardCreate([data.json.root_ic], data.project_position);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function CreateProject(parent=false){
    if (g_project.project_position_mix){
        g_project.project_position = g_project.project_position_mix;
        g_project.project_position_mix = null;
    }
    $.ajax({
        url: "/set_project_position",
        type: 'POST',
        data: JSON.stringify({project_position: g_project.project_position}),
        timeout: 5000,
        success: function(data){
            ClearProject();
            $.ajax({
                url: "/get_project",
                type: 'POST',
                timeout: 5000,
                success: function(data){
                    data = JSON.parse(data);
                    if(data){
                        DashboardCreate([data.json.root_ic], data.project_position);
                    }
                },
                error: function($jqXHR, textStatus, errorThrown) {
                    console.log( errorThrown + ": " + $jqXHR.responseText );
                    MakeSnackbar($jqXHR.responseText);
                }
            });
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}


function GetMarket(){
    ClearProject();
    SwitchDash(0);
    $.ajax({
        url: "/get_root_market",
        type: 'POST',
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                DashboardCreate([data.json.root_ic], data.project_position);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

// -------------------------------------------------------

function SwitchDash(id){
    switch(id){
        case 0: $SVG.show(); $MARKET.hide();break;
        case 1: $SVG.hide(); $MARKET.show(); break;
        default: $SVG.hide(); $MARKET.hide(); break;
    }
}

// -------------------------------------------------------
