g_post_type = {
    new: '/make_activity_post_new',
    edit: '/make_activity_post_edit'
}

function WrapMarketGetPosts(data) {
    console.log('herererererer');
    MarketGet('Posts');
}

function WrapMarketGetBids(data) {
    MarketGet('Bids');
}

function WrapNewPost(data) {
    var tmp = data.values.data;
    // console.log(tmp);
    NewPost(tmp);
}

function WrapAllPost(data) {
    var tmp = data.values.data;
    // console.log(tmp);
    GetAllPost();
}

function NewPost(obj, request_data = '') {
    ClearProject();
    SwitchDash(1);
    var tmp = obj;
    // console.log(request_data);
    $.ajax({
        url: "/make_new_post",
        type: 'POST',
        data: JSON.stringify({ data: request_data }),
        timeout: 5000,
        success: function(data) {
            json_data = JSON.parse(data);
            if (json_data) {
                OpenEditor(json_data.html, json_data.data);
                OpenActivityEditPost(tmp, g_post_type.new);
                DropAreaInit();
                if (request_data != '') {
                    a = [request_data]
                    documents = []
                    images = []
                    a.forEach(async function(doc) {
                        console.log(doc);
                        let url = '/get_post_image/' + doc['stored_id'] + '?post_id=default';
                        let blob = await fetch(url).then(r => r.blob());
                        blob.name = doc['name'];
                        blob.id = doc['stored_id'];
                        documents.push({ id: doc['stored_id'], name: doc['name'] });
                        previewEditFile(blob);
                    });
                }
                MarketTabSwap('3d-view');
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function AddPost(obj) {
    var form = $("#filter-form-details");

    // post_json = {
    //     title: document.getElementById("title").value,
    //     description: document.getElementById("description").value,
    //     date_expired: document.getElementById("date").value,
    //     visibility: document.getElementById("visibility").value,
    //     location: document.getElementById("location").value,
    //     product: {quantity: document.getElementById('quantity').value}

    // }

    if (!CheckAval(form)) return;
    var args = {};
    form.serializeArray().map(function(x) { args[x.name] = x.value; });
    args['image'] = images;
    args['doc'] = documents;
    args['3d-view'] = $("#3d-view-link")[0].value;
    console.log(args);
    args['tags'] = tagBuffer;

    $.ajax({
        url: "/create_post",
        type: 'POST',
        data: JSON.stringify(args),
        timeout: 5000,
        success: function(data) {
            MakeSnackbar(data);
            MarketGet('Posts');
            tagBuffer = [];
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function UpdatePost(obj, data) {
    var form = $("#filter-form-details");
    if (!CheckAval(form)) return;
    var args = {};
    form.serializeArray().map(function(x) { args[x.name] = x.value; });
    args['image'] = images;
    args['doc'] = documents;
    args['3d-view'] = $("#3d-view-link")[0].value;
    args['post_id'] = $("#post_id").val();
    console.log(args)

    $.ajax({
        url: "/edit_post",
        type: 'POST',
        data: JSON.stringify(args),
        timeout: 5000,
        success: function(data) {
            MakeSnackbar(data);
            MarketGet('Posts');
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function UpdateBid(obj, data) {
    var form = $("#EDITOR > .ticket-form");
    if (!CheckAval(form)) return;
    var args = { bid_id: data };
    form.serializeArray().map(function(x) { args[x.name] = x.value; });
    console.log(args)

    $.ajax({
        url: "/edit_bid",
        type: 'POST',
        data: JSON.stringify(args),
        timeout: 5000,
        success: function(data) {
            MakeSnackbar(data);
            MarketGet('Bids');
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function Bid(obj, data, t, s) {
    var form = $("#filter-form-bids");
    if (!CheckAval(form)) return;
    var args = { post_id: data, post_title: t, status: s };
    form.serializeArray().map(function(x) { args[x.name] = x.value; });
    console.log(args)

    $.ajax({
        url: "/create_bid",
        type: 'POST',
        data: JSON.stringify(args),
        timeout: 5000,
        success: function(data) {
            MakeSnackbar(data);
            MarketGet('Bids');
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}


function GetAllPost() {
    $.ajax({
        url: "/get_all_posts_planetary",
        type: 'POST',
        timeout: 5000,
        success: function(data) {
            data = JSON.parse(data);
            if (data) {
                console.log(data);
                ClearProject();
                // MarketOpen("All_posts", data);
                CreateDashboard([data.json.root_ic]);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function OpenActivityBid(obj, data) {
    //    var data = {};
    //    $(obj).parent().serializeArray().map(function(x){data[x.name] = x.value;});
    //    console.log(data)

    $.ajax({
        url: "/make_activity_bid",
        type: 'POST',
        data: JSON.stringify({ bid_id: data }),
        timeout: 5000,
        success: function(data) {
            data = JSON.parse(data);
            if (data) {
                OpenActivity(data.html);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function ViewPost(obj, post_id, json = '') {
    ClearProject();
    SwitchDash(1);
    // console.log(obj);
    // console.log(post_id);
    // var tmp = obj;
    // let post_id = data;
    $.ajax({
        url: "/make_view_post",
        type: 'POST',
        data: JSON.stringify({ post_id: post_id }),
        timeout: 5000,
        success: function(data) {
            json_data = JSON.parse(data);
            // console.log(json_data);
            if (json_data) {
                if (json_data.data.type == 'view') {
                    ResponseViewPost(json_data, obj, post_id)
                } else {
                    ResponseEditPost(json_data, obj, post_id, json);
                }
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function EditPost(obj, post_id, json = '') {
    ClearProject();
    SwitchDash(1);
    // console.log(obj);
    // console.log(post_id);
    // var tmp = obj;
    // let post_id = data;
    $.ajax({
        url: "/make_edit_post",
        type: 'POST',
        data: JSON.stringify({ post_id: post_id }),
        timeout: 5000,
        success: function(data) {
            json_data = JSON.parse(data);
            if (json_data) {
                ResponseEditPost(json_data, obj, post_id, json);
            }
            // MakeSnackbar("Editor");
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function ResponseEditPost(data, tmp, post_id, json = '') {
    // console.log(data)
    OpenEditor(data.html, data.data);
    OpenActivityEditPost(tmp, g_post_type.edit, post_id);
    DropAreaInit();
    MarketTabSwap('3d-view');
    Set3DPreview();
    documents = []
    images = []
    data.data.image.forEach(async function(img) {
        let url = '/get_post_image/' + img['id'] + '?post_id=' + post_id;
        let blob = await fetch(url).then(r => r.blob());
        blob.name = img['name'];
        blob.id = img['id'];
        blob.post_id = post_id;
        images.push({ id: img['id'], name: img['name'] });
        previewEditImage(blob);
    });
    // console.log(data.data.doc);
    if (json != '') {
        data.data.doc.push({ id: json.stored_id, name: json.name });
    }
    // console.log(data.data.doc);
    data.data.doc.forEach(async function(doc) {
        //                    doc = JSON.parse(doc)
        let url = '/get_post_image/' + doc['id'] + '?post_id=' + post_id;
        let blob = await fetch(url).then(r => r.blob());
        blob.name = doc['name'];
        blob.id = doc['id'];
        blob.post_id = post_id;
        documents.push({ id: doc['id'], name: doc['name'] });
        previewEditFile(blob);
    });
}

function ResponseViewPost(data, tmp, post_id) {
    //                console.log(data)
    OpenEditor(data.html, data.data);
    ClearActivity(false);
    OpenActivityEditBid(tmp);
    MarketTabSwap('3d-view');
    data.data.image.forEach(async function(img) {
        let url = '/get_post_image/' + img['id'] + '?post_id=' + post_id;
        let blob = await fetch(url).then(r => r.blob());
        blob.name = img['name'];
        blob.id = img['id'];
        previewImage(blob);
    });
    data.data.doc.forEach(async function(doc) {
        let url = '/get_post_image/' + doc['id'] + '?post_id=' + post_id;
        let blob = await fetch(url).then(r => r.blob());
        blob.name = doc['name'];
        blob.id = doc['id'];
        previewFile(blob);
    });
}

function OpenActivityEditPost(obj, url, post_id) {
    // console.log(obj);
    // console.log(d);
    var data = {};
    // $(obj).parent().serializeArray().map(function(x) { data[x.name] = x.value; });
    // console.log(data)
    // if (obj != null) {
    data['post_id'] = post_id;
    // }

    $.ajax({
        url: url,
        type: 'POST',
        data: JSON.stringify(data),
        timeout: 5000,
        success: function(data) {
            data = JSON.parse(data);
            if (data) {
                //                console.log(data.html)
                OpenActivity(data.html);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

// -------------------------------------------------------

function EditBid(obj, data) {
    ClearProject();
    SwitchDash(1);
    var tmp = obj;
    $.ajax({
        url: "/make_edit_bid",
        type: 'POST',
        data: JSON.stringify({ bid_id: data }),
        timeout: 5000,
        success: function(data) {
            json_data = JSON.parse(data);
            if (json_data) {
                console.log(json_data)
                OpenEditor(json_data.html, json_data.data);
                OpenActivityEditBid(tmp);
            }
            // MakeSnackbar("Editor");
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function OpenActivityEditBid(obj) {
    var data = {};
    $(obj).parent().serializeArray().map(function(x) { data[x.name] = x.value; });
    // console.log(obj);
    // console.log({ post_id: obj.ic_id });

    $.ajax({
        url: "/make_post_view_activity",
        type: 'POST',
        data: JSON.stringify({ post_id: obj.ic_id }),
        timeout: 5000,
        success: function(data) {
            data = JSON.parse(data);
            if (data) {
                OpenActivity(data.html);
            }
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

// -------------------------------------------------------

function WrapGetMarket(data) {
    var choose_market = data.name;
    //console.log(tmp)
    // MarketGet(choose_market);
    ViewPost(data, data.ic_id);
}