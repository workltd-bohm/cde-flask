

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

// -------------------------------------------------------

function WrapGetMarket(data){
    var tmp = {choose_market: data.name};
    //console.log(tmp)
    MarketGet(tmp);
}