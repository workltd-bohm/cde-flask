SEARCH_HISTORY = {};

function OpenFilterActivity(){

    $.ajax({
        url: "/get_filter_activity",
        type: 'GET',
//        data: JSON.stringify({bid_id: data}),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                OpenActivity(data.html, null, false);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function FilterOut(obj){
    var data = {};
    $(obj).serializeArray().map(function(x){data[x.name] = x.value;});
    //console.log({path_id:SEARCH_HISTORY.ic_id, data: data});

    $.ajax({
        url: "/get_filtered_files",
        type: 'POST',
        data: JSON.stringify({path_id:SEARCH_HISTORY.ic_id, data: data}),
        timeout: 5000,
        success: function(data){
                data = JSON.parse(data);
                if(data){
                    data = data.root_ic;
                    g_root.universe.data = data;
                    g_project.skip = SEARCH_HISTORY;
                    GetWarp(data);
                    g_project.search = data;
                }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function FilterSwap(target){
    $(".project-view").children().hide();
    $(target).show();
}

function SearchOpen(data){
    console.log(data);
    if(g_project.search) g_project.search = false;
    //SESSION["position"] = {parent_id: data.values.data.parent_id, ic_id: data.values.data.ic_id};
    SESSION["position"] = {parent_id: data.parent_id, ic_id: data.ic_id};
    CreateProject();
}