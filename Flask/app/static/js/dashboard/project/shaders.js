let SWGDefs = SVG.append("defs");

// -------------------------------------------------------
// let g_SmallGrid = SWGDefs.append("pattern")
//     .attr("id", "smallGrid")
//     .attr("patternUnits", "userSpaceOnUse")
//     .attr("width", "10")
//     .attr("height", "10");

// g_SmallGrid.append("path")
//     .attr("d", "M10,0 L0,0 0,10")
//     .attr("fill", "none")
//     .attr("stroke", "gray")
//     .attr("stroke-width", "0.5");

// let g_Grid = SWGDefs.append("pattern")
//     .attr("id", "grid")
//     .attr("width", "100")
//     .attr("height", "100")
//     .attr("patternUnits", "userSpaceOnUse");

// g_Grid.append("path")
//     .attr("d", "M 100 0 L 0 0 0 100")
//     .attr("fill", "none")
//     .attr("stroke", "gray")
//     .attr("stroke-width", "1");

// g_Grid.append("rect")
//     .attr("width", "100")
//     .attr("height", "100")
//     .attr("fill", "url(#smallGrid)");

let g_GradientShadow = SWGDefs.append("radialGradient")
    .attr("id", "gradient_shadow")
    .attr("r", PLANET_SHADOW_RAD)
    .attr("cx", "15%")
    .attr("cy", "50%")
    .attr("fx", "15%")
    .attr("fy", "50%");
g_GradientShadow.append("stop").attr("offset", "0%").style("stop-color", "rgba(0,0,0,0)");
g_GradientShadow.append("stop").attr("offset", "50%").style("stop-color", "rgba(0,0,0,0.35)");
g_GradientShadow.append("stop").attr("offset", "100%").style("stop-color", "rgba(0,0,0,0.65)");

let g_GradientShadowSun = SWGDefs.append("radialGradient")
    .attr("id", "gradient_shadow_sun")
    .attr("r", PLANET_SHADOW_RAD)
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("fx", "50%")
    .attr("fy", "50%");
g_GradientShadowSun.append("stop").attr("offset", "0%").style("stop-color", "rgba(0,0,0,0.1)");
g_GradientShadowSun.append("stop").attr("offset", "10%").style("stop-color", "rgba(0,0,0,0.2)");
g_GradientShadowSun.append("stop").attr("offset", "50%").style("stop-color", "rgba(0,0,0,0.45)");
g_GradientShadowSun.append("stop").attr("offset", "100%").style("stop-color", "rgba(0,0,0,0.75)");

let g_FilterShadow = SWGDefs.append("filter")
    .attr("id", "filter_shadow")
    .attr("x", "0%")
    .attr("y", "0%")
    .attr("width", "140%")
    .attr("height", "140%");
g_FilterShadow.append("feGaussianBlur")
    .attr("stdDeviation", "1 1")
    .attr("result", "blur");
g_FilterShadow.append("feOffset")
    .attr("dx", "1")
    .attr("dy", "1");

let g_FilterBlur = SWGDefs.append("filter")
    .attr("id", "filter_blur")
    .attr("x", "-20%")
    .attr("y", "-20%")
    .attr("width", "140%")
    .attr("height", "140%");
g_FilterBlur.append("feGaussianBlur")
    .attr("stdDeviation", "10 10")
    .attr("result", "blur");
    
let g_PatternSunFixated = SWGDefs.append("pattern")
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

let g_PatternSunBg = SWGDefs.append("pattern")
    .attr("id", "patern_sun_bg")
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
    .attr("xlink:href", IMG_PATH_SUN_BG);

let g_GradientEclipse = SWGDefs.append("radialGradient")
    .attr("id", "gradient_eclipse")
    .attr("r", PLANET_SHADOW_RAD)
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("fx", "50%")
    .attr("fy", "50%");
g_GradientEclipse.append("stop").attr("offset", "40%").style("stop-color", "rgba(255, 255, 255, 0.8)");
g_GradientEclipse.append("stop").attr("offset", "50%").style("stop-color", "rgba(255, 255, 255, 0.0)");
/*g_GradientEclipse.append("stop").attr("offset", "38%").style("stop-color", "rgba(255, 255, 255, 0.2)");
g_GradientEclipse.append("stop").attr("offset", "40%").style("stop-color", "rgba(255, 255, 255, 0.1)");
g_GradientEclipse.append("stop").attr("offset", "60%").style("stop-color", "rgba(255, 255, 255, 0.0)");*/

let g_FilterEclipsePlanet = SWGDefs.append("filter")
    .attr("id", "filter_eclipse_planet")
    .attr("x", "-100%")
    .attr("y", "-100%")
    .attr("width", "300%")
    .attr("height", "300%");
g_FilterEclipsePlanet.append("feGaussianBlur")
    .attr("stdDeviation", "1 1")
    .attr("result", "blur");

let g_FilterEclipse = SWGDefs.append("filter")
    .attr("id", "filter_eclipse_sun")
    .attr("x", "-100%")
    .attr("y", "-100%")
    .attr("width", "300%")
    .attr("height", "300%");
g_FilterEclipse.append("feGaussianBlur")
    .attr("stdDeviation", "2 2")
    .attr("result", "blur");

let g_PatternSunRotate = SWGDefs.append("pattern")
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

let g_PatternPlanetFixated = SWGDefs.append("pattern")
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

let g_PatternPlanetRotate = SWGDefs.append("pattern")
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

let g_PatternPlanetFile = SWGDefs.append("pattern")
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

let g_PatternPlanetFolder = SWGDefs.append("pattern")
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

let g_PatternPlanetEmpty = SWGDefs.append("pattern")
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
