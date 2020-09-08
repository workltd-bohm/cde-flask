
const $MARKET = $("#MARKET")

const MARKET = d3.select("#MARKET")

g_market = {};

function MarketOpen(type, data){
    if (type == "Bids"){
        CreatePost("/make_ticket_bid_all");
    }
    else{
        CreatePost("/make_ticket_post_new");
    }
}

function CreatePost(type, data){
    $.ajax({
        url: type,
        type: 'POST',
        //data: JSON.stringify(type),
        timeout: 5000,
        success: function(d){
            d = JSON.parse(d);
            if(d){
                var tmp = {};
                tmp.body =  MARKET.append("div")
                    .attr("class","ticket")

                tmp.body.html(d.html);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
        }
    });
}

function MarketGet(type){
    ClearMarket();
    SwitchDash(1);
    $.ajax({
        url: type.choose_market ? "/get_my_posts" : "/get_my_posts",
        type: 'POST',
        //data: JSON.stringify(type),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                MarketOpen(type.choose_market, data);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function ClearMarket(){
    $MARKET.empty();
}
