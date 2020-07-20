
var DASHBOARD = $("#index-dashboard");

const DASHBOARD_W = DASHBOARD.width();
const DASHBOARD_H = DASHBOARD.height();

const ORBIT_MAX_ZOOM = 500;
const ORBIT_ANIM_MOVE = 50;

const PADDING = 200;

var g_project = {
    width : DASHBOARD_W,
    height : DASHBOARD_H,
    width_h : DASHBOARD_W/2,
    height_h : DASHBOARD_H/2,
    padding : PADDING,
    start : Date.now()
};

var g_globusAngle = 0;
var g_globusRadius = g_project.height/2 - g_project.padding;
var g_globusScale = 1;
var g_viewMod = 0;
var g_allLoaded = false;

var Root = {
    x : g_project.width_h,
    y : g_project.height_h,
    width : this.x,
    height : this.y,
    scale : 1,
    scale_old : 1,
    moving : false,
    follow : null,
    children : null
}

var globDrag = d3.behavior.drag()
    .on("drag", Micanje); 
var globZoom = d3.behavior.zoom()
    .scaleExtent([1,ORBIT_MAX_ZOOM])
    .on("zoom", Zoom);
var projection = d3.geo.orthographic()
    .scale(g_globusRadius)
    .translate([0, 0])
    .clipAngle(90)
    .precision(.1);
var path = d3.geo.path()
	.projection(projection);

function Micanje() {
    Root.x += d3.event.dx/Root.scale;
    Root.y += d3.event.dy/Root.scale;
    Root.children.attr("transform"," translate("+(Root.width)+","+(Root.height)+"), scale("+(Root.scale)+")");
}

function Zoom() {
    projection.translate(d3.event.translate);
    projection.scale(d3.event.scale);
    Root.scale = d3.event.scale;//g_project.event_scale;
    var offsetX =  Root.scale*(Root.x - g_project.width_h) ;
    var offsetY =  Root.scale*(Root.y - g_project.height_h) ;
    Root.width = g_project.width_h + offsetX ;
    Root.height = g_project.height_h + offsetY ;
}

d3.timer(function(elapsed) {
    //Root.scale = Root.scale_old;
    //globZoom.scale(Root.scale_old);
    var offsetX =  Root.scale*(Root.x - g_project.width_h) ;
    var offsetY =  Root.scale*(Root.y - g_project.height_h) ;
    Root.width = g_project.width_h + offsetX ;
    Root.height = g_project.height_h + offsetY ;
    Root.children.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .attr("transform"," translate("+(Root.width)+","+(Root.height)+"),"+"scale("+(Root.scale)+") ")
        .each("end", function(){d3.selectAll(".putanja").attr("stroke-width", 1/Root.scale);});
});

// -------------------------------------------------------

var SVG = d3.select("#SVG");
var SWGDefs = SVG.append("defs");

var planetShadow = SWGDefs.append("radialGradient")
	.attr("id", "planetShadow")
    .attr("r", 0.7)
	.attr("cx", "15%")
	.attr("cy", "50%")
	.attr("fx", "15%")
	.attr("fy", "50%");
planetShadow.append("stop").attr("offset", "0%").style("stop-color", "rgba(0,0,0,0.1)");
planetShadow.append("stop").attr("offset", "60%").style("stop-color", "rgba(0,0,0,0.5)");
planetShadow.append("stop").attr("offset", "100%").style("stop-color", "rgba(0,0,0,1)");

Root.children = SVG.append("g")
    .attr("id","Star")
    .attr("transform","translate(0, 0)")
    .call(globDrag)
    .call(globZoom)
    .append("circle")
    .attr("r", g_globusRadius)
    .attr("cx", 10)
    .attr("cy", 10)
    .attr("transform","translate("+g_project.width_h+","+g_project.height_h+")");
