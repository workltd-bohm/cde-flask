var $ACTIVITY = null;
var ACTIVITY = null;
var $ACTIVITY_HEAD = null;
var ACTIVITY_HEAD = null;

var SESSION = {};

const ANIM_FADE_ANIM = 500;
// -------------------------------------------------------

$( document ).ready(function(){
    $ACTIVITY = $("#activity-body");
    ACTIVITY = d3.select("#activity-body");
    $ACTIVITY_HEAD = $("#activity-head");
    ACTIVITY_HEAD = d3.select("#activity-head");

    //CreateProject();
    //SelectProject();
    CheckSession();
});

function CheckSession(){
    $.ajax({
        url: "/get_session",
        type: 'POST',
        timeout: 5000,
        success: function(data){
            SESSION = JSON.parse(data);
            console.log(SESSION)
            switch(SESSION["section"]){
                case "user":{
                    UserProfile();
                    break;
                }
                case "project": {
                    SESSION["name"] ? CreateProject() : SelectProject();
                    break;
                }
                case "market": {
                    SESSION["market"] ? MarketGet(SESSION["market"]) : SelectMarket(); 
                    break;
                }
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            //MakeSnackbar($jqXHR.responseText);
        }
    });
}

// -------------------------------------------------------

function UserProfile(){
    ClearProject();
    SwitchDash(0);
    $.ajax({
        url: "/get_user_profile",
        type: 'POST',
        data: JSON.stringify({project: {section: "user"}}),
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
        data: JSON.stringify({project: {section: "project"}}),
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

function CreateProject(position=null){
    // if (g_project.project_position_mix){
    //     g_project.project_position = position ? position : g_project.project_position_mix;
    //     g_project.project_position_mix = null;
    // }

    ClearProject();
    SwitchDash(0);
    $.ajax({
        url: "/get_project",
        type: 'POST',
        data: JSON.stringify({
            project: {
                project_position: SESSION["position"] ? SESSION["position"] : null, 
                section: "project",
            }
        }),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            console.log(data)
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


function SelectMarket(){
    ClearProject();
    SwitchDash(0);
    $.ajax({
        url: "/get_root_market",
        type: 'POST',
        data: JSON.stringify({project: {section: "market"}}),
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
    ClearActivity();
    switch(id){
        case 0: $SVG.fadeIn(ANIM_FADE_ANIM); $MARKET.fadeOut(ANIM_FADE_ANIM); $EDITOR.fadeOut(ANIM_FADE_ANIM); break;
        case 1: $SVG.fadeOut(ANIM_FADE_ANIM); $MARKET.fadeIn(ANIM_FADE_ANIM); $EDITOR.fadeOut(ANIM_FADE_ANIM); break;
        default: $SVG.fadeOut(ANIM_FADE_ANIM); $MARKET.fadeOut(ANIM_FADE_ANIM); $EDITOR.fadeOut(ANIM_FADE_ANIM); break;
    }
}

// -------------------------------------------------------
