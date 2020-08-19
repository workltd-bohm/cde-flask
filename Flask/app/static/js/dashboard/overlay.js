
// -------------------------------------------------------

// -------------------------------------------------------

function OverlayCreate(data) {
    data.values.overlay = data.values.this.append("g")
        .attr("class","Overlay");

    data.values.overlay.append("circle")
        .attr("class","overmenu")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_SunRadius*2)
        .style("stroke-width", g_SunRadius*2)
        .on("mouseleave",function(d){
            data.values.overlay.remove();
        });
}

// -------------------------------------------------------
