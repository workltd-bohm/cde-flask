
// -------------------------------------------------------

g_OverNone = [
]

g_OverUser = [
]

g_OverProject = [
    { name : "NEW PROJECT", icon : "create_new_folder", link : WrapNewProject},
    //{ name : "RENAME", icon : "create", link : WrapRename},
    //{ name : "DELETE", icon : "delete", link : WrapDelete},
]

g_OverFolder = [
    { name : "UPLOAD", icon : "arrow_circle_up", link : WrapCreateFile},
    { name : "NEW", icon : "create_new_folder", link : WrapCreateFolder},
    { name : "RENAME", icon : "create", link : WrapRename},
    { name : "DELETE", icon : "delete", link : WrapDelete},
    { name : "MOVE", icon : "open_with", link : WrapMove},
    { name : "SHARE", icon : "share", link : WrapShare},
    { name : "DOWNLOAD", icon : "cloud_download", link : WrapDownload},
]

g_OverFile = [
    { name : "UPLOAD", icon : "arrow_circle_up", link : WrapCreateFile},
    { name : "RENAME", icon : "create", link : WrapRename},
    { name : "DELETE", icon : "delete", link : WrapDelete},
    { name : "MOVE", icon : "open_with", link : WrapMove},
    { name : "SHARE", icon : "share", link : WrapShare},
    { name : "DOWNLOAD", icon : "cloud_download", link : WrapDownload},
]

// -------------------------------------------------------

function OverlayCreate(obj, data, parent) {
    data.overlay = {};
    data.overlay.this = obj;
    data.overlay.back = parent;

    var type = g_OverNone;
    switch(data.overlay_type){
        case "user": type = g_OverUser; break;
        case "project": type = g_OverProject; break;
        case "ic": type = g_OverFolder; break;
        case "market": type = g_OverNone; break;
        //case "file": type = g_OverFile;
    }
    data.overlay.items = type;

    data.overlay.object = data.values.this.append("g")
        .attr("class","star overlay");

    g_project.overlay = data.overlay.object;

    data.overlay.object.append("circle")
        .attr("class","overlay pattern")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_OverlayRadius)

    data.overlay.object.append("circle")
        .attr("class","overlay select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_OverlayRadius*1.2)
        .on("mouseleave",function(d){
            //console.log(Math.abs(d3.mouse(this)[0])+Math.abs(d3.mouse(this)[1])+" "+g_OverlayRadius)
            if(Math.abs(d3.mouse(this)[0])+Math.abs(d3.mouse(this)[1]) > g_OverlayRadius){
                data.values.text.style("opacity", 100);
                g_project.overlay.remove();
                g_project.overlay = false;
            }
        });

    AddOverText(data, obj=true, name=false);

    data.overlay.children = data.overlay.object.append("g")
        .attr("class","overlay items")
    
    data.overlay.children.selectAll("g")
        .data(data.overlay.items)
        .enter()
        .append("g")
        .attr("class","item")
        .each(function(d, i){AddItem(d3.select(this), d, data, i);});

}

function AddItem(obj, data, parent, position=0) {
    data.box = {...g_box};
    data.values = {};
    data.values.this = obj;
    data.values.data = parent;
    data.values.back = parent.overlay;

    data.values.rotation = position*360/data.values.back.items.length-90;

    data.values.this.attr("transform","rotate("+(data.values.rotation)+"), translate("+(g_OverlayRadius-g_OverlayItem-OVERLAY_MARG)+", 0), rotate("+(-data.values.rotation)+")");

    // data.item.picture = data.values.this.append("circle")
    //     .attr("class", "pattern overlay")
    //     .attr("r", g_OverlayItem)

    data.values.picture = data.values.this.append("foreignObject")
        .attr("x", -g_OverlayItem/2)
        .attr("y", -g_OverlayItem/2)
        .attr("width", g_OverlayItem)
        .attr("height", g_OverlayItem)
        .append("xhtml:div")
        .attr("class", "item foregin")

    data.values.picture .append("i")
        .attr("class", "material-icons")
        .html(data.icon)

    data.values.select = data.values.this.append("circle")
        .attr("class","item select")
        // .attr("id", data.link)
        .attr("r", g_OverlayItem)
        .on("mouseover",function(d){
            data.values.back.text.selectAll("text").html(data.name);
        })
        .on("mouseleave",function(d){
            data.values.back.text.selectAll("text").html("");
            if(Math.abs(d3.mouse(this)[0])+Math.abs(d3.mouse(this)[1]) > g_OverlayRadius){
                parent.values.text.style("opacity", 100);
                g_project.overlay.remove();
                g_project.overlay = false;
            }
        })
        .on("mousedown",function(d){
            // ClickStart(function(data){
            //     // NONE
            // }, data);
        })
        .on("mouseup",function(d){
            // ClickStop(function(data){
            //     // NONE
            //     //console.log("click")
            // }, data);
            data.link(data);
        });

}

function AddOverText(data, fix=false) {
    var newobj = data.overlay;
    newobj.text = newobj.object.append("g")
        .attr("class", "text")
    newobj.text.append("text")
        .attr("class", "text_back")
        .attr("x",0)
        .attr("y",0)
        .attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        .html("");
    newobj.text.append("text")
        .attr("class", "text_front")
        .attr("x",0)
        .attr("y",0)
        .attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        .html("");
}

// -------------------------------------------------------
