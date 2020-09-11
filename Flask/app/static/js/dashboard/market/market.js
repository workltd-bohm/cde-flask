
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

var g_template = null;

function MarketOpen(type, data){
    console.log(type);

    switch(type){
        case "Posts":
            CreateTicket(data.one);
            GetTicketTemplate(data.many);
            break;
        case "Bids":
            CreateTicket(data.one.html);
            for (var obj of JSON.parse(data.many)){
                    CreateTicket(obj.html);;
                }
            break;
        case "All_posts":
            for (var obj of JSON.parse(data.many)){
                    CreateTicket(obj.html);;
                }
            break;
    }

}

function GetTicketTemplate(d){
    $.ajax({
        url: "/make_ticket_post",
        type: 'POST',
        timeout: 5000,
        success: function(data){
            if(data){
                for (var obj of JSON.parse(d)){
                    CreateTicket(data, obj);;
                }
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}
var posts_num = 0;
function CreateTicket(template, obj=null){
    //console.log("ovde " + obj.html);
    var tmp = {};
    tmp.body =  MARKET.append("div")
        .attr("class","ticket")
        .attr("id", posts_num)
        .style("opacity", 0)

    tmp.body.transition()
        .ease("linear")
        .duration(ANIM_TICKET_FADE)
        .style("opacity", 100);

    tmp.body.append("form")
        .attr("class", "ticket-form")
        .html(template);

//    tmp.data = obj;
    g_market.childs.push(tmp);

    if(obj != null){
        document.getElementById(posts_num).querySelector("#title").innerHTML = obj.title;
        document.getElementById(posts_num).querySelector("#username").innerHTML = obj.user_owner.username;
        document.getElementById(posts_num).querySelector("#date").innerHTML = obj.date_created;
        document.getElementById(posts_num).querySelector("#location").innerHTML = obj.location;
        document.getElementById(posts_num).querySelector("#product").innerHTML = obj.product.name;
        document.getElementById(posts_num).querySelector("#post_ticket").onclick = function(){EditPost(this, obj.post_id);};
    }
    posts_num++;
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
