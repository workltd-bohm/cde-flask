SEARCH_HISTORY = {};

function OpenFilterActivity(json, open = false) {
    $.ajax({
        url: "/get_filter_activity",
        type: 'POST',
        data: JSON.stringify({
            name: json.name,
            parent_id: json.parent_id,
            ic_id: json.ic_id,
            project_name: SESSION['name']
        }),
        timeout: 5000,
        success: function(data) {
            //console.log(data);
            if (data == 'Success')
                return true;
            data = JSON.parse(data);
            if (data) {
                OpenActivity(data.html, null, open);
                FilterSwap('details');
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function FilterOut(obj) {
    var data = {};
    $(obj).serializeArray().map(function(x) { data[x.name] = x.value; });
    //console.log({path_id:SEARCH_HISTORY.ic_id, data: data});

    $.ajax({
        url: "/get_filtered_files",
        type: 'POST',
        data: JSON.stringify({ path_id: SEARCH_HISTORY.ic_id, data: data }),
        timeout: 5000,
        success: function(data) {
            data = JSON.parse(data);
            if (data) {
                data = data.root_ic;
                g_root.universe.data = data;
                g_project.skip = SEARCH_HISTORY;
                GetWarp(data);
                g_project.search = data;
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function FilterSwap(target) {
    $(".project-view").children().hide();
    $(".project-box").removeClass("selected");
    
    if ($("#filter-" + target).length){
        $("#filter-" + target).show();
        $("#filter-" + target + "-tab").addClass("selected");
    } else if ($(".filter-" + target)) {
        $(".filter-" + target).show();
        $(".filter-" + target + "-tab").addClass("selected");
    }

    // show edit-post button only on details tab
    editPostButton = document.getElementById("edit-post-button");
    if(target != "details")
        editPostButton.style.display = 'none';
    else
        editPostButton.style.display = 'block';
}

function SearchOpen(data) {
    console.log(data);
    if (g_project.search) g_project.search = false;
    //SESSION["position"] = {parent_id: data.values.data.parent_id, ic_id: data.values.data.ic_id};
    SESSION["position"] = { parent_id: data.parent_id, ic_id: data.ic_id };
    CreateProject();
}