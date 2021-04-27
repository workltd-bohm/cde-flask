const colorScale = [
    "#3345c9",
    "#274554",
    "#b088dc",
    "#572159",
    "#842309",
    "#c55656",
    "#ed8d2e",
    "#d7d120",
    "#afc556",
    "#448449",
    "#56c5af",
    "#e8e8e8"
];

function ChangeColor(data) {
    if (g_view !== VIEW_PL) { alert("to be implemented"); return; }
    let defaultColor = $(".foregin .material-icons").css("color");

    let _radius = g_OverlayRadius;
    if (!data.values.data.values.sun) {
        _radius = g_PlanetRadius;
    }

    let pie = d3.layout.pie().sort(null);
    let arc = d3.svg.arc().innerRadius(_radius * .5).outerRadius(_radius);

    // spawn color wheel group
    let object = data.values.data.values.sun ? d3.select("g.star.dom") : data.values.this;
    let offY = (g_root.slider && data.values.data.values.sun) ? (-g_SunRadius * SUN_SCROLL_Y_SUN_OFFS) : 0;

    let wheel = object.append("g")
        .attr("class", "color_wheel")
        .attr("transform", "translate(0, " + offY + "), scale(0.5), rotate(90)") // animation property
        .attr("opacity", "0"); // animation property

    if (g_root.slider && data.values.data.values.sun) {
        wheel.transition().duration(0)
            .attr("y", 0);
    }

    let circle = wheel.append("circle")
        .attr("r", _radius)
        .attr("fill", defaultColor)

    // animate wheel
    wheel.transition()
        .duration(200)
        .attr("transform", "translate(0, " + offY + "), scale(1), rotate(0)")
        .attr("opacity", "1");

    wheel.datum(Array(colorScale.length).fill(1))
        .selectAll("path")
        .data(pie)
        .enter()
        .append("path")
        .attr("fill", function(d, i) {
            return colorScale[i];
        })
        .attr("d", arc)
        .on("mouseover", function() {
            let fill = d3.select(this).attr("fill");
            circle.attr("fill", fill);
        })
        .on("click", function() {
            let fill = d3.select(this).attr("fill");
            data.values.data.color = fill;
            // $(".foregin .material-icons").css("color", fill); change color before reload?
            SetColor(data.values.data, fill);

            wheel.transition()
                .duration(200)
                .attr("opacity", 0)
                .each(function() {
                    setTimeout(() => {
                        d3.select(this).remove();
                    }, 200);
                });
        });

    // animate wheel on mouse leave
    wheel.on("mouseleave", function() {
        wheel.on("mouseleave", null)
            .transition()
            .duration(100)
            .attr("transform", "translate(0, " + offY + "), scale(1.25), rotate(90)")
            .transition()
            .duration(200)
            .attr("transform", "translate(0, " + offY + "), scale(0), rotate(270)")
            .attr("opacity", 0)
            .remove()
    });
};

// applies the new color to the appropriate IC
function SetColor(data, fill) {
    console.log(data);
    var o = Object.values(CHECKED);
    var multi = [];
    for (var i = 0; i < o.length; i++) {
        multi.push({
            ic_id: o[i].ic_id,
            parent_id: o[i].parent_id,
            color: data.color
        });
    }
    LoadStart();
    $.ajax({
        url: (o.length > 0) ? "/set_color_multi" : "/set_color",
        type: 'POST',
        data: JSON.stringify((o.length > 0) ? multi : { ic_id: data.ic_id, parent_id: data.parent_id, color: data.color, name: data.name }),
        timeout: 30000,
        success: function(response) {
            MakeSnackbar(response);
            SESSION["undo"] = true;

            if (o.length > 0) {
                Object.values(CHECKED).forEach((d) => {
                    // update background color
                    d.values.background
                        .transition()
                        .ease("ease")
                        .duration(500)
                        .style("fill", fill);

                    // update text color
                    d.values.object.selectAll(".text_front")
                        .transition()
                        .ease("ease-in-out")
                        .duration(500)
                        .style("fill", FlipColor(fill));
                });
            } else {
                // update background color
                data.values.background
                    .transition()
                    .ease("ease")
                    .duration(500)
                    .style("fill", fill);

                // update text color
                data.values.object.selectAll(".text_front")
                    .transition()
                    .ease("ease-in-out")
                    .duration(500)
                    .style("fill", FlipColor(fill));
            }

            DeselectAllPlanets(g_project.current_ic);
            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                //
            }
        }
    });
}

function FlipColor(color) {
    color = color.substring(1); // strip #
    var rgb = parseInt(color, 16); // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff; // extract red
    var g = (rgb >> 8) & 0xff; // extract green
    var b = (rgb >> 0) & 0xff; // extract blue

    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    if (luma < 128) {
        return '#e8e8e8';
    } else {
        return '#303030';
    }
}