var SWGDefs = SVG.append("defs");

// -------------------------------------------------------

var g_GradientShadow = SWGDefs.append("radialGradient")
    .attr("id", "gradient_shadow")
    .attr("r", PLANET_SHADOW_RAD)
    .attr("cx", "15%")
    .attr("cy", "50%")
    .attr("fx", "15%")
    .attr("fy", "50%");
g_GradientShadow.append("stop").attr("offset", "0%").style("stop-color", "rgba(0,0,0,0.1)");
g_GradientShadow.append("stop").attr("offset", "60%").style("stop-color", "rgba(0,0,0,0.5)");
g_GradientShadow.append("stop").attr("offset", "100%").style("stop-color", "rgba(0,0,0,1)");

var g_FilterShadow = SWGDefs.append("filter")
	.attr("id", "filter_shadow")
	.attr("x", "-20%")
	.attr("y", "-20%")
	.attr("width", "140%")
	.attr("height", "140%");
g_FilterShadow.append("feGaussianBlur")
	.attr("stdDeviation", "1 1")
	.attr("result", "shadow");
g_FilterShadow.append("feOffset")
	.attr("dx", "2")
    .attr("dy", "2");

var g_PatternSun = SWGDefs.append("pattern")
        .attr("id", "patern_sun")
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
        .attr("xlink:href", IMG_PATH_SUN);

var g_PatternPlanet = SWGDefs.append("pattern")
        .attr("id", "patern_planet")
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
        .attr("xlink:href", IMG_PATH_PLANET);

// -------------------------------------------------------