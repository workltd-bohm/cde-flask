function MoveCreate(obj, data) {
    ClearSelection();

    if (g_view === VIEW_GR) 
    {
        g_project.move = data;
        return;
    }

    data.move = {};
    data.move.this = obj;
    
    //data.values.text.style("opacity", 0);

    data.move.object = data.values.this.append("g")
    .attr("class", "star move")
    
    data.move.menu = data.values.this.append("g")
    .attr("class", "move-menu");
    
    g_project.move = data.move.object;
    g_OverlayRadius = g_SunRadius;
    g_OverlayItemSize = g_OverlayRadius / OVERLAY_SUN_RATIO;
    
    //// [SLIDER START]
    if (g_root.slider){
        data.move.object
        .attr("transform", "translate(" + (-g_SunRadius * SUN_SCROLL_X_SUN_OFFS) + ", " + (-g_SunRadius * SUN_SCROLL_Y_SUN_OFFS) + ")");
    }
    //// [SLIDER END]
    
    data.move.object.append("circle")
    .attr("class", "move pattern " + (MULTI.to_copy ? "copy" : "move"))
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", g_OverlayRadius);
    
    data.move.object.append("circle")
    .attr("class", "move select")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", g_OverlayRadius * CHECKED_SELECT_RATIO);
    
    AddMoveText(data, data.name, MULTI.to_copy ? "Copy to" : "Move to");
    
    data.move.children = data.move.object.append("g")
    .attr("class", "move items");
    
    // Accept & Cancel on the sun
    let menu_options = [
        { name: "Accept", icon: "done", link: ApplyMove },
        { name: "Cancel", icon: "close", link: ClearMove }
    ];

    let menu_items = data.move.menu.append("g")
        .attr("class", "move-menu-items");

    menu_items.selectAll("g.move-menu-items")
        .data(menu_options)
        .enter()
        .append("foreignObject")
        .each(function(d, i) {
            // calculate position
            let rot = i * 360 / menu_options.length - 90;
            let len = g_SunRadius - g_OverlayItemSize;
            let pos = {};
            pos.x = Math.cos(rot * Math.PI / 180) * len;
            pos.y = Math.sin(rot * Math.PI / 180) * len;

            g_OverlayItemSize = 28;
            d3.select(this)
                // center object
                .attr("x", -g_OverlayItemSize / 2)
                .attr("y", -g_OverlayItemSize / 2)
                .attr("width", g_OverlayItemSize)
                .attr("height", g_OverlayItemSize)
                .style("overflow", "visible")
                // place around circle
                .attr("transform", "translate(" + (pos.x) + ", " + (pos.y) + ")")
                .append("xhtml:i")
                .attr("class", "material-icons")
                .attr("title", d.name)
                .style("font-size", g_OverlayItemSize + "px")
                .style("color", data.color ? FlipColor(data.color) : "#303030")
                // icon
                .text(d.icon)
                // function    
                .on("click", function() {
                    d.link(data);
                });
        });
    
    // Accept & Cancel Buttons

    // data.move.allgroup = data.move.object.append("g")
    //     .attr("class", "move allgroup")
    //     .attr("transform", "translate(0, " + (-g_OverlayRadius * CHECKED_ALLGROUP_OFFSET) + ")");
    
    // data.move.allgroup.append("rect")
    //     .attr("class", "move text_allgroup")
    //     .attr("x", 0)
    //     .attr("y", -25)
    //     .attr("width", 2)
    //     .attr("height", 40);

    // data.move.allgroup.append("text")
    //     .attr("class", "move text_back")
    //     .attr("x", -10)
    //     .attr("y", 0)
    //     .style("text-anchor", "end")
    //     .html("Accept");

    // data.move.allgroup.append("text")
    //     .attr("class", "move text_allgroup")
    //     .attr("x", -10)
    //     .attr("y", 0)
    //     .style("text-anchor", "end")
    //     .html("Accept")
    //     .on("mouseup", function(d) {
    //         ApplyMove(data);
    //     });

    // data.move.allgroup.append("text")
    //     .attr("class", "move text_back")
    //     .attr("x", 10)
    //     .attr("y", 0)
    //     .style("text-anchor", "start")
    //     .html("Cancel")
        
    // data.move.allgroup.append("text")
    //     .attr("class", "move text_allgroup")
    //     .attr("x", 10)
    //     .attr("y", 0)
    //     .style("text-anchor", "start")
    //     .html("Cancel")
    //     .on("mouseup", function(d) {
    //         ClearMove(data);
    //     });



}

function ClearMove(data)
{
    DeselectAllPlanets(data);
    g_project.move = false;

    d3.selectAll("g.star.move")
        .remove();

    d3.selectAll("g.move-menu")
        .remove();

    $(".prompt-menu").remove();
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
    MULTI.to_parent_id = data.parent_id,
    MULTI.to_ic_id = data.ic_id,
    LoadStart();
    
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

    ClearMove(data);
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