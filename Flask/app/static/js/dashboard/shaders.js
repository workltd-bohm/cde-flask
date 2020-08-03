var SWGDefs = SVG.append("defs");

// -------------------------------------------------------

var planetShadow = SWGDefs.append("radialGradient")
    .attr("id", "planetShadow")
    .attr("r", PLANET_SHADOW_RAD)
    .attr("cx", "15%")
    .attr("cy", "50%")
    .attr("fx", "15%")
    .attr("fy", "50%");
planetShadow.append("stop").attr("offset", "0%").style("stop-color", "rgba(0,0,0,0.1)");
planetShadow.append("stop").attr("offset", "60%").style("stop-color", "rgba(0,0,0,0.5)");
planetShadow.append("stop").attr("offset", "100%").style("stop-color", "rgba(0,0,0,1)");

var fShadow = SWGDefs.append("filter")
	.attr("id", "shadow")
	.attr("x", "-20%")
	.attr("y", "-20%")
	.attr("width", "140%")
	.attr("height", "140%");
fShadow.append("feGaussianBlur")
	.attr("stdDeviation", "1 1")
	.attr("result", "shadow");
fShadow.append("feOffset")
	.attr("dx", "2")
    .attr("dy", "2");

var planetZemlja = SWGDefs.append("pattern")
        //.attr("patternUnits","userSpaceOnUse")
        .attr("id", "slika-zemlja")
        .attr("x", "0%")
        .attr("y", "-150%")
        .attr("width", "300%")
        .attr("height", "400%")
        .attr("viewBox","0 0 1 1")
        .append("image")
        .attr("x", -ORBIT_ROT_CICLE)
        .attr("y", "0")
        .attr("width", "1")
        .attr("height", "1")
        .attr("xlink:href", IMG_PATH);

// -------------------------------------------------------