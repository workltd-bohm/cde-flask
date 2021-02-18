
// -------------------------------------------------------

function DrawPath(obj, data){
    data.paths_path = {};
    data.paths_path.this = obj;
    data.paths_path.back = g_project.paths;
    data.paths_path.index = g_project.history_num++;
    data.paths_path.start = g_project.hist_path_len;

//    console.log(g_project.hist_path_len, data.paths_path.start*PATH_TEXT_PADDING)
    data.paths_path.this.attr("transform","translate("+(data.paths_path.start*PATH_TEXT_PADDING)+", 0)");

    data.paths_path.object = data.paths_path.this.append("g").attr("class", "path draw");

    // data.paths_path.picture = data.paths_path.object.append("circle")
    //     .attr("class", "path pattern")
    //     .attr("r", g_PathRadius);

    AddPathText(data, data.name, fix=true);

    data.paths_path.select = data.paths_path.object.append("rect")
        .attr("class","path select")
        .attr("x", 0)
        .attr("y", -2*PATH_TEXT_PADDING)
        .attr("width", g_project.hist_path_len*PATH_TEXT_PADDING)
        .attr("height", 3*PATH_TEXT_PADDING)
        .on("mousedown",function(d){
            ClickStart(function(data){}, data);
        })
        .on("mouseup",function(d){
            ClickStop(function(data){
                if(g_project.search /*&& g_project.search.overlay_type == "ic"*/) g_project.search = false;
                d3.selectAll("g.star").remove();
                g_project.paths = data.paths_path.back;
                g_project.hist_path_len = data.paths_path.start;
                data.paths_path.this.selectAll("g").remove();
                CreateSpace(data);
            }, data, true);
        });

    data.paths_path.child = data.paths_path.this.append("g").attr("class", "path next");
    g_project.paths = data.paths_path.child
}

function AddPathText(data, text, fix=false) {
    var newobj = data.paths_path;
    
    text = text.slice(0, PATH_TEXT_MAX_TEXT);
    if(text.length >= PATH_TEXT_MAX_TEXT)
        text = text.slice(0, PATH_TEXT_MAX_TEXT - 4) + "...";
    text = "/"+text;
//    console.log(text.length, text)
    g_project.hist_path_len = text.length;

    newobj.text = newobj.object.append("g")
        .attr("class", "path text")
    var tmp = newobj.text.append("text")
        .attr("class", "path text_back")
        .attr("x",0)
        .attr("y",0)
        //.attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        .html(text);
    tmp = newobj.text.append("text")
        .attr("class", "path text_front")
        .attr("x",0)
        .attr("y",0)
        //.attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        .html(text);
}

function AddPath(data){
    if(!g_project.paths){
        g_project.paths = g_project.paths_path.append("g")
            .attr("class","paths")
    }
    var d = data;
    DrawPath(g_project.paths, d);
}

function PathCreation(data){
    g_project.hist_path_len = 0;
    g_project.paths_path = SVG.append("g")
        .attr("id","Path")
        .attr("transform","translate("+(g_PathRadius*PATH_ORBIT_COEF)+","+(g_project.height-g_PathRadius*PATH_ORBIT_COEF)+")")
}

function CreateDisplayName(){
    g_project.display_name = SVG.append("text")
        .attr("id", "display_name")
        .attr("transform", "translate(" + (g_root.x) + ", " + (g_root.y + g_project.height_h - g_PathRadius * PATH_ORBIT_COEF) + ")");
}
// -------------------------------------------------------
