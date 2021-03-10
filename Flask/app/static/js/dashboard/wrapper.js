var $ACTIVITY = null;
var ACTIVITY = null;
var $ACTIVITY_HEAD = null;
var ACTIVITY_HEAD = null;

var SESSION = {};

var CHECKED = {};

var MULTI = [];

var DEBUG = null;

const ANIM_FADE_ANIM = 500;
// -------------------------------------------------------

$(document).ready(function() {
    $ACTIVITY = $("#activity-container");
    ACTIVITY = d3.select("#activity-container");
    $ACTIVITY_HEAD = $("#activity-head");
    ACTIVITY_HEAD = d3.select("#activity-head");

    //CreateProject();
    // SelectProject();
    CheckSession();
});

$(document).on('keypress', function(e) {
    if (e.which == 13) {
        $("input[type=button]").each(function(i) {
            if ($(this).hasClass("keypress")) {
                // console.log("onclick activate", this);
                $(this).trigger("click");
            }
        });
        return false;
    }
});

function CheckSession() {
    $.ajax({
        url: "/get_session",
        type: 'POST',
        timeout: 5000,
        success: function(data) {
            SESSION = JSON.parse(data);
            // console.log(SESSION);
            switch (SESSION["section"]) {
                case "user":
                    {
                        UserProfile();
                        break;
                    }
                case "project":
                    {
                        SESSION["name"] ? CreateProject() : SelectProject();
                        break;
                    }
                case "market":
                    {
                        SESSION["market"] ? MarketGet(SESSION["market"]) : SelectMarket();
                        break;
                    }
                case "trash":
                    {
                        SelectTrash();
                        break;
                    }
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            //MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function SendProject(data, noTree = true) {
    // console.log(data);
    // console.log(SESSION);
    SESSION["position"] = {
        project_name: data.path.split('/')[0],
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
        revision: data.revision
    };

    SEARCH_HISTORY = data;

    if (!backButtonFlag) {
        history.pushState(SESSION, null, '');
    }
    backButtonFlag = false;

    $.ajax({
        url: "/set_project",
        type: 'POST',
        data: JSON.stringify({ project: SESSION }),
        timeout: 5000,
        success: function(data) {
            if (noTree)
                CreateTreeStructure();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
            //MakeSnackbar($jqXHR.responseText);
        }
    });
}

var backButtonFlag = false;

function SendProjectBackButton() {
    $.ajax({
        url: "/set_project",
        type: 'POST',
        data: JSON.stringify({ project: SESSION }),
        timeout: 5000,
        success: function(data) {
            backButtonFlag = true;
            CreateProject(history.state);
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            //MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

// -------------------------------------------------------

function UserProfile() {
    ClearProject(true);
    SwitchDash(0);
    $.ajax({
        url: "/get_user_profile",
        type: 'POST',
        data: JSON.stringify({ project: { section: "user" } }),
        timeout: 5000,
        success: function(data) {
            data = JSON.parse(data);
            if (data) {
                if (data.session) {
                    SESSION = data.session;
                    console.log(SESSION)
                }
                CreateDashboard(data.json.root_ic, data.project);
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

function SelectProject() {
    ClearProject(true);
    SwitchDash(0);
    $.ajax({
        url: "/get_root_project",
        type: 'POST',
        data: JSON.stringify({ project: { section: "project" } }),
        timeout: 5000,
        success: function(data) {
            data = JSON.parse(data);
            if (data) {
                if (data.session) {
                    SESSION = data.session;
                    // console.log(SESSION);
                }
                if (!backButtonFlag) {
                    history.pushState(SESSION, null, '');
                }
                backButtonFlag = false;
                CreateDashboard(data.json.root_ic, data.project);
                // CreateTreeStructure();
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

var treeStruct = null;

function CreateTreeStructure() {
    $.ajax({
        url: "/get_my_projects",
        type: 'POST',
        data: JSON.stringify({}),
        timeout: 5000,
        success: function(data) {
            input_json1 = JSON.parse(data);
            input_json2 = input_json1['data'];
            // console.log(post_id);
            html = input_json1['html'];
            // form.empty();
            // div = document.getElementById('container');
            // div.id = 'container';
            var root = new TreeNode("projects");
            
            for (var i = 0; i < input_json2.length; i++) {
                // console.log('kkk', input_json2[i]);
                color = input_json2[i].root_ic.color;
                if (color == '')
                    color = '#c8bd5d';
                var node = new TreeNode('', {

                    ic_id: input_json2[i].root_ic.ic_id,
                    name: input_json2[i].root_ic.name,
                    path: input_json2[i].root_ic.path,
                    parent_id: input_json2[i].root_ic.parent_id,
                    parent: input_json2[i].root_ic.parent,
                    is_directory: input_json2[i].root_ic.is_directory,
                    stored_id: (input_json2[i].root_ic.is_directory) ? '' : input_json2[i].root_ic.stored_id,
                    type: (input_json2[i].root_ic.is_directory) ? '' : input_json2[i].root_ic.type,
                    sub_folders: input_json2[i].root_ic.sub_folders,
                    is_iso: input_json2[i].is_iso19650,
                    icon: "<span style='background-color:" + color + ";color:white;'>" + input_json2[i].project_name + "</span>",
                    color: color

                });
                // console.log(input_json2[i]);
                for (var j = 0; j < input_json2[i].root_ic.sub_folders.length; j++) {
                    AddTreeSubfolders(node, input_json2[i].root_ic.sub_folders[j], input_json2[i]);
                }
                root.addChild(node);
            }

            // form.append(html);
            treeStruct = new TreeView(root, "#tree-view", {
                leaf_icon: "<span>&#128441;</span>",
                parent_icon: "<span>&#128449;</span>",
                open_icon: "<span>&#9698;</span>",
                close_icon: "<span>&#9654;</span>"
            });

            // treeStruct.changeOption("leaf_icon", '<i class="fas fa-file"></i>');
            // treeStruct.changeOption("parent_icon", '<i class="fas fa-folder"></i>');

            // TreeConfig.open_icon = '<i class="fas fa-angle-down"></i>';
            // TreeConfig.close_icon = '<i class="fas fa-angle-right"></i>';

            // Resets the root-node (TreeNode)
            treeStruct.setRoot(root);

            // tree.collapseAllNodes();
            root.setExpanded(true);

        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function AddTreeSubfolders(node, sub_folder, project) {
    let name = sub_folder.name;
    if (!sub_folder.is_directory) {
        name = sub_folder.name + sub_folder.type;
    }
    
    let color = sub_folder.color;
    if (color === '')
        color = '#14939b';  // default color

    let icon_name = document.createElement("span");
    let icon = document.createElement("span");
    let _name = document.createElement("span");
    _name.textContent = name;
    icon.className = "material-icons";
    icon.textContent = "folder";
    icon.style.color = color;
    icon_name.appendChild(icon);
    icon_name.appendChild(_name);

    var child = new TreeNode('', {

        ic_id: sub_folder.ic_id,
        name: sub_folder.name,
        path: sub_folder.path,
        parent_id: sub_folder.parent_id,
        parent: sub_folder.parent,
        is_directory: sub_folder.is_directory,
        stored_id: (sub_folder.is_directory) ? '' : sub_folder.stored_id,
        type: (sub_folder.is_directory) ? '' : sub_folder.type,
        sub_folders: sub_folder.sub_folders,
        is_iso: project.is_iso19650,
        icon: icon_name.outerHTML,
        color: color

    });
    for (var k = 0; k < sub_folder.sub_folders.length; k++) {
        // console.log(sub_folder.sub_folders[k].name);
        AddTreeSubfolders(child, sub_folder.sub_folders[k], project);
    }
    // console.log(sub_folder);
    // node.setOptions({ ic_id: sub_folder.ic_id, name: sub_folder.name, parent_id: sub_folder.parent_id, parent: sub_folder.parent });
    if (sub_folder.is_directory) {
        child.on('select', function(n) {
            nodeSelected(n);
        });
        node.addChild(child);
        node.setExpanded(false);
        node.on('select', function(n) {
            nodeSelected(n);
        });
    }
}

function nodeSelected(node) {
    // console.log("The selected node's id: " + JSON.stringify(node.getOptions())); // To alert the selected node's id.
    // console.log(node.isExpanded());
    if (node.isLeaf()) {
        setSession(node.getOptions());
        CreateWorkspace(node.getOptions());
        CreatePath();
    } else {
        if (!node.isExpanded()) {
            // console.log(SESSION);
            // console.log(node.getOptions());
            if (SESSION['position'].ic_id == node.getOptions().ic_id) {
                node.setExpanded(false);
            } else {
                setSession(node.getOptions());
                CreateWorkspace(node.getOptions());
                // CreatePath();
                node.setExpanded(true);
            }
        } else {
            node.setExpanded(true);
        }
    }
}

function setSession(data) {
    if (SESSION.project_name == data.path.split('/')[0]) {
        SendProject(data, false);
    } else {
        SESSION.project_name = data.path.split('/')[0];
        SESSION.is_iso = data.is_iso;
        // SESSION["position"] = {
        //     project_name: data.path.split('/')[0],
        //     parent_id: data.parent_id,
        //     ic_id: data.ic_id,
        //     path: data.path,
        //     is_directory: data.is_directory,
        //     name: data.name,
        //     type: data.type ? data.type : null,
        //     parent: data.parent,
        //     project_code: data.project_code,
        //     company_code: data.company_code,
        //     project_volume_or_system: data.project_volume_or_system,
        //     project_level: data.project_level,
        //     type_of_information: data.type_of_information,
        //     role_code: data.role_code,
        //     file_number: data.file_number,
        //     status: data.status,
        //     revision: data.revision
        // };

        SelectProjectNew({ 'choose_project': data.path.split('/')[0] }, data);
    }

    // CreatePath();

}

function SelectProjectNew(request, ic_data) {
    $.ajax({
        url: "/select_project",
        type: 'POST',
        data: JSON.stringify(request),
        timeout: 5000,
        success: function(data) {
            // CreateProject(ic_data);
            CreatePath();
            SendProject(ic_data, false);
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

function CreateProject(position = null) {
    // if (g_project.project_position_mix){
    //     g_project.project_position = position ? position : g_project.project_position_mix;
    //     g_project.project_position_mix = null;
    // }

    // if (position != null) {
    //     SESSION = position;
    // }

    ClearProject();
    SwitchDash(0);
    pos = null;
    if (SESSION != null) {
        if (SESSION.hasOwnProperty('position')) {
            pos = SESSION['position'];
        }
    }
    // console.log(SESSION['position'])
    $.ajax({
        url: "/get_project",
        type: 'POST',
        data: JSON.stringify({
            project: {
                position: pos,
                section: "project",
            }
        }),
        timeout: 5000,
        success: function(data) {
            data = JSON.parse(data);
            if (data) {
                //                console.log(data);
                if (data.session) {
                    SESSION = data.session;
                }
                CreateDashboard(data.json.root_ic, data.project);
                //OpenFilterActivity(); // WrapOpenFile(data);  inside ..
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


function SelectMarket() {
    ClearProject(true);
    SwitchDash(0);
    $.ajax({
        url: "/get_root_market",
        type: 'POST',
        data: JSON.stringify({ project: { section: "market" } }),
        timeout: 5000,
        success: function(data) {
            data = JSON.parse(data);
            if (data) {
                if (data.session) {
                    SESSION = data.session;
                    console.log(SESSION)
                }
                history.pushState(SESSION, null, '');
                CreateDashboard(data.json.root_ic, data.project);
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

function Select3D() {
    ClearProject(true);
    SwitchDash(2);
    $.ajax({
        url: "/get_viewer",
        type: 'POST',
        data: JSON.stringify({ project: { section: "3d" } }),
        timeout: 5000,
        success: function(data) {
            response = JSON.parse(data);
            if (response) {
                OpenActivity(response['html'], null, open);
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

// Get trash and display on screen
function SelectTrash() {
    ClearProject(true);
    SwitchDash(0);
    $.ajax({
        url: "/get_trash",
        type: 'POST',
        data: JSON.stringify({ project: { section: "project" } }),
        timeout: 5000,
        success: function(data) {
            data = JSON.parse(data);
            if (data) {
                if (data.session) {
                    SESSION = data.session;
                }
                history.pushState(SESSION, null, '');
                CreateDashboard(data.json.root_ic, data.project);
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
// -------------------------------------------------------

function SwitchDash(id) {
    ClearActivity();
    switch (id) {
        case 0:
            $SVG.fadeIn(ANIM_FADE_ANIM);
            $MARKET.fadeOut(ANIM_FADE_ANIM);
            $EDITOR.fadeOut(ANIM_FADE_ANIM);
            $VIEWER.fadeOut(ANIM_FADE_ANIM);
            // $('#terminal-sign').fadeIn(ANIM_FADE_ANIM);
            // $('#terminal-main').fadeIn(ANIM_FADE_ANIM);
            break;
        case 1:
            $SVG.fadeOut(ANIM_FADE_ANIM);
            $MARKET.fadeIn(ANIM_FADE_ANIM);
            $EDITOR.fadeOut(ANIM_FADE_ANIM);
            $VIEWER.fadeOut(ANIM_FADE_ANIM);
            // $('#terminal-sign').fadeOut(ANIM_FADE_ANIM);
            // $('#terminal-main').fadeOut(ANIM_FADE_ANIM);
            break;
        case 2:
            $SVG.fadeOut(ANIM_FADE_ANIM);
            $MARKET.fadeOut(ANIM_FADE_ANIM);
            $EDITOR.fadeOut(ANIM_FADE_ANIM);
            $VIEWER.fadeIn(ANIM_FADE_ANIM);
            // $('#terminal-sign').fadeOut(ANIM_FADE_ANIM);
            // $('#terminal-main').fadeOut(ANIM_FADE_ANIM);
            break;
        default:
            $SVG.fadeOut(ANIM_FADE_ANIM);
            $MARKET.fadeOut(ANIM_FADE_ANIM);
            $EDITOR.fadeOut(ANIM_FADE_ANIM);
            $VIEWER.fadeOut(ANIM_FADE_ANIM);
            // $('#terminal-sign').fadeOut(ANIM_FADE_ANIM);
            // $('#terminal-main').fadeOut(ANIM_FADE_ANIM);
            break;
    }
}

// -------------------------------------------------------