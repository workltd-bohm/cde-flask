
function DrawPath(obj, data){
    data.path = {};
    data.path.this = obj;

    var draw = data.path.this.append("g").attr("class", "draw");

    data.path.picture = draw.append("circle")
        .attr("class", "object")
        .attr("r", g_globusRadius/PATH_SUN_RATIO);

    data.path.text_s = data.path.this.append("text")
        .attr("x",0)
        .attr("y",0)
        .attr("fill","rgb(0,0,0)")
        .attr("font-size", "14px")
        .style("filter", "url(#shadow)")
        .attr("text-anchor","middle")
        .html(data.name);

    data.path.text = data.path.this.append("text")
        .attr("x",0)
        .attr("y",0)
        .attr("fill","rgba(250,250,250,255)")
        .attr("font-size", "14px")
        .attr("text-anchor","middle")
        .html(data.name);

    data.path.select = data.path.this.append("circle")
        .attr("class","select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_globusRadius/PATH_SUN_RATIO)
        .attr("fill", "rgba(0,0,0,0)")
        .attr("stroke", "none")
        .on("mouseenter",function(d){
            data.path.select.attr("fill","rgba(255,255,255,0.3)");
        })
        .on("mouseleave",function(d){
            data.path.select.attr("fill","rgba(0,0,0,0)");
        })
        .on("mousedown",function(d){
            data.box.position.x = d3.event.x;
            data.box.position.y = d3.event.y;
        })
        .on("mouseup",function(d){
            if(data.box.position.x == d3.event.x && data.box.position.y == d3.event.y) {
                d3.selectAll("g.sun").remove();
                CreateSpace([data]);
            }
        });
}

function PathCreation(data){
    g_project.path = SVG.append("g")
        .attr("id","Path")
        .attr("transform","translate("+(g_globusRadius/PATH_SUN_RATIO*2)+","+(g_globusRadius/PATH_SUN_RATIO*1.5)+")")

    g_project.path.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("class","path")
        .each(function(d){DrawPath(d3.select(this), d);});
}