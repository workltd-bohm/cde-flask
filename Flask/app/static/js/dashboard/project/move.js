

function MoveCreate(obj, data) {
    if(g_project.selection){
        g_project.selection.remove();
        g_project.selection = false;
    }

    data.move = {};
    data.move.this = obj;

    //data.values.text.style("opacity", 0);

    data.move.object = data.values.this.append("g")
        .attr("class","star move")

    g_project.move = data.move.object;
    g_OverlayRadius = g_SunRadius;
    g_OverlayItem = g_OverlayRadius/OVERLAY_SUN_RATIO;

    data.move.object.append("circle")
        .attr("class","move pattern")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_OverlayRadius)

    data.move.object.append("circle")
        .attr("class","move select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_OverlayRadius*CHECKED_SELECT_RATIO)

    AddMoveText(data, false, MULTI.copy? "COPY":"MOVE");

    data.move.children = data.move.object.append("g")
        .attr("class","move items")

    data.move.allgroup = data.move.object.append("g")
        .attr("class","move allgroup")
        .attr("transform","translate(0, "+(-g_OverlayRadius*CHECKED_ALLGROUP_OFFSET)+")");

    data.move.allgroup.append("rect")
        .attr("class", "move text_allgroup")
        .attr("x",0)
        .attr("y",-25)
        .attr("width",2)
        .attr("height",40)

    data.move.allgroup.append("text")
        .attr("class", "move text_back")
        .attr("x",-10)
        .attr("y",0)
        .style("text-anchor", "end")
        .html("Select Destination")

    data.move.allgroup.append("text")
        .attr("class", "move text_allgroup")
        .attr("x",-10)
        .attr("y",0)
        .style("text-anchor", "end")
        .html("Select Destination")
        .on("mouseup",function(d){
            //SelectAllPlanets(data);
        });

    data.move.allgroup.append("text")
        .attr("class", "move text_back")
        .attr("x",10)
        .attr("y",0)
        .style("text-anchor", "start")
        .html("Cancel")

    data.move.allgroup.append("text")
        .attr("class", "move text_allgroup")
        .attr("x",10)
        .attr("y",0)
        .style("text-anchor", "start")
        .html("Cancel")
        .on("mouseup",function(d){
            DeselectAllPlanets(data);
            g_project.move.remove();
            g_project.move = false;
        });

}

function AddMoveText(data, fix=false, text) {
    var newobj = data.move;
    newobj.text = newobj.object.append("g")
        .attr("class", "move text")
    var tmp = newobj.text.append("text")
        .attr("class", "text_back")
        .attr("x",0)
        .attr("y",0)
        .attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        .html(text)
    tmp = newobj.text.append("text")
        .attr("class", "text_front")
        .attr("x",0)
        .attr("y",0)
        .attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        .html(text)
}

function MoveObject(data, copy=false){
    var o = Object.values(CHECKED);
    var multi = [];
    for (var i = 0; i < o.length; i++) multi.push({ic_id: o[i].ic_id, parent_id: o[i].parent_id});
    if (o.length > 0) multi.push({ic_id: data.ic_id, parent_id: data.parent_id})
    MULTI = {
        parent_id: data.parent_id,
        ic_id: data.ic_id,
        multi : multi,
        copy : copy,
    };
}