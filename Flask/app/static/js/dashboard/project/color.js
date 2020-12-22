const colorScale = [
    "#FFD300",
    "#FFFF00",
    "#A2F300",
    "#00DB00",
    "#00B7FF",
    "#1449C4",
    "#4117C7",
    "#820AC3",
    "#DB007C",
    "#FF0000",
    "#FF7400",
    "#FFAA00"];

function ColorPicker(data) {
    var defaultColor = $(".foregin .material-icons").css("color");

    var pie = d3.layout.pie().sort(null);
    var arc = d3.svg.arc().innerRadius(g_OverlayRadius).outerRadius(g_OverlayRadius*1.5);
    
    var wheel = data.values.back.object.append("g")
        .attr("class", "color_wheel")
        .attr("x",0)
        .attr("y",0)

    var circle = wheel.append("circle")
        .attr("r", g_OverlayRadius)
        .attr("fill", defaultColor)

    wheel.datum(Array(colorScale.length).fill(1))
        .selectAll("path")
        .data(pie)
        .enter()
        .append("path")
        .attr("fill", function (d, i) {
            return colorScale[i];
        })
        .attr("d", arc)
        .on("mouseover", function () {
            var fill = d3.select(this).attr("fill");
            circle.attr("fill", fill);
        })
        .on("click", function() {
            var fill = d3.select(this).attr("fill");
            data.values.data.color = fill;
            // $(".foregin .material-icons").css("color", fill); change color before reload?
            SetColor(data.values.data);
            wheel.remove();
        });

    wheel.on("mouseleave", function () {
            wheel.remove();
        });
  };

function SetColor(data, fill){
    var o = Object.values(CHECKED);
    var multi = [];
    for (var i = 0; i < o.length; i++) multi.push({ic_id: o[i].ic_id, color: data.color});
    LoadStart();
    $.ajax({
        url: (o.length > 0)? "/set_color_multi" : "/set_color",
        type: 'POST',
        data: JSON.stringify((o.length > 0)? multi : {ic_id: data.ic_id, color: data.color}),
        timeout: 5000,
        success: function(data){
            MakeSnackbar(data);
            SESSION["undo"] = true;
            CreateProject();
            LoadStop();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
        }
    });
}