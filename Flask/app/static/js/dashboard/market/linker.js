

function AddPost(){
    $.ajax({
        url: "/create_post",
        type: 'POST',
        timeout: 5000,
        success: function(data){
            MakeSnackbar(data);
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function GetAllPost(){
    $.ajax({
        url: "/get_all_posts",
        type: 'POST',
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                console.log(data)
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function OpenActivityPost(obj, data){
    var data = {};
    $(obj).parent().serializeArray().map(function(x){data[x.name] = x.value;}); 
    console.log(data)

    $.ajax({
        url: "/make_activity_post",
        type: 'POST',
        data: JSON.stringify(data),
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

function EditPost(obj, data){
    var tmp = obj;
    $.ajax({
        url: "/make_edit_post",
        type: 'POST',
        data: JSON.stringify({post_id: data}),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                console.log(data)
                OpenEditor(data.html, data.data);
                OpenActivityEditPost(tmp);
            }
            MakeSnackbar("Editor");
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function OpenActivityEditPost(obj){
    var data = {};
    $(obj).parent().serializeArray().map(function(x){data[x.name] = x.value;}); 
    console.log(data)

    $.ajax({
        url: "/make_activity_post_edit",
        type: 'POST',
        data: JSON.stringify(data),
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

// -------------------------------------------------------

function WrapGetMarket(data){
    var choose_market = data.name;
    //console.log(tmp)
    MarketGet(choose_market);
}