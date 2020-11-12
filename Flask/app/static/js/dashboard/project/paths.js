
// -------------------------------------------------------

function DrawPath(obj, data){
    data.paths_path = {};
    data.paths_path.this = obj;
    data.paths_path.back = g_project.paths;
    data.paths_path.index = g_project.history_num++;

    data.paths_path.this.attr("transform","translate("+(g_PathRadius*PATH_ORBIT_COEF*PATH_TEXT_PADDING)+", 0)");

    data.values.object = data.paths_path.this.append("g").attr("class", "path draw");

    data.paths_path.picture = data.values.object.append("circle")
        .attr("class", "path pattern")
        .attr("r", g_PathRadius);

    AddText(data, "path", fix=true);

    data.paths_path.select = data.values.object.append("circle")
        .attr("class","path select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_PathRadius)
        .on("mousedown",function(d){
            ClickStart(function(data){}, data);
        })
        .on("mouseup",function(d){
            ClickStop(function(data){
                if(g_project.search /*&& g_project.search.overlay_type == "ic"*/) g_project.search = false;
                d3.selectAll("g.star").remove();
                g_project.paths = data.paths_path.back;
                data.paths_path.this.selectAll("g").remove();
                CreateSpace(data);
            }, data, true);
        });

    data.paths_path.child = data.paths_path.this.append("g").attr("class", "path next");
    g_project.paths = data.paths_path.child
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
    g_project.paths_path = SVG.append("g")
        .attr("id","Path")
        .attr("transform","translate(0,"+(g_PathRadius*PATH_ORBIT_COEF)+")")
}

// -------------------------------------------------------
