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
                OpenActivity(data.html);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function FilterOut(obj){
    console.log(obj);
    var data = {};
    $(obj).serializeArray().map(function(x){data[x.name] = x.value;});

    $.ajax({
        url: "/get_filtered_files",
        type: 'POST',
        data: JSON.stringify(data),
        timeout: 5000,
        success: function(data){
                data = JSON.parse(data);
                if(data){
                    data = data.root_ic;
                    g_root.universe.data = data;
                    g_project.skip = SEARCH_HISTORY;
                    GetWarp(data);
                    //AppendActivity(data.html);
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
    SESSION["position"] = {parent_id: data.values.data.parent_id, ic_id: data.values.data.ic_id};
    CreateProject();
}