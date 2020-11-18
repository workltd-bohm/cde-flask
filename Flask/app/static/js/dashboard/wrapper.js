var $ACTIVITY = null;
var ACTIVITY = null;
var $ACTIVITY_HEAD = null;
var ACTIVITY_HEAD = null;

var SESSION = {};

var CHECKED = {};

var MULTI = [];

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

$(document).on('keypress',function(e) {
    if(e.which == 13) {
        target = $("input[type=button]");
        if(target.length > 0) {
            console.log("onclick activate");
            $("input[type=button]").trigger( "click" );
        }
        return false;
    }
});

function CheckSession(){
    $.ajax({
        url: "/get_session",
        type: 'POST',
        timeout: 5000,
        success: function(data){
            SESSION = JSON.parse(data);
//            console.log(SESSION)
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

function SendProject(data){
    //console.log(data);
    //console.log(SESSION);
    SESSION["position"] = { project_name: data.path.split('/')[0],
                            parent_id: data.parent_id,
                            ic_id: data.ic_id,
                            path: data.path,
                            is_directory: data.is_directory,
                            name: data.name,
                            type: data.type ? data.type : null,
                            parent: data.parent,
                            project_code: data.project_code,
                            company_code: data.company_code,
                            project_volume_or_system: data.project_volume_or_system,
                            project_level: data.project_level,
                            type_of_information: data.type_of_information,
                            role_code: data.role_code,
                            file_number: data.file_number,
                            status: data.status,
                            revision: data.revision};
    SEARCH_HISTORY = data;
    $.ajax({
        url: "/set_project",
        type: 'POST',
        data: JSON.stringify({project:SESSION}),
        timeout: 5000,
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            //MakeSnackbar($jqXHR.responseText);
        }
    });
}

// -------------------------------------------------------

function UserProfile(){
    ClearProject(true);
    SwitchDash(0);
    $.ajax({
        url: "/get_user_profile",
        type: 'POST',
        data: JSON.stringify({project: {section: "user"}}),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                if(data.session) {SESSION = data.session;console.log(SESSION)}
                DashboardCreate([data.json.root_ic], data.project);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function SelectProject(){
    ClearProject(true);
    SwitchDash(0);
    $.ajax({
        url: "/get_root_project",
        type: 'POST',
        data: JSON.stringify({project: {section: "project"}}),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                if(data.session) {SESSION = data.session;console.log(SESSION)}
                DashboardCreate([data.json.root_ic], data.project);
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
                position: SESSION["position"] ? SESSION["position"] : null, 
                section: "project",
            }
        }),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            //console.log(data)
            if(data){
//                console.log(data);
                if(data.session) {SESSION = data.session;console.log(SESSION)}
                DashboardCreate([data.json.root_ic], data.project);
                //OpenFilterActivity(); // WrapOpenFile(data);  inside ..
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}


function SelectMarket(){
    ClearProject(true);
    SwitchDash(0);
    $.ajax({
        url: "/get_root_market",
        type: 'POST',
        data: JSON.stringify({project: {section: "market"}}),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                if(data.session) {SESSION = data.session;console.log(SESSION)}
                DashboardCreate([data.json.root_ic], data.project);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function Select3D(){
    ClearProject(true);
    SwitchDash(2);
    $.ajax({
        url: "/get_viewer",
        type: 'POST',
        data: JSON.stringify({project: {section: "3d"}}),
        timeout: 5000,
        success: function(data){
            response = JSON.parse(data);
            if(response){
                OpenActivity(response['html'], null, open);
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
        case 0:
            $SVG.fadeIn(ANIM_FADE_ANIM);
            $MARKET.fadeOut(ANIM_FADE_ANIM);
            $EDITOR.fadeOut(ANIM_FADE_ANIM);
            $VIEWER.fadeOut(ANIM_FADE_ANIM);
            $('#terminal-sign').fadeIn(ANIM_FADE_ANIM);
            $('#terminal-main').fadeIn(ANIM_FADE_ANIM);
            break;
        case 1:
            $SVG.fadeOut(ANIM_FADE_ANIM);
            $MARKET.fadeIn(ANIM_FADE_ANIM);
            $EDITOR.fadeOut(ANIM_FADE_ANIM);
            $VIEWER.fadeOut(ANIM_FADE_ANIM);
            $('#terminal-sign').fadeOut(ANIM_FADE_ANIM);
            $('#terminal-main').fadeOut(ANIM_FADE_ANIM);
            break;
        case 2:
            $SVG.fadeOut(ANIM_FADE_ANIM);
            $MARKET.fadeOut(ANIM_FADE_ANIM);
            $EDITOR.fadeOut(ANIM_FADE_ANIM);
            $VIEWER.fadeIn(ANIM_FADE_ANIM);
            $('#terminal-sign').fadeOut(ANIM_FADE_ANIM);
            $('#terminal-main').fadeOut(ANIM_FADE_ANIM);
            break;
        default:
            $SVG.fadeOut(ANIM_FADE_ANIM);
            $MARKET.fadeOut(ANIM_FADE_ANIM);
            $EDITOR.fadeOut(ANIM_FADE_ANIM);
            $VIEWER.fadeOut(ANIM_FADE_ANIM);
            $('#terminal-sign').fadeOut(ANIM_FADE_ANIM);
            $('#terminal-main').fadeOut(ANIM_FADE_ANIM);
            break;
    }
}

// -------------------------------------------------------
