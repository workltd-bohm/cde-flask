function MoveCreate(obj, data) {
    // Todo make only for planetary
    g_project.move_ic = data;
    
    if (g_project.selection) {
        g_project.selection.remove();
        g_project.selection = false;
    }
    
    return;
    
    data.move = {};
    data.move.this = obj;
    
    //data.values.text.style("opacity", 0);

    // create move group
    data.move.object = data.values.this.append("g")
        .attr("class", "star move")

    g_project.move = data.move.object;

    // config overlay
    g_OverlayRadius = g_SunRadius;
    g_OverlayItemSize = g_OverlayRadius / OVERLAY_SUN_RATIO;

    //// [SLIDER START]
    if (g_root.slider){
        data.move.object
            .attr("transform", "translate(" + (-g_SunRadius * SUN_SCROLL_X_SUN_OFFS) + ", " + (-g_SunRadius * SUN_SCROLL_Y_SUN_OFFS) + ")");
    }
    //// [SLIDER END]

    // circles
    data.move.object.append("circle")
        .attr("class", "move pattern " + (MULTI.to_copy ? "copy" : "move"))
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_OverlayRadius)

    data.move.object.append("circle")
        .attr("class", "move select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_OverlayRadius * CHECKED_SELECT_RATIO)

    // move text
    AddMoveText(data, data.name, MULTI.to_copy ? "Copy to" : "Move to");

    data.move.children = data.move.object.append("g")
        .attr("class", "move items")

    data.move.allgroup = data.move.object.append("g")
        .attr("class", "move allgroup")
        .attr("transform", "translate(0, " + (-g_OverlayRadius * CHECKED_ALLGROUP_OFFSET) + ")");

    data.move.allgroup.append("rect")
        .attr("class", "move text_allgroup")
        .attr("x", 0)
        .attr("y", -25)
        .attr("width", 2)
        .attr("height", 40)

    // accept button
    data.move.allgroup.append("text")
        .attr("class", "move text_back")
        .attr("x", -10)
        .attr("y", 0)
        .style("text-anchor", "end")
        .html("Accept")

    data.move.allgroup.append("text")
        .attr("class", "move text_allgroup")
        .attr("x", -10)
        .attr("y", 0)
        .style("text-anchor", "end")
        .html("Accept")
        .on("mouseup", function(d) {
            ApplyMove(data);
        });

    // cancel button
    data.move.allgroup.append("text")
        .attr("class", "move text_back")
        .attr("x", 10)
        .attr("y", 0)
        .style("text-anchor", "start")
        .html("Cancel")

    data.move.allgroup.append("text")
        .attr("class", "move text_allgroup")
        .attr("x", 10)
        .attr("y", 0)
        .style("text-anchor", "start")
        .html("Cancel")
        .on("mouseup", function(d) {
            DeselectAllPlanets(data);
            g_project.move.remove();
            g_project.move = false;
        });

}

function AddMoveText(data, name, text) {
    var newobj = data.move;
    newobj.text = newobj.object.append("g")
        .attr("class", "move text")
    var tmp = newobj.text.append("text")
        .attr("class", "text_back")
        .attr("x", 0)
        .attr("y", -10)
        .html(text)
    tmp = newobj.text.append("text")
        .attr("class", "text_front")
        .attr("x", 0)
        .attr("y", -10)
        .html(text)
    tmp = newobj.text.append("text")
        .attr("class", "text_back")
        .attr("x", 0)
        .attr("y", 10)
        .html(name)
    tmp = newobj.text.append("text")
        .attr("class", "text_front")
        .attr("x", 0)
        .attr("y", 10)
        .html(name)
}

function ApplyMove(data) {
    MULTI.to_parent_id = data.parent_id;
    MULTI.to_ic_id = data.ic_id;
    LoadStart();
    
    console.log(MULTI)
    $.ajax({
        url: "/move_ic_multi",
        type: 'POST',
        data: JSON.stringify(MULTI),
        timeout: 5000,
        success: function(d) {
            GetProject();
            LoadStop();
            MakeSnackbar(d);
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });

    DeselectAllPlanets(data);

    if (g_project.move) {
        g_project.move.remove();
        g_project.move = false;
    }
}

function MoveObject(data, copy = false) {
    var o = Object.values(CHECKED);
    var multi = [];
    for (var i = 0; i < o.length; i++) multi.push({ ic_id: o[i].ic_id, parent_id: o[i].parent_id });
    if (o.length == 0) multi.push({ ic_id: data.ic_id, parent_id: data.parent_id })
    MULTI = {
        from_parent_id: data.parent_id,
        from_ic_id: data.ic_id,
        to_parent_id: data.parent_id,
        to_ic_id: data.ic_id,
        targets: multi,
        to_copy: copy,
    };
}