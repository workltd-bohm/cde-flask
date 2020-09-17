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
    console.log(data);

    $.ajax({
        url: "/get_filtered_files?project_name=123",
        type: 'POST',
        data: JSON.stringify(data),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                console.log(data.html);
                AppendActivity(data.html);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}