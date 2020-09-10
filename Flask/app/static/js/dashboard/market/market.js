
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
//    var currType = null
//    switch(type){
//        case "Bids": currType = g_marketTypes.bids; break;
//        case "Posts": currType = g_marketTypes.posts; break;
//    }

    switch(type){
        case "Bids":
            CreateBids(bid_new);
            for (var obj of data){
                setTimeout(function(){ CreateBids(bid_html, obj); }, ANIM_TICKET_WAIT);
            }
            break;
        case "Posts":
            CreatePosts(post_new);
            for (var obj of data){
                setTimeout(function(){ CreatePosts(post_html, obj); }, ANIM_TICKET_WAIT);
            }
            break;
    }

//    CreatePosts1(currType.main);
//    for (var obj of data){
//        setTimeout(function(){ CreatePosts1(currType.many, obj); }, ANIM_TICKET_WAIT);
//    }
}

bid_html = "<div class=\"ticket-body\" onclick=\"return;\">" +
                "<h3>BID TEMPLATE</h3>" +
                "<div class=\"ticket-box\">" +
                    "<h4>cde</h4>" +
                "</div>" +
            "</div>"
bid_new = "<div class=\"ticket-body\" onclick=\"GetAllPost();\">" +
            "<h3>BROWSE POSTS</h3>" +
            "<i class=\"material-icons w3-xxxlarge\">play_circle_filled</i>" +
        "</div>"

post_new = "<div class=\"ticket-body\" onclick=\"AddPost();\">" +
                "<i class=\"material-icons w3-xxxlarge\">add_circle</i>" +
                "<h3>CREATE NEW POST</h3>" +
            "</div>"
post_html = "<div class=\"ticket-body\" onclick=\"EditPost(this, '{0}');\">" +
                "<h3>{1}</h3>" +
                "<br>" +
                "<div class=\"ticket-box\">" +
                    "<div class=\"post-block\"><h4>WHO: </h4><h6>{2}</h6></div>" +
                    "<div class=\"post-block\"><h4>WHEN: </h4><h6>{3}</h6></div>" +
                    "<div class=\"post-block\"><h4>WHERE: </h4><h6>{4}</h6></div>" +
                    "<div class=\"post-block\"><h4>WHAT: </h4><h6>{5}</h6></div>" +
                "</div>" +
            "</div>"

String.prototype.format = function() {
  a = this;
  for (k in arguments) {
    a = a.replace("{" + k + "}", arguments[k])
  }
  return a
}

function CreatePosts(html, data=null){
    console.log(">>>");
    console.log(data);

    var newDiv = post_new;
    if(data != null){
        newDiv = post_html.format(data.post_id, data.title, data.user_owner.username, data.date_expired, data.location, data.description);
        console.log(newDiv);
//        newDiv = document.createElement("div");
//        newDiv.class = "ticket-body";
//        newDiv.onclick = function(){OpenActivityPost(this);};
//        var h3 = document.createElement("h3");
//        h3.innerHTML = data.title;
//        var textDiv = document.createElement("div");
//        textDiv.class = "ticket-box";
//        var h4 = document.createElement("h4");
//        h4.innerHTML = data.product.name;
//        textDiv.append(h4);
//        newDiv.append(h3);
//        newDiv.append(textDiv);
//        newDiv = newDiv.innerHTML
    }

    console.log(newDiv);

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
        .html(newDiv);

    tmp.data = data;
    g_market.childs.push(tmp);
}

function CreateBids(html, data=null){

    var newDiv = bid_new;
    if(data != null){
        newDiv = bid_html;
    }

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
        .html(newDiv);

    tmp.data = data;
    g_market.childs.push(tmp);
}

//function CreatePosts(type, data=null){
//    $.ajax({
//        url: type,
//        type: 'POST',
//        data: JSON.stringify(data),
//        timeout: 5000,
//        success: function(d){
//            d = JSON.parse(d);
//            if(d){
//                var tmp = {};
//                tmp.body =  MARKET.append("div")
//                    .attr("class","ticket")
//                    .style("opacity", 0)
//
//                tmp.body.transition()
//                    .ease("linear")
//                    .duration(ANIM_TICKET_FADE)
//                    .style("opacity", 100);
//
//                tmp.body.append("form")
//                    .attr("class", "ticket-form")
//                    .html(d.html);
//
//                tmp.data = d.data;
//                g_market.childs.push(tmp);
//            }
//        },
//        error: function($jqXHR, textStatus, errorThrown) {
//            console.log( errorThrown + ": " + $jqXHR.responseText );
//        }
//    });
//}

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
