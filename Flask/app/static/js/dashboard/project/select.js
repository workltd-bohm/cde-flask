
g_OverSelect = [
    { name : "COLOR",       icon : "color_lens",        link : ChangeColor},
    { name : "DOWNLOAD",    icon : "cloud_download",    link : WrapDownload},
    { name : "COPY",        icon : "content_copy",      link : WrapCopy},
    { name : "MOVE",        icon : "open_with",         link : WrapMove},
    { name : "TRASH",       icon : "delete",            link : WrapTrash},
]

// TODO 
g_OverSelectTrash = [
    { name : "RESTORE", icon : "delete_sweep",  link : WrapRestore},    // display from which project, etc
    { name : "DESTROY", icon : "delete",        link : WrapDelete},     // display from which project, etc
]

s_type_default  = "default"
s_type_project  = "project"
s_type_trash    = "trash"

// Multiple selection
function SelectionCreate(obj, data) {
    // if(g_project.overlay){
    //     g_project.overlay.remove();
    //     g_project.overlay = false;
    // }

    ClearSelection();

    data.selection = {};
    data.selection.this = obj;

    var type;

    switch(SESSION.section)
    {
        case s_type_project:
        case s_type_default:    type = [...g_OverSelect];       break;
        case s_type_trash:      type = [...g_OverSelectTrash];  break;
    }

    
    var file = 0;
    var folder = 0;
    for (var o in CHECKED){
        if(CHECKED[o].is_directory){
            if (folder == 0) for (var i = 0; i < type.length; i++) if (type[i].name == "PREVIEW") type.splice(i, 1);
            if (folder == 1) for (var i = 0; i < type.length; i++) if (type[i].name == "DETAILS") type.splice(i, 1);
            folder++;
        }
        else {
            if (file == 0) for (var i = 0; i < type.length; i++) if (type[i].name == "DETAILS") type.splice(i, 1);
            if (file == 1) for (var i = 0; i < type.length; i++) if (type[i].name == "PREVIEW") type.splice(i, 1);
            file++;
        }
    }
    if(file > 1 || folder > 1 || (file == 1 && folder == 1)) for (var i = 0; i < type.length; i++) if (type[i].name == "RENAME") type.splice(i, 1);
    if(file > 0 && folder > 0) for (var i = 0; i < type.length; i++) if (type[i].name == "SHARE") type.splice(i, 1);

    data.selection.select_text = "";

    if(file == 1) data.selection.select_text += "File ";
    else if(file > 1) data.selection.select_text += file+ " Files ";

    if(file > 0 && folder > 0) data.selection.select_text += "and ";

    if(folder == 1) data.selection.select_text += "Folder ";
    else if(folder > 1) data.selection.select_text += folder+" Folders ";

    data.values.text.style("opacity", 0);
    data.selection.items = type.slice();

    data.selection.object = data.values.this.append("g")
        .attr("class","star selection")

    g_project.selection = data.selection.object;
    g_OverlayRadius = g_SunRadius;
    g_OverlayItemSize = g_OverlayRadius/OVERLAY_SUN_RATIO;

    //// [SLIDER START]
    if (g_root.slider){
        data.selection.object
            .attr("transform", "translate(" + (-g_SunRadius * SUN_SCROLL_X_SUN_OFFS) + ", " + (-g_SunRadius * SUN_SCROLL_Y_SUN_OFFS) + ")");
    }
    //// [SLIDER END]

    data.selection.object.append("circle")
        .attr("class","selection pattern "+(
            ((file == 1 && folder == 0) || (folder == 1 && file == 0))? "single" :
            (file > 0 && folder == 0)? "file" :
                (folder > 0 && file == 0)? "folder" : "mix"
        ))
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_OverlayRadius)

    data.selection.object.append("circle")
        .attr("class","selection select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_OverlayRadius*CHECKED_SELECT_RATIO)

    AddSelectText(data, false, [data.selection.select_text, " selected"]);

    data.selection.children = data.selection.object.append("g")
        .attr("class","selection items")

    data.selection.children.selectAll("g")
        .data(data.selection.items)
        .enter()
        .append("g")
        .attr("class","item")
        .each(function(d, i){AddSelection(d3.select(this), d, data, i);});

    // // selection menu
    // data.selection.allgroup = data.selection.object.append("g")
    //     .attr("class","selection allgroup")
    //     .attr("transform","translate(" + (-g_project.width_h + g_OverlayRadius * 2) + ", " + (-g_project.height_h + g_OverlayRadius) + ")");
    
    // // vertical line
    // data.selection.allgroup.append("rect")
    //     .attr("class", "selection text_allgroup")
    //     .attr("x",0)
    //     .attr("y",-25)
    //     .attr("width",2)
    //     .attr("height",40)

    // // Select all
    // data.selection.allgroup.append("text")
    //     .attr("class", "selection text_back")
    //     .attr("x",-10)
    //     .attr("y",0)
    //     .style("text-anchor", "end")
    //     .html("Select All")

    // data.selection.allgroup.append("text")
    //     .attr("class", "selection text_allgroup")
    //     .attr("x",-10)
    //     .attr("y",0)
    //     .style("text-anchor", "end")
    //     .html("Select All")
    //     .on("mouseup",function(d){
    //         SelectAllPlanets(data);
    //     });

    // // clear all
    // data.selection.allgroup.append("text")
    //     .attr("class", "selection text_back")
    //     .attr("x",10)
    //     .attr("y",0)
    //     .style("text-anchor", "start")
    //     .html("Clear All")

    // data.selection.allgroup.append("text")
    //     .attr("class", "selection text_allgroup")
    //     .attr("x",10)
    //     .attr("y",0)
    //     .style("text-anchor", "start")
    //     .html("Clear All")
    //     .on("mouseup",function(d){
    //         DeselectAllPlanets(data);
    //     });

}

