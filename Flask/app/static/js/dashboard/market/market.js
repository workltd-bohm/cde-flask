
const $MARKET = $("#MARKET");
const MARKET = d3.select("#MARKET");

const $EDITOR = $("#EDITOR");
const EDITOR = d3.select("#EDITOR");

const ANIM_TICKET_WAIT = 300;
const ANIM_TICKET_FADE = 300;

g_market = {
    childs: []
};

g_marketTypes = {
    bids: {main: "/make_ticket_bid_all", many: "/make_ticket_bid"}, 
    posts: {main: "/make_ticket_post_new", many: "/make_ticket_post"}, 
};

function MarketOpen(type, data){
    var currType = null
    switch(type){
        case "Bids": currType = g_marketTypes.bids; break;
        case "Posts": currType = g_marketTypes.posts; break;
    }

    CreatePosts(currType.main);
    for (var obj of data){
        setTimeout(function(){ CreatePosts(currType.many, obj); }, ANIM_TICKET_WAIT);
    }
}

function CreatePosts(type, data=null){
    $.ajax({
        url: type,
        type: 'POST',
        data: JSON.stringify(data),
        timeout: 5000,
        success: function(d){
            d = JSON.parse(d);
            if(d){
                var tmp = {};
                tmp.body =  MARKET.append("div")
                    .attr("class","ticket")
                    .style("opacity", 0)
                
                tmp.body.transition()
                    .ease("linear")
                    .duration(ANIM_TICKET_FADE)
                    .style("opacity", 100);
                
                tmp.body.append("form")
                    .attr("class", "ticket-form")
                    .html(d.html);

                tmp.data = d.data;
                g_market.childs.push(tmp);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
        }
    });
}

function MarketGet(choose_market){
    ClearMarket();
    SwitchDash(1);
    $.ajax({
        url: choose_market == "Bids" ? "/get_my_bids" : "/get_my_posts",
        type: 'POST',
        //data: JSON.stringify(type),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                MarketOpen(choose_market, data);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function OpenEditor(html, data){
    EDITOR.html(html);
    $MARKET.fadeOut(ANIM_TICKET_FADE);
    $EDITOR.fadeIn(ANIM_TICKET_FADE);

}

function ClearMarket(){
    $MARKET.empty();
}
