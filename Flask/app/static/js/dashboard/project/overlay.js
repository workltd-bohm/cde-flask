// -------------------------------------------------------

g_OverNone = []

g_OverUser = []

g_OverProject = [
    { name: "NEW PROJECT", icon: "create_new_folder", link: WrapNewProject },
    { name: "UPLOAD PROJECT", icon: "cloud_upload", link: WrapUploadProject }
    //{ name : "RENAME", icon : "create", link : WrapRename},
    //{ name : "DELETE", icon : "delete", link : WrapDelete},
]

g_OverSearch = [
    { name: "GO TO FILE", icon: "open_with", link: SearchOpen },
]

g_OverFolder = [
    { name: "DETAILS", icon: "preview", link: WrapOpenFile },
    { name: "UPLOAD", icon: "arrow_circle_up", link: WrapCreateFile },
    { name: "NEW", icon: "create_new_folder", link: WrapCreateFolder },
    { name: "RENAME", icon: "create", link: WrapRename },
    { name: "DELETE", icon: "delete", link: WrapDelete },
    { name: "COPY", icon: "content_copy", link: WrapCopy },
    { name: "MOVE", icon: "open_with", link: WrapMove },
    { name: "SHARE", icon: "share", link: WrapShare },
    //{ name : "SHARE PROJECT", icon : "control_point_duplicate", link : WrapShareProject},
    { name: "DOWNLOAD", icon: "cloud_download", link: WrapDownload },
    { name: "COLOR", icon: "color_lens", link: ColorPicker },
]

g_OverFile = [
    { name: "PREVIEW", icon: "preview", link: WrapOpenFile },
    { name: "UPLOAD", icon: "arrow_circle_up", link: WrapCreateFile },
    { name: "NEW", icon: "create_new_folder", link: WrapCreateFolder },
    { name: "RENAME", icon: "create", link: WrapRename },
    { name: "DELETE", icon: "delete", link: WrapDelete },
    { name: "COPY", icon: "content_copy", link: WrapCopy },
    { name: "MOVE", icon: "open_with", link: WrapMove },
    { name: "SHARE", icon: "share", link: WrapShare },
    { name: "DOWNLOAD", icon: "cloud_download", link: WrapDownload },
    { name: "COLOR", icon: "color_lens", link: ColorPicker },
]

g_OverPlanet = [
    { name: "SELECT", icon: "check_circle", link: SelectPlanet },
    { name: "OPEN", icon: "preview", link: WrapOpenFile },
]

g_OverMarket = [
    { name: "MY POSTS", icon: "view_headline", link: WrapMarketGetPosts }, //WrapNewPost
    { name: "MY BIDS", icon: "view_list", link: WrapMarketGetBids },
    { name: "NEW POST", icon: "addchart", link: WrapNewPost },
]

g_OverPost = [
    { name: "NEW POST", icon: "create_new_folder", link: WrapNewPost }, //WrapNewPost
    // { name: "ALL POSTS", icon: "preview", link: WrapOpenFile },
]

g_OverBid = [
    { name: "ALL POSTS", icon: "preview", link: WrapAllPost },
]

// -------------------------------------------------------

function OverlayCreate(obj, data, parent, planet = false) {
    data.overlay = {};
    data.overlay.this = obj;
    data.overlay.back = parent;

    var type = g_OverNone;
    switch (data.overlay_type) {
        case "user":
            type = g_OverUser;
            break;
        case "project":
            type = g_OverProject;
            break;
        case "ic":
            {
                type = data.values.sun ? data.is_directory ? g_OverFolder : g_OverFile : g_OverPlanet;
                break;
            }
        case "market":
            type = g_OverMarket;
            break;
        case "search_target":
            type = g_OverPlanet;
            break;
        case "posts":
            type = g_OverPost;
            break;
        case "bids":
            type = g_OverBid;
            break;
        default:
            break;
    }
    if (type.length == 0) return;

    if (planet) {
        type = [{...g_OverPlanet[0] }, {...g_OverPlanet[1] }];
        if (data.checked) type[0].icon = "check_circle_outline";
    }

    data.values.text.style("opacity", 0);
    data.overlay.items = type.slice();

    data.overlay.object = data.values.this.append("g")
        .attr("class", "star overlay")

    if (!data.values.sun) data.overlay.object.attr("transform", "rotate(" + (-g_root.deg) + ")");
    if (!data.values.sun) g_OverlayRadius = g_PlanetRadius * OVERLAY_SELECT_PLANET_RATIO;
    else g_OverlayRadius = g_SunRadius;

    g_OverlayItem = g_OverlayRadius / OVERLAY_SUN_RATIO;
    g_project.overlay = data.overlay.object;

    // var pie = d3.layout.pie().sort(null);
    // var arc = d3.svg.arc().innerRadius(g_OverlayRadius).outerRadius(g_OverlayRadius*1.5);
    // data.overlay.object.datum([1])
    //     .selectAll("path")
    //     .data(pie)
    //     .enter()
    //     .append("path")
    //     .attr("d", arc)
    //     .attr("class","overlay pattern")
    data.overlay.object.append("circle")
        .attr("class", "overlay pattern")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_OverlayRadius)

    data.overlay.object.append("circle")
        .attr("class", "overlay select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_OverlayRadius * OVERLAY_SELECT_RATIO)
        .on("mouseleave", function(d) {
            //console.log(Math.abs(d3.mouse(this)[0])+Math.abs(d3.mouse(this)[1])+" "+g_OverlayRadius)
            if (Math.abs(d3.mouse(this)[0]) + Math.abs(d3.mouse(this)[1]) >= g_OverlayRadius * OVARLAY_DESELECT_RATIO) { // TODO FIX
                data.values.text.style("opacity", 100);
                g_project.overlay.remove();
                g_project.overlay = false;
            }
        })
        .on("mousedown", function(d) {
            if (!data.values.sun) ClickStart(function(d) {}, data);
        })
        .on("mouseup", function(d) {
            if (!data.values.sun) {
                if (!g_project.selection) {
                    var func = function() {};
                    switch (g_root.universe.data.overlay_type) {
                        case "user":
                            func = GetWarp;
                            break;
                        default:
                            func = SunFadeout;
                            break;
                    }
                    ClickStop(function(data) {
                        data.values.text.style("opacity", 100);
                        g_project.overlay.remove();
                        g_project.overlay = false;
                        func(data);
                    }, data, true);
                }
            }
        });

    AddOverText(data, obj = true, name = false);

    data.overlay.children = data.overlay.object.append("g")
        .attr("class", "overlay items")

    if (data.parent_id != "root") {
        for (var i = 0; i < data.overlay.items.length; i++) {
            if (data.overlay.items[i].name == "SHARE PROJECT") {
                data.overlay.items.splice(i, 1);
                break;
            }
        }
    }

    data.overlay.children.selectAll("g")
        .data(data.overlay.items)
        .enter()
        .append("g")
        .attr("class", "item")
        .each(function(d, i) { AddItem(d3.select(this), d, data, i); });

}

