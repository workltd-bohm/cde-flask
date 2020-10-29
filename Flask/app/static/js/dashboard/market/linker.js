g_post_type = {new: '/make_activity_post_new',
               edit: '/make_activity_post_edit'}

function NewPost(obj, request_data=''){
    var tmp = obj;
    console.log(request_data);
    $.ajax({
        url: "/make_new_post",
        type: 'POST',
        data: JSON.stringify({data: request_data}),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                OpenEditor(data.html, data.data);
                OpenActivityEditPost(tmp, g_post_type.new );
                if(request_data != ''){
                    a = [request_data.name]
                    a.forEach(async function(doc) {
                        let url = '/get_post_image/' + doc + '?post_id=default';
                        let blob = await fetch(url).then(r => r.blob());
                        blob.name = doc;
                        previewEditFile(blob);
                    });
                }
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function AddPost(obj){
    var form = $("#EDITOR > .ticket-form");

    // post_json = {
    //     title: document.getElementById("title").value,
    //     description: document.getElementById("description").value,
    //     date_expired: document.getElementById("date").value,
    //     visibility: document.getElementById("visibility").value,
    //     location: document.getElementById("location").value,
    //     product: {quantity: document.getElementById('quantity').value}

    // }

    if(!CheckAval(form)) return; 
    var args = {};
    form.serializeArray().map(function(x){args[x.name] = x.value;});
    args['image'] = images;
    args['doc'] = documents;
    console.log(args);

    $.ajax({
        url: "/create_post",
        type: 'POST',
        data: JSON.stringify(args),
        timeout: 5000,
        success: function(data){
            MakeSnackbar(data);
            MarketGet('Posts');
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function UpdatePost(obj, data){
    var form = $("#EDITOR > .ticket-form");
    if(!CheckAval(form)) return; 
    var args = {};
    form.serializeArray().map(function(x){args[x.name] = x.value;}); 
    console.log(args)

    $.ajax({
        url: "/edit_post",
        type: 'POST',
        data: JSON.stringify(args),
        timeout: 5000,
        success: function(data){
            MakeSnackbar(data);
            MarketGet('Posts');
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function UpdateBid(obj, data){
    var form = $("#EDITOR > .ticket-form");
    if(!CheckAval(form)) return;
    var args = {bid_id: data};
    form.serializeArray().map(function(x){args[x.name] = x.value;});
    console.log(args)

    $.ajax({
        url: "/edit_bid",
        type: 'POST',
        data: JSON.stringify(args),
        timeout: 5000,
        success: function(data){
            MakeSnackbar(data);
            MarketGet('Bids');
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function Bid(obj, data, t, s){
    var form = $("#EDITOR > .ticket-form");
    if(!CheckAval(form)) return;
    var args = {post_id: data, post_title: t, status: s};
    form.serializeArray().map(function(x){args[x.name] = x.value;});
//    console.log(args)

    $.ajax({
        url: "/create_bid",
        type: 'POST',
        data: JSON.stringify(args),
        timeout: 5000,
        success: function(data){
            MakeSnackbar(data);
            MarketGet('Bids');
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
                console.log(data);
                ClearMarket();
                MarketOpen("All_posts", data);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function OpenActivityBid(obj, data){
//    var data = {};
//    $(obj).parent().serializeArray().map(function(x){data[x.name] = x.value;});
//    console.log(data)

    $.ajax({
        url: "/make_activity_bid",
        type: 'POST',
        data: JSON.stringify({bid_id: data}),
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

function ViewPost(obj, data){
    var tmp = obj;
    let post_id = data;
    $.ajax({
        url: "/make_view_post",
        type: 'POST',
        data: JSON.stringify({post_id: data}),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
//                console.log(data)
                OpenEditor(data.html, data.data);
                ClearActivity(false);
                OpenActivityEditBid(tmp);
                data.data.image.forEach(async function(img) {
                    let url = '/get_post_image/' + img + '?post_id=' + post_id;
                    let blob = await fetch(url).then(r => r.blob());
                    blob.name = img;
                    previewImage(blob);
                });
                data.data.doc.forEach(async function(doc) {
                    let url = '/get_post_image/' + doc + '?post_id=' + post_id;
                    let blob = await fetch(url).then(r => r.blob());
                    blob.name = doc;
                    previewFile(blob);
                });
            }
//            MakeSnackbar("Editor");
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function EditPost(obj, data){
    var tmp = obj;
    let post_id = data;
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
                OpenActivityEditPost(tmp, g_post_type.edit, data.data[0]);
                data.data[0].image.forEach(async function(img) {
                    let url = '/get_post_image/' + img + '?post_id=' + post_id;
                    let blob = await fetch(url).then(r => r.blob());
                    blob.name = img;
                    blob.post_id = post_id;
                    previewEditImage(blob);
                });
                data.data[0].doc.forEach(async function(doc) {
                    let url = '/get_post_image/' + doc + '?post_id=' + post_id;
                    let blob = await fetch(url).then(r => r.blob());
                    blob.name = doc;
                    blob.post_id = post_id;
                    previewEditFile(blob);
                });
            }
            MakeSnackbar("Editor");
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function OpenActivityEditPost(obj, url, d=null){
    console.log(obj)
    var data = {};
    if(data != null){
        data = d
    }
    $(obj).parent().serializeArray().map(function(x){data[x.name] = x.value;});
//    console.log(data)

    $.ajax({
        url: url,
        type: 'POST',
        data: JSON.stringify(data),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
//                console.log(data.html)
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

function EditBid(obj, data){
    var tmp = obj;
    $.ajax({
        url: "/make_edit_bid",
        type: 'POST',
        data: JSON.stringify({bid_id: data}),
        timeout: 5000,
        success: function(data){
            data = JSON.parse(data);
            if(data){
                console.log(data)
                OpenEditor(data.html, data.data);
                OpenActivityEditBid(tmp);
            }
            MakeSnackbar("Editor");
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}

function OpenActivityEditBid(obj){
    var data = {};
    $(obj).parent().serializeArray().map(function(x){data[x.name] = x.value;}); 
    console.log(data)

    $.ajax({
        url: "/make_activity_bid_edit",
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