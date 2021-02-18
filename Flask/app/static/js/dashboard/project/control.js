
// -------------------------------------------------------

function WindowResize(){
    var dash = $DASHBOARD;
    let offX = $SVG.offset().left;
    let offY = $SVG.offset().top;

    var dash_w = dash.width();
    var dash_h = dash.height()-offY;
    
    $SVG.height(dash_h);

    g_project.width = dash_w;
    g_project.height = dash_h;
    g_project.width_h = dash_w/2;
    g_project.height_h = dash_h/2;

    var frame = g_project.height_h;
    if (g_project.width_h < frame) {
        frame = g_project.width_h;
    }

    g_TouchRadius = frame*2;

    g_SunRadius = frame/SUN_SIZE_COEF;
    if(g_SunRadius < SUN_MIN_SIZE) g_SunRadius = SUN_MIN_SIZE;

    g_PlanetRadius = g_SunRadius/PLANET_SUN_RATIO;
    g_PlanetRadius_old = g_PlanetRadius;

    g_PathRadius = g_SunRadius/PATH_SUN_RATIO;
    g_HistRadius = g_SunRadius/HISTORY_SUN_RATIO;

    g_OverlayRadius = g_SunRadius;
    g_OverlayItemSize = g_OverlayRadius/OVERLAY_SUN_RATIO;

    g_root.x = g_project.width_h;
    g_root.y = g_project.height_h;
}

// -------------------------------------------------------

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
        g_project.dragging = false;
    }
    else {
        g_root.rad = (rad-g_root.rad_diff);
        g_root.deg = g_root.rad*180/Math.PI;
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
            g_root.scale = d3.event.scale;
        }
    }
}

// -------------------------------------------------------

function ClickStart(ToDo, data){
    data.box.position.x = d3.event.x;
    data.box.position.y = d3.event.y;

    if(g_project.clck_start == 0 && g_root.zoom) {
        g_project.clck_start = data.values.this;
        d3.timer(function(duration) {
            if (g_project.clck_stop > 0) {
                if(g_project.clck_stop == 1) {
                    g_project.clck_start = 0;
                    ToDo(data);
                }
                g_project.clck_stop--;
            }
            if (g_project.clck_start == 0) return true;
         });
    }
}

function ClickStop(ToDo, data, single=false){
    if(data.box.position.x == d3.event.x && data.box.position.y == d3.event.y) {
        // console.log(g_project)
        if(g_project.clck_stop > 0 || (single && g_root.zoom)){
            if(g_project.clck_start != 0 && g_project.clck_start == data.values.this) {
                g_project.clck_start = 0;
                g_project.clck_stop = 0;
                ToDo(data);
                return;
            }
        }
        g_project.clck_stop = ORBIT_DUB_CLK_DIF;
    }
}

function SelectPlanet(data){
    if (data.values.data.checked) {
        data.values.data.checked = false;
        data.values.data.values.checked.style("opacity", 0);
        if(data.values.data.ic_id in CHECKED) delete CHECKED[data.values.data.ic_id];
    }
    else {
        data.values.data.checked = true;
        data.values.data.values.checked.style("opacity", 100);
        CHECKED[data.values.data.ic_id] = data.values.data;
    }
    //console.log(CHECKED)
    if (Object.keys(CHECKED).length > 0) SelectionCreate(data.values.data.values.back.values.this, data.values.data.values.back);
    else {
        data.values.data.values.back.values.text.style("opacity", 100);
        if(g_project.selection){
            g_project.selection.remove();
            g_project.selection = false;
        }
    }

    document.getElementById("select-all").checked = true;
    document.getElementById("select-all").indeterminate = true;
    data.values.data.values.text.style("opacity", 100);
    g_project.overlay.remove();
    g_project.overlay = false;
}

function SelectAllPlanets(data){
    d3.selectAll("g.planet.dom").each(function(d){
        //console.log(d);
        d.checked = true;
        d.values.checked.style("opacity", 100);
        CHECKED[d.ic_id] = d;
    });
    SelectionCreate(data.values.data.values.back.values.this, data.values.data.values.back);
}

function DeselectAllPlanets(data){
    CHECKED = {};
    MULTI = {};

    d3.selectAll("g.planet.dom").each(function(d){
        //console.log(d);
        d.checked = false;
        d.values.checked.style("opacity", 0);
    });

    data.values.data.values.back.values.text.style("opacity", 100);
    if(g_project.selection){
        g_project.selection.remove();
        g_project.selection = false;
    }
}

// -------------------------------------------------------
