
// -------------------------------------------------------

g_OverNone = [
]

g_OverUser = [
]

g_OverProject = [
    { name : "NEW PROJECT", icon : "create_new_folder", link : WrapNewProject},
    { name : "UPLOAD PROJECT", icon : "cloud_upload", link : WrapUploadProject}
    //{ name : "RENAME", icon : "create", link : WrapRename},
    //{ name : "DELETE", icon : "delete", link : WrapDelete},
]

g_OverSearch = [
    { name : "GO TO FILE", icon : "open_with", link : SearchOpen},
]

g_OverFolder = [
    { name : "OPEN", icon : "preview", link : WrapOpenFile},
    { name : "UPLOAD", icon : "arrow_circle_up", link : WrapCreateFile},
    { name : "NEW", icon : "create_new_folder", link : WrapCreateFolder},
    { name : "RENAME", icon : "create", link : WrapRename},
    { name : "DELETE", icon : "delete", link : WrapDelete},
    { name : "MOVE", icon : "open_with", link : WrapMove},
    { name : "SHARE", icon : "share", link : WrapShare},
    { name : "SHARE PROJECT", icon : "control_point_duplicate", link : WrapShareProject},
    { name : "DOWNLOAD", icon : "cloud_download", link : WrapDownload},
    { name : "COLOR", icon : "color_lens", link : ColorPicker},
]

g_OverFile = [
    { name : "OPEN", icon : "preview", link : WrapOpenFile},
    { name : "UPLOAD", icon : "arrow_circle_up", link : WrapCreateFile},
    { name : "RENAME", icon : "create", link : WrapRename},
    { name : "DELETE", icon : "delete", link : WrapDelete},
    { name : "MOVE", icon : "open_with", link : WrapMove},
    { name : "SHARE", icon : "share", link : WrapShare},
    { name : "DOWNLOAD", icon : "cloud_download", link : WrapDownload},
]

g_OverPlanet = [
    { name : "SELECT", icon : "check_circle_outline", link : SelectPlanet},
    { name : "OPEN", icon : "preview", link : WrapOpenFile},
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
        case "search_target": type = g_OverSearch; break;
        case "planet": {
            type = [ {...g_OverPlanet[0]}, {...g_OverPlanet[1]} ];
            if (data.selected) type[0].icon = "check_circle";
            console.log(data.selected, type[0].icon)
            break;
        }
        default: break;
    }
    if(type.length == 0) return;

    data.values.text.style("opacity", 0);
    data.overlay.items = type.slice();

    data.overlay.object = data.values.this.append("g")
        .attr("class","star overlay")

    if(data.overlay_type == "planet") data.overlay.object.attr("transform","rotate("+(-g_root.deg)+")");

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

    if (data.parent_id != ""){
        for (var i=0; i < data.overlay.items.length; i++){
            if(data.overlay.items[i].name == "SHARE PROJECT"){
                data.overlay.items.splice(i,1);
                break;
            }
        }
    }

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


    var defaultColor = (data.values.data.color) ? data.values.data.color : $(".foregin .material-icons").css("color");

    data.values.picture.append("i")
        .attr("class", "material-icons")
        .style("color", defaultColor)
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
