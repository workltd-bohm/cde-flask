
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

function MarketOpen(type, data, run=null, run_data=null){ // type depricated?
    console.log(type);

    // switch(type){
    //     case "Posts":
    //         CreateTicket(data.one);
    //         GetTicketTemplate(data.many, g_marketTypes.posts.many, UpdatePostTicket, GetPostId);
    //         break;
    //     case "Bids":
    //         CreateTicket(data.one);
    //         GetTicketTemplate(data.many, g_marketTypes.bids.many, UpdateBidTicket, GetBidId);
    //         break;
    //     case "All_posts":
    //         CreateTicket(data.one);
    //         GetTicketTemplate(data.many, g_marketTypes.posts.many, UpdateAllPostTicket, GetPostId);
    //         break;
    // }
    if(run != null){
        if(run.name == 'NewPost'){
            run(run_data[0], run_data[1]);
        }else{
            run(run_data[0], run_data[1], run_data[2]);
        }
    }else{
        CreateTicket(data.one, null, null, GetID);
        for (var obj of JSON.parse(data.many)){
            CreateTicket(obj.html, obj, null, GetID);
        }
    }

}

// function GetTicketTemplate(d, url, updater, getId){
//     $.ajax({
//         url: url,
//         type: 'POST',
//         timeout: 5000,
//         success: function(template){
//             if(template){
//                 for (var obj of JSON.parse(d)){
//                     CreateTicket(template, obj, updater, getId);;
//                 }
//             }
//         },
//         error: function($jqXHR, textStatus, errorThrown) {
//             console.log( errorThrown + ": " + $jqXHR.responseText );
//             MakeSnackbar($jqXHR.responseText);
//         }
//     });
// }

function CreateTicket(template, obj=null, updater=null, getId=null){
    //console.log("ovde " + obj.html);
    var id  = 0;
    if(obj != null)
        id = getId(obj);
    var tmp = {};
    tmp.body =  MARKET.append("div")
        .attr("class","ticket")
        .attr("id", id)
        .style("opacity", 0)

    tmp.body.transition()
        .ease("linear")
        .duration(ANIM_TICKET_FADE)
        .style("opacity", 100);

    tmp.body.append("form")
        .attr("class", "ticket-form")
        .html(template);

    tmp.data = obj;
    g_market.childs.push(tmp);

    if(obj != null && updater != null){
        updater(obj, id);
    }
}

// function UpdatePostTicket(obj, id){
//     document.getElementById(id).querySelector("#title").innerHTML = obj.title;
//     document.getElementById(id).querySelector("#username").innerHTML = obj.user_owner.username;
//     document.getElementById(id).querySelector("#date").innerHTML = obj.date_created;
//     document.getElementById(id).querySelector("#location").innerHTML = obj.location;
//     document.getElementById(id).querySelector("#product").innerHTML = obj.product.name;
//     document.getElementById(id).querySelector("#post_ticket").onclick = function(){EditPost(this, obj.post_id);};
// }

// function UpdateBidTicket(obj, id){
//     document.getElementById(id).querySelector("#title").innerHTML = obj.post_title;
//     document.getElementById(id).querySelector("#username").innerHTML = obj.user.username;
//     document.getElementById(id).querySelector("#date").innerHTML = obj.date_created;
//     document.getElementById(id).querySelector("#post_id").innerHTML = obj.post_id;
//     document.getElementById(id).querySelector("#offer").innerHTML = obj.offer;
//     document.getElementById(id).querySelector("#bid_ticket").onclick = function(){OpenActivityBid(this, obj.bid_id);};
// }

// function UpdateAllPostTicket(obj, id){
//     document.getElementById(id).querySelector("#title").innerHTML = obj.title;
//     document.getElementById(id).querySelector("#username").innerHTML = obj.user_owner.username;
//     document.getElementById(id).querySelector("#date").innerHTML = obj.date_created;
//     document.getElementById(id).querySelector("#location").innerHTML = obj.location;
//     document.getElementById(id).querySelector("#product").innerHTML = obj.product.name;
//     document.getElementById(id).querySelector("#post_ticket").onclick = function(){ViewPost(this, obj.post_id);};
// }


function GetID(json){
    if (json.post_id) return json.post_id;
    if (json.bid_id) return json.bid_id;
    return -1;
}

function GetPostId(json){
    return json.post_id
}

function GetBidId(json){
    return json.bid_id
}


function MarketGet(choose_market, run=null, run_data=null){
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
                MarketOpen(choose_market, data, run, run_data);
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


function TabSwap(target){
    $(".edit-section.view").children().hide();
    $(".edit-box").removeClass("selected");
    $("#" + target).show();
    $("#edit-box-" + target).addClass("selected");
}