function AddItem(obj, data, parent, position = 0) {
    data.box = {...g_box };
    data.values = {};
    data.values.this = obj;
    data.values.data = parent;
    data.values.back = parent.overlay;

    data.values.rotation = position * 360 / data.values.back.items.length - 90;

    if (data.name == "SELECT") {
        g_OverlayItem = g_SunRadius / OVERLAY_SUN_RATIO;
        g_OverlayRadius = g_PlanetRadius + g_OverlayItem + OVERLAY_MARG;
    }
    data.values.this.attr("transform", "rotate(" + (data.values.rotation) + "), translate(" + (g_OverlayRadius - g_OverlayItem - OVERLAY_MARG) + ", 0), rotate(" + (-data.values.rotation) + ")");

    // data.item.picture = data.values.this.append("circle")
    //     .attr("class", "pattern overlay")
    //     .attr("r", g_OverlayItem)

    data.values.picture = data.values.this.append("foreignObject")
        .attr("x", -g_OverlayItem / 2)
        .attr("y", -g_OverlayItem / 2)
        .attr("width", g_OverlayItem)
        .attr("height", g_OverlayItem)
        .append("xhtml:div")
        .attr("class", "item foregin")


    var defaultColor = null; //$(".foregin .material-icons .planet").css("color");
    if (data.values.data.color && data.values.data.values.sun) defaultColor = data.values.data.color;

    var tmp = data.values.picture.append("i")
        .attr("class", "item material-icons" + ((data.values.data.values.sun) ? " sun" : " planet"))
        .style("font-size", g_OverlayItem + "px")
        .html(data.icon)

    if (defaultColor) tmp.style("color", defaultColor)

    data.values.select = data.values.this.append("circle")
        .attr("class", "item select")
        // .attr("id", data.link)
        .attr("r", g_OverlayItem / 2)
        .on("mouseover", function(d) {
            data.values.back.text.selectAll("text").html(data.name);
        })
        .on("mouseleave", function(d) {
            data.values.back.text.selectAll("text").html("");
            //console.log(Math.abs(d3.mouse(this)[0])+Math.abs(d3.mouse(this)[1])+" "+g_OverlayRadius)
            //if(Math.abs(d3.mouse(this)[0])+Math.abs(d3.mouse(this)[1]) >= g_OverlayRadius*OVARLAY_DESELECT_RATIO){ // TODO FIX
            if (data.name != "COLOR") {
                parent.values.text.style("opacity", 100);
                g_project.overlay.remove();
                g_project.overlay = false;
            }
        })
        .on("mousedown", function(d) {
            // ClickStart(function(data){
            //     // NONE
            // }, data);
        })
        .on("mouseup", function(d) {
            // ClickStop(function(data){
            //     // NONE
            //     //console.log("click")
            // }, data);
            data.link(data);
        });

}

function AddOverText(data, fix = false) {
    var newobj = data.overlay;
    newobj.text = newobj.object.append("g")
        .attr("class", "overlay text")
    newobj.text.append("text")
        .attr("class", "text_back")
        .attr("x", 0)
        .attr("y", 0)
        .attr("transform", "rotate(" + (fix ? 0 : -g_root.deg) + ")")
        .html("");
    newobj.text.append("text")
        .attr("class", "text_front")
        .attr("x", 0)
        .attr("y", 0)
        .attr("transform", "rotate(" + (fix ? 0 : -g_root.deg) + ")")
        .html("");
}

// -------------------------------------------------------