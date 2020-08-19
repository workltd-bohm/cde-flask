
// -------------------------------------------------------

function DrawPath(obj, data){
    data.path = {};
    data.path.this = obj;
    data.path.back = g_project.history;
    data.path.index = g_project.history_num++;

    data.path.this.attr("transform","translate("+(g_PathRadius*PATH_ORBIT_COEF*PATH_TEXT_PADDING)+", 0)");

    data.values.object = data.path.this.append("g").attr("class", "draw");

    data.path.picture = data.values.object.append("circle")
        .attr("class", "pattern")
        .attr("r", g_PathRadius);

    AddText(data, fix=true);

    data.path.select = data.values.object.append("circle")
        .attr("class","select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_PathRadius)
        .on("mousedown",function(d){
            ClickStart(function(data){}, data);
        })
        .on("mouseup",function(d){
            ClickStop(function(data){
                d3.selectAll("g.star").remove();
                g_project.history = data.path.back;
                data.path.this.selectAll("g").remove();
                CreateSpace([data]);
            }, data);
        });

    data.path.child = data.path.this.append("g").attr("class", "next");
    g_project.history = data.path.child
}

function AddPath(data){
    if(!g_project.history){
        g_project.history = g_project.path.append("g")
            .attr("class","paths")
    }
    DrawPath(g_project.history, data);
}

function PathCreation(data){
    g_project.path = SVG.append("g")
        .attr("id","Path")
        .attr("transform","translate(0,"+(g_PathRadius*PATH_ORBIT_COEF)+")")
}

// -------------------------------------------------------