function ClearSelection()
{
    if(g_project.selection){
        g_project.selection.remove();
        g_project.selection = false;
    }
}

function AddSelection(obj, data, parent, position=0) {
    data.box = {...g_box};
    data.values = {};
    data.values.this = obj;
    data.values.data = parent;
    data.values.data.checked = false;
    data.values.back = parent.selection;

    data.values.rotation = position*360/data.values.back.items.length-90;

    data.values.this.attr("transform","rotate("+(data.values.rotation)+"), translate("+(g_OverlayRadius-g_OverlayItemSize-OVERLAY_SUN_MARGIN)+", 0), rotate("+(-data.values.rotation)+")");

    data.values.picture = data.values.this.append("foreignObject")
        .attr("x", -g_OverlayItemSize/2)
        .attr("y", -g_OverlayItemSize/2)
        .attr("width", g_OverlayItemSize)
        .attr("height", g_OverlayItemSize)
        .append("xhtml:div")
        .attr("class", "item foregin")


    var defaultColor = $(".foregin .material-icons").css("color");

    data.values.picture.append("i")
        .attr("class", "item material-icons")
        .style("color", defaultColor)
        .style("font-size", g_OverlayItemSize+"px")
        .html(data.icon)

    data.values.select = data.values.this.append("circle")
        .attr("class","item select")
        // .attr("id", data.link)
        .attr("r", g_OverlayItemSize/2)
        .on("mouseover",function(d){
            //data.values.back.text.remove();
            AddSelectText(data.values.data, false, [data.name], true);
        })
        .on("mouseleave",function(d){
            //data.values.back.text.remove();
            AddSelectText(data.values.data, false, [data.values.back.select_text, " selected"], true);
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

function AddSelectText(data, fix=false, array=[], exist=false) {
    var newobj = data.selection;
    if(!exist)
        newobj.text = newobj.object.append("g")
            .attr("class", "selection text")
    else
        newobj.text.selectAll("text").remove();
    var tmp = newobj.text.append("text")
        .attr("class", "text_back")
        .attr("x",0)
        .attr("y",0)
        //.attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
    var spacing = parseFloat($(tmp.node()).css("fontSize"));
    for(var i = 0; i <= array.length; i++){
        tmp.append("tspan")
        .attr('x', 0)
        .attr('y', (i-(array.length)/2)*spacing)
        .html(array[i])
    }
    tmp = newobj.text.append("text")
        .attr("class", "text_front")
        .attr("x",0)
        .attr("y",0)
        //.attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
    for(var i = 0; i <= array.length; i++){
        tmp.append("tspan")
        .attr('x', 0)
        .attr('y', (i-(array.length)/2)*spacing)
        .html(array[i])
    }
}
