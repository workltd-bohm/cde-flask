
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
    CreateTicket(data.one);

    for (var obj of JSON.parse(data.many)){
        setTimeout(function(){ CreateTicket(obj); }, ANIM_TICKET_WAIT);
    }
}

function CreateTicket(obj){
    //console.log("ovde " + obj.html);
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
        .html(obj.html);

    tmp.data = obj;
    g_market.childs.push(tmp);
}


function MarketGet(choose_market){
    ClearMarket();
    SwitchDash(1);
    $.ajax({
        url: choose_market == "Bids" ? "/get_my_bids" : "/get_my_posts",
        type: 'POST',
        data: JSON.stringify({project: {market: choose_market}}),
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
