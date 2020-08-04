function WindowResize(){
    var dash = DASHBOARD;

    var dash_w = dash.width();
    var dash_h = dash.height();

    g_project.width = dash_w;
    g_project.height = dash_h;
    g_project.width_h = dash_w/2;
    g_project.height_h = dash_h/2;

    var frame = g_project.height_h;
    if (g_project.width_h < frame) {
        frame = g_project.width_h
    }
    g_globusRadius = frame/SUN_SIZE_COEF;
    if(g_globusRadius < SUN_MIN_SIZE) g_globusRadius = SUN_MIN_SIZE;

    g_pathRadius = g_globusRadius;

    g_root.x = g_project.width_h;
    g_root.y = g_project.height_h;
}

//var globDrag = d3.drag()
var globDrag = d3.behavior.drag()
    .on("dragstart", function(d){g_project.dragging = true;})
    .on("drag", Drag)
    .on("dragend", function(d){});
//var globZoom = d3.zoom()
var globZoom = d3.behavior.zoom()
    .scaleExtent([ORBIT_MIN_ZOOM,ORBIT_MAX_ZOOM])
    .on("zoom", Zoom)
    .scale(g_root.scale);
//var projection = d3.geoOrthographic()
// var projection = d3.geo.orthographic()
//     .scale(g_globusRadius)
//     .translate([0, 0])
//     .clipAngle(90)
//     .precision(.1);
// //var path = d3.geoPath(projection);
// var path = d3.geo.path()
//     .projection(projection);

function Move(zoom=false) {
    // g_root.cx += d3.event.dx/g_root.scale;
    var tmp = (zoom)? -d3.event.sourceEvent.deltaY : d3.event.dy/g_root.scale;
    if (g_root.cy + tmp <= g_root.cy_min && g_root.cy + tmp >= g_root.cy_max) {
        g_root.cy += tmp;
    }
}
function Rotate() {
    var dif_x = -(g_root.x - d3.event.x);
    var dif_y = -(g_root.y - d3.event.y);
    var rad  = Math.atan2(dif_y, dif_x);
    if(g_project.dragging) {
        g_root.rad_diff = (rad-g_root.rad);
        //console.log("dragstart "+g_root.rad_diff);
        g_project.dragging = false;
    }
    else {
        g_root.rad = (rad-g_root.rad_diff);
        g_root.deg = g_root.rad*180/Math.PI;
        //console.log(">"+g_root.deg);
    }
}
function Drag(){
    if(g_root.slider){
        Move();
    }
    else{
        Rotate();
    }
}
function Zoom() {
    if(g_root.slider){
        Move(true);
    }
    else{
        if(g_root.zoom){
            // projection.translate(d3.event.translate);
            // projection.scale(d3.event.scale);
            g_root.scale = d3.event.scale;
            // var offsetX =  g_root.scale*(g_root.x - g_project.width_h) ;
            // var offsetY =  g_root.scale*(g_root.y - g_project.height_h) ;
            // g_root.width = g_project.width_h + offsetX ;
            // g_root.height = g_project.height_h + offsetY ;
        }
    }
}
