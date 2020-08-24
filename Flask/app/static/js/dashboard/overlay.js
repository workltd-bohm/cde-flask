
// -------------------------------------------------------

g_OverFolder = [
    { name : "Upload Files", icon : "arrow_circle_up", link : WrapCreateFile},
    { name : "Create New", icon : "create_new_folder", link : WrapCreateFolder},
    { name : "Rename", icon : "create", link : WrapRename},
    { name : "Delete", icon : "delete", link : WrapDelete},
    { name : "Move", icon : "open_with", link : WrapMove},
    { name : "Share", icon : "share", link : WrapShare},
    { name : "Download", icon : "cloud_download", link : WrapDownload},
]

g_OverFile = [
    { name : "Upload FIles", icon : "arrow_circle_up", link : WrapCreateFile},
    { name : "Rename", icon : "create", link : WrapRename},
    { name : "Delete", icon : "delete", link : WrapDelete},
    { name : "Move", icon : "open_with", link : WrapMove},
    { name : "Share", icon : "share", link : WrapShare},
    { name : "Download", icon : "cloud_download", link : WrapDownload},
]

// -------------------------------------------------------

function OverlayCreate(obj, data, parent) {
    data.overlay = {};
    data.overlay.this = obj;
    data.overlay.back = parent;

    data.overlay.items = data.is_directory ? g_OverFolder : g_OverFile;

    data.overlay.object = data.values.this.append("g")
        .attr("class","overlay");

    g_project.overlay = data.overlay.object;

    data.overlay.object.append("circle")
        .attr("class","overmenu")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_SunRadius)

    data.overlay.object.append("circle")
        .attr("class","overselect")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_SunRadius*1.2)
        .on("mouseleave",function(d){
            //console.log(Math.abs(d3.mouse(this)[0])+Math.abs(d3.mouse(this)[1])+" "+g_SunRadius)
            if(Math.abs(d3.mouse(this)[0])+Math.abs(d3.mouse(this)[1]) > g_SunRadius){
                data.values.text.style("opacity", 100);
                g_project.overlay.remove();
                g_project.overlay = false;
            }
        });

    AddOverText(data, obj=true, name=false);

    data.overlay.children = data.overlay.object.append("g")
        .attr("class","items")
    
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
    data.values.back = parent.overlay;

    data.values.rotation = position*360/data.values.back.items.length-90;

    data.values.this.attr("transform","rotate("+(data.values.rotation)+"), translate("+(g_SunRadius-g_OverlayRadius-OVERLAY_MARG)+", 0), rotate("+(-data.values.rotation)+")");

    // data.item.picture = data.values.this.append("circle")
    //     .attr("class", "pattern overlay")
    //     .attr("r", g_OverlayRadius)

    data.values.picture = data.values.this.append("foreignObject")
        .attr("x", -g_OverlayRadius/2)
        .attr("y", -g_OverlayRadius/2)
        .attr("width", g_OverlayRadius)
        .attr("height", g_OverlayRadius)
        .append("xhtml:div")
        .attr("class", "foregin")

    data.values.picture .append("i")
        .attr("class", "material-icons")
        .html(data.icon)

    data.values.select = data.values.this.append("circle")
        .attr("class","select")
        // .attr("id", data.link)
        .attr("r", g_OverlayRadius)
        .on("mouseover",function(d){
            data.values.back.text.selectAll("text").html(data.name);
        })
        .on("mouseleave",function(d){
            data.values.back.text.selectAll("text").html("");
            if(Math.abs(d3.mouse(this)[0])+Math.abs(d3.mouse(this)[1]) > g_SunRadius){
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
