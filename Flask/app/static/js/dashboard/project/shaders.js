var SWGDefs = SVG.append("defs");

// -------------------------------------------------------

var g_GradientShadow = SWGDefs.append("radialGradient")
    .attr("id", "gradient_shadow")
    .attr("r", PLANET_SHADOW_RAD)
    .attr("cx", "15%")
    .attr("cy", "50%")
    .attr("fx", "15%")
    .attr("fy", "50%");
g_GradientShadow.append("stop").attr("offset", "0%").style("stop-color", "rgba(0,0,0,0)");
g_GradientShadow.append("stop").attr("offset", "50%").style("stop-color", "rgba(0,0,0,0.35)");
g_GradientShadow.append("stop").attr("offset", "100%").style("stop-color", "rgba(0,0,0,0.65)");

var g_GradientShadowSun = SWGDefs.append("radialGradient")
    .attr("id", "gradient_shadow_sun")
    .attr("r", PLANET_SHADOW_RAD)
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("fx", "50%")
    .attr("fy", "50%");
g_GradientShadowSun.append("stop").attr("offset", "0%").style("stop-color", "rgba(0,0,0,0.2)");
g_GradientShadowSun.append("stop").attr("offset", "50%").style("stop-color", "rgba(0,0,0,0.45)");
g_GradientShadowSun.append("stop").attr("offset", "100%").style("stop-color", "rgba(0,0,0,1)");

var g_FilterShadow = SWGDefs.append("filter")
    .attr("id", "filter_shadow")
    .attr("x", "-10%")
    .attr("y", "-10%")
    .attr("width", "180%")
    .attr("height", "180%");
/*g_FilterShadow.append("feGaussianBlur")
    .attr("stdDeviation", "1 1")
    .attr("result", "blur");*/
g_FilterShadow.append("feOffset")
    .attr("dx", "2")
    .attr("dy", "2");

var g_FilterBlur = SWGDefs.append("filter")
    .attr("id", "filter_blur")
    .attr("x", "-20%")
    .attr("y", "-20%")
    .attr("width", "140%")
    .attr("height", "140%");
g_FilterBlur.append("feGaussianBlur")
    .attr("stdDeviation", "10 10")
    .attr("result", "blur");
    
var g_PatternSunFixated = SWGDefs.append("pattern")
    .attr("id", "patern_sun_fix")
    .attr("x", "0%")
    .attr("y", "-0%")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox","0 0 1 1")
    .append("image")
    .attr("x", "0")
    .attr("y", "0")
    .attr("width", "1")
    .attr("height", "1")
    .attr("xlink:href", IMG_PATH_SUN);

var g_PatternSunRotate = SWGDefs.append("pattern")
    .attr("id", "patern_sun_rot")
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

var g_PatternPlanetFixated = SWGDefs.append("pattern")
    .attr("id", "patern_planet_fix")
    .attr("x", "0%")
    .attr("y", "-0%")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox","0 0 1 1")
    .append("image")
    .attr("x", "0")
    .attr("y", "0")
    .attr("width", "1")
    .attr("height", "1")
    .attr("xlink:href", IMG_PATH_PLANET);

var g_PatternPlanetRotate = SWGDefs.append("pattern")
    .attr("id", "patern_planet_rot")
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

var g_PatternPlanetFile = SWGDefs.append("pattern")
    .attr("id", "patern_planet_file")
    .attr("x", "0%")
    .attr("y", "-0%")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox","0 0 1 1")
    .append("image")
    .attr("x", "0")
    .attr("y", "0")
    .attr("width", "1")
    .attr("height", "1")
    .attr("xlink:href", IMG_PATH_PLANET_FILE);

var g_PatternPlanetFolder = SWGDefs.append("pattern")
    .attr("id", "patern_planet_folder")
    .attr("x", "0%")
    .attr("y", "-0%")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox","0 0 1 1")
    .append("image")
    .attr("x", "0")
    .attr("y", "0")
    .attr("width", "1")
    .attr("height", "1")
    .attr("xlink:href", IMG_PATH_PLANET_FOLDER);

var g_PatternPlanetEmpty = SWGDefs.append("pattern")
    .attr("id", "patern_planet_empty")
    .attr("x", "0%")
    .attr("y", "-0%")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox","0 0 1 1")
    .append("image")
    .attr("x", "0")
    .attr("y", "0")
    .attr("width", "1")
    .attr("height", "1")
    .attr("xlink:href", IMG_PATH_PLANET_EMPTY);

// -------------------------------------------------------
