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

    //GetProject();
    // SelectProject();
    CheckSession();
});

$(document).on('keypress', function(e) {
    if (e.which == 13) {
        $("input[type=button]").each(function(i) {
            if ($(this).hasClass("keypress")) {
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
        timeout: 10000,
        success: function(data) {
            SESSION = JSON.parse(data);
            switch (SESSION["section"]) {
                case "user":
                    {
                        UserProfile();
                        break;
                    }
                case "project":
                    {
                        SESSION["name"] ? GetProject() : SelectProject();
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
                default:
                    {
                        SelectProject();
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

function SendProject(data) {
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

    SESSION.view = g_view;

    SEARCH_HISTORY = data;

    if (!backButtonFlag) {
        history.pushState(SESSION, null, '');
    }
    backButtonFlag = false;

    $.ajax({
        url: "/set_project",
        type: 'POST',
        data: JSON.stringify({ project: SESSION }),
        timeout: 10000,
        success: function(data) {
            if (treeStruct == null) {
                $('.tree-view').show();
                CreateTreeStructure();
            } else {

                // let node = findTheNode(treeStruct.getRoot().getChildren()[0]);
                // if (typeof node != 'undefined') {
                //     node.setExpanded(true);
                //     // node.setSelected(true);
                // }
            }
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

function findTheNode(node) {
    if (SESSION.position.ic_id == node.getOptions().ic_id) {
        return node
    } else {
        for (let i = 0; i < node.getChildren().length; i++) {
            response = findTheNode(node.getChildren()[i]);
            if (typeof response != 'undefined') {
                return response;
            }
        }
    }

}

var backButtonFlag = false;

function SendProjectBackButton() {
    $.ajax({
        url: "/set_project",
        type: 'POST',
        data: JSON.stringify({ project: SESSION }),
        timeout: 10000,
        success: function(data) {
            backButtonFlag = true;
            GetProject(history.state);
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
        timeout: 10000,
        success: function(data) {
            data = JSON.parse(data);
            $('.tree-view').hide();
            if (data) {
                if (data.session) {
                    SESSION = data.session;
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
        timeout: 10000,
        success: function(data) {
            data = JSON.parse(data);
            $('.tree-view').hide();
            treeStruct = null;
            if (data) {
                if (data.session) {
                    SESSION = data.session;
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
        timeout: 10000,
        success: function(data) {
            input_json1 = JSON.parse(data);
            input_json2 = input_json1['data'];
            html = input_json1['html'];
            // form.empty();
            // div = document.getElementById('container');
            // div.id = 'container';
            var root = new TreeNode("Projects");

            for (var i = 0; i < input_json2.length; i++) {
                if (SESSION.name == input_json2[i].project_name) {
                    color = input_json2[i].root_ic.color;
                    if (color === '') {
                        let css_col = getComputedStyle(document.documentElement)
                        .getPropertyValue('--sun-bg');
                        color = css_col;
                    }

                    let icon_name = document.createElement("span");
                    let icon = document.createElement("span");
                    let _name = document.createElement("span");
                    _name.textContent = input_json2[i].project_name;
                    icon.className = "material-icons";
                    icon.textContent = "fiber_manual_record";
                    icon.style.color = color;
                    icon_name.appendChild(icon);
                    icon_name.appendChild(_name);

                    input_json2[i].root_ic.icon = icon_name.outerHTML;
                    // input_json2[i].root_ic.color = color;

                    root = new TreeNode('', input_json2[i].root_ic);
                    for (var j = 0; j < input_json2[i].root_ic.sub_folders.length; j++) {
                        AddTreeSubfolders(root, input_json2[i].root_ic.sub_folders[j], input_json2[i].root_ic);
                    }
                    if (SESSION.position.ic_id == input_json2[i].root_ic.ic_id) {
                        root.setExpanded(true);
                        root.setSelected(true);
                    }
                    // root.addChild(node);
                }
            }

            // form.append(html);
            treeStruct = new TreeView(root, "#tree-view", {
                leaf_icon: "<span>&#128441;</span>",
                parent_icon: "<span class='material-icons'>fiber_manual_record</span>",
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

            // Open Tree View
            $(".tree-view").addClass("opened");

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

    // default color
    if (color === '') {
        let css_col = getComputedStyle(document.documentElement)
            .getPropertyValue('--planet-bg');
        color = css_col.trim();
    }

    let icon_name = document.createElement("span");
    let icon = document.createElement("span");
    let _name = document.createElement("span");
    _name.textContent = name;
    icon.className = "material-icons";
    icon.textContent = "fiber_manual_record";
    icon.style.color = color;
    icon_name.appendChild(icon);
    icon_name.appendChild(_name);

    sub_folder.icon = icon_name.outerHTML;
    sub_folder.color = color;

    var child = new TreeNode('', sub_folder);

    for (var k = 0; k < sub_folder.sub_folders.length; k++) {
        AddTreeSubfolders(child, sub_folder.sub_folders[k], project);
    }
    // node.setOptions({ ic_id: sub_folder.ic_id, name: sub_folder.name, parent_id: sub_folder.parent_id, parent: sub_folder.parent });
    if (sub_folder.is_directory) {
        if (SESSION.position.ic_id == sub_folder.ic_id) {
            child.setExpanded(true);
            child.setSelected(true);
        }
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
    if (node.isLeaf()) {
        setSession(node.getOptions());
        CreateWorkspace(node.getOptions());
        node.setExpanded(true);
        // CreatePath();
    } else {
        if (!node.isExpanded()) {
            if (SESSION['position'].ic_id === node.getOptions().ic_id) {
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

        SelectProjectNew({ 'choose_project': data.path.split('/')[0] }, data);
    }

}

function SelectProjectNew(request, ic_data) {
    $.ajax({
        url: "/select_project",
        type: 'POST',
        data: JSON.stringify(request),
        timeout: 10000,
        success: function(data) {
            // GetProject(ic_data);
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

function GetProject(position = null) {
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

    $.ajax({
        url: "/get_project",
        type: 'POST',
        data: JSON.stringify({
            project: {
                position: pos,
                section: "project",
            }
        }),
        timeout: 10000,
        success: function(data) {
            data = JSON.parse(data);
            if (data) {
                if (data.session) {
                    SESSION = data.session;
                }
                CreateDashboard(data.json.root_ic, data.project);
                //OpenFilterActivity(); 
                // WrapOpenFile(data);  inside ..
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
        timeout: 10000,
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

function Select3D() {
    ClearProject(true);
    SwitchDash(2);
    $.ajax({
        url: "/get_viewer",
        type: 'POST',
        data: JSON.stringify({ project: { section: "3d" } }),
        timeout: 10000,
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
        timeout: 10000,
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