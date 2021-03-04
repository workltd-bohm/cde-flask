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

function ColorPicker(data) {
    var defaultColor = $(".foregin .material-icons").css("color");

    let _radius = g_OverlayRadius;
    if (!data.values.data.values.sun) {
        _radius = g_PlanetRadius;
    }

    var pie = d3.layout.pie().sort(null);
    var arc = d3.svg.arc().innerRadius(_radius * .5).outerRadius(_radius);
    var wheel = data.values.this.append("g")
        .attr("class", "color_wheel")
        .attr("x", 0)
        .attr("y", 0)
        .attr("transform", "scale(0.5), rotate(90)") // animation property
        .attr("opacity", "0"); // animation property

    var circle = wheel.append("circle")
        .attr("r", _radius)
        .attr("fill", defaultColor)

    // animate wheel
    wheel.transition()
        .duration(200)
        .attr("transform", "scale(1), rotate(0)")
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
            var fill = d3.select(this).attr("fill");
            circle.attr("fill", fill);
        })
        .on("click", function() {
            var fill = d3.select(this).attr("fill");
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
            .attr("transform", "scale(1.25), rotate(90)")
            .transition()
            .duration(200)
            .attr("transform", "scale(0), rotate(270)")
            .attr("opacity", 0)
            .remove()
            // .each(function(){
            //     setTimeout(function(){
            //         wheel.transition()
            //             .duration(200)
            //             .attr("transform", "scale(0)")
            //             .attr("opacity", 0)
            //             .each(function(){
            //                 setTimeout(() => {
            //                     d3.select(this).remove();
            //                 }, 200);
            //             });
            //     }, 100);
            // });
    });
};

function SetColor(data, fill) {
    var o = Object.values(CHECKED);
    var multi = [];
    for (var i = 0; i < o.length; i++) multi.push({ ic_id: o[i].ic_id, color: data.color });
    LoadStart();
    $.ajax({
        url: (o.length > 0) ? "/set_color_multi" : "/set_color",
        type: 'POST',
        data: JSON.stringify((o.length > 0) ? multi : { ic_id: data.ic_id, color: data.color, name: data.name }),
        timeout: 5000,
        success: function(response) {
            MakeSnackbar(response);
            SESSION["undo"] = true;

            // update background color
            data.values.background
                .transition()
                .ease("ease")
                .duration(500)
                .style("fill", fill);

            // update text color
            data.values.object.select(".text_front")
                .transition()
                .ease("ease-in-out")
                .duration(500)
                .style("fill", FlipColor(fill));
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