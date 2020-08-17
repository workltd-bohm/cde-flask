
function DrawPath(obj, data){
    data.path = {};
    data.path.this = obj;
    data.path.back = g_project.history;
    data.path.index = g_project.history_num++;

    data.path.this.attr("transform","translate("+(g_PathRadius*PATH_ORBIT_COEF*PATH_TEXT_PADDING)+", 0)");

    var draw = data.path.this.append("g").attr("class", "draw");

    data.path.picture = draw.append("circle")
        .attr("class", "object")
        .attr("r", g_PathRadius);

    data.path.text_s = draw.append("text")
        .attr("x",0)
        .attr("y",0)
        .attr("fill","rgb(0,0,0)")
        .attr("font-size", TEXT_PATH_SIZE)
        .style("filter", "url(#shadow)")
        .attr("text-anchor","middle")
        .html(data.name);

    data.path.text = draw.append("text")
        .attr("x",0)
        .attr("y",0)
        .attr("fill", TEXT_PATH_COLOR)
        .attr("font-size", TEXT_PATH_SIZE)
        .attr("text-anchor","middle")
        .html(data.name);

    data.path.select = draw.append("circle")
        .attr("class","select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_PathRadius)
        .attr("fill", "rgba(0,0,0,0)")
        .attr("stroke", "none")
        .on("mouseenter",function(d){
            data.path.select.attr("fill", PATH_SELECT_COLOR);
        })
        .on("mouseleave",function(d){
            data.path.select.attr("fill","rgba(0,0,0,0)");
        })
        .on("mousedown",function(d){
            data.box.position.x = d3.event.x;
            data.box.position.y = d3.event.y;
            ClickStart(function(data){}, data);
        })
        .on("mouseup",function(d){
            if(data.box.position.x == d3.event.x && data.box.position.y == d3.event.y) {
                ClickStop(function(data){
                    d3.selectAll("g.star").remove();
                    g_project.history = data.path.back;
                    data.path.this.selectAll("g").remove();
                    CreateSpace([data]);
                }, data);
                
            }
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

    // g_project.path.selectAll("g")
    //     .data(data)
    //     .enter()
    //     .append("g")
    //     .attr("class","path")
    //     .each(function(d){DrawPath(d3.select(this), d);});
}