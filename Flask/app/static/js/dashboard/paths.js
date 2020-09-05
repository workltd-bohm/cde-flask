
// -------------------------------------------------------

function DrawPath(obj, data){
    data.hist_path = {};
    data.hist_path.this = obj;
    data.hist_path.back = g_project.history;
    data.hist_path.index = g_project.history_num++;

    data.hist_path.this.attr("transform","translate("+(g_PathRadius*PATH_ORBIT_COEF*PATH_TEXT_PADDING)+", 0)");

    data.values.object = data.hist_path.this.append("g").attr("class", "path draw");

    data.hist_path.picture = data.values.object.append("circle")
        .attr("class", "path pattern")
        .attr("r", g_PathRadius);

    AddText(data, "path", fix=true);

    data.hist_path.select = data.values.object.append("circle")
        .attr("class","path select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_PathRadius)
        .on("mousedown",function(d){
            ClickStart(function(data){}, data);
        })
        .on("mouseup",function(d){
            ClickStop(function(data){
                d3.selectAll("g.star").remove();
                g_project.history = data.hist_path.back;
                data.hist_path.this.selectAll("g").remove();
                CreateSpace([data]);
            }, data);
        });

    data.hist_path.child = data.hist_path.this.append("g").attr("class", "path next");
    g_project.history = data.hist_path.child
}

function AddPath(data){
    if(!g_project.history){
        g_project.history = g_project.hist_path.append("g")
            .attr("class","paths")
    }
    var d = data;
    DrawPath(g_project.history, d);
}

function PathCreation(data){
    g_project.hist_path = SVG.append("g")
        .attr("id","Path")
        .attr("transform","translate(0,"+(g_PathRadius*PATH_ORBIT_COEF)+")")
}

// -------------------------------------------------------
