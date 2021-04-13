
// -------------------------------------------------------
window.onresize = function(){
    ResizeCards();
}

function WindowResize(){
    var dash = $DASHBOARD;
    let offX = $SVG.offset().left;
    let offY = $SVG.offset().top;

    var dash_w = dash.width() - offX;
    var dash_h = dash.height() - offY;
    
    $SVG.height(dash_h);
    $SVG.width(dash_w);

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
    // g_PlanetRadius_old = g_PlanetRadius;

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
    .on("zoomstart", function(d){g_project.dragging = true;})
    .on("zoom", Zoom)
    .on("zoomend", function(d){})
    .scale(g_root.scale);

function Move(zoom=false) {
    // g_root.cx += d3.event.dx/g_root.scale;
    var tmp = (zoom)? -d3.event.sourceEvent.deltaY : d3.event.dy/g_root.scale;
    if (g_root.cy + tmp <= g_root.cy_min && g_root.cy + tmp >= g_root.cy_max) {
        g_root.cy += tmp;
    }
}

var temp_deg_old = 0;
function Rotate(slider=false, zoom=false) {
    if(zoom){
        var dif_y = d3.event.sourceEvent.deltaY / ORBIT_ZOOM_SCROLL_COEF;
        g_root.rad += dif_y;
    }
    else{
        var dif_x = -(g_root.x + (slider ? g_root.cx : 0) - d3.event.x);
        var dif_y = -(g_root.y + (slider ? g_root.cy : 0) - d3.event.y);
        var rad  = Math.atan2(dif_y, dif_x);
        //if(rad < 0) rad = (Math.PI*2) + rad;
        if(g_project.dragging && !zoom) {
            g_root.rad_diff = (rad-g_root.rad);
            g_project.dragging = false;
        }
        g_root.rad = (rad-g_root.rad_diff);
    }
    if(g_root.rad < 0) g_root.rad = (Math.PI*2) + g_root.rad;
    g_root.rad = ((g_root.rad * ORBIT_ZOOM_PI_QA) % (Math.PI * ORBIT_ZOOM_PI_QA * 2)) / ORBIT_ZOOM_PI_QA;
    g_root.deg = g_root.rad * 180 / Math.PI;

    if(g_root.deg > 270 && temp_deg_old < 90) g_root.deg_exp--;
    if(g_root.deg < 90 && temp_deg_old > 270) g_root.deg_exp++;

    temp_deg_old = g_root.deg;
}

function Drag(d){
    if(g_root.slider){
        //// [SLIDER START]
        // Move();
        //// [SLIDER OLD/NEW]
        Rotate(true);
        //// [SLIDER END]
    }
    else{
        Rotate();
    }
}
function Zoom(d) {
    if(g_root.slider){
        //// [SLIDER START]
        // Move(true);
        //// [SLIDER OLD/NEW]
        Rotate(true, true);
        //// [SLIDER END]
    }
    else{
        //// [ZOOM-DRAG START]
        // if(g_root.zoom){
        //     g_root.scale = d3.event.scale;
        // }
        //// [ZOOM-DRAG OLD/NEW]
        Rotate(false, true);
        //// [ZOOM-DRAG END]
    }
}

// -------------------------------------------------------

var loopDrag = d3.behavior.drag()
    .on("dragstart", LoopDragStart)
    .on("drag", LoopDrag)
    .on("dragend", function(d){});

function LoopDragStart(d){
    var dif_x = -(g_root.x - g_project.width_h/2 - d3.event.sourceEvent.layerX + g_root.looper.size/SCROLL_LOOP_SIZE_FIX);
    var atc = g_project.spiral_info.spiral_length/g_project.width_h*(dif_x)/SCROLL_LOOP_POS_FIX;
    g_root.deg = atc;
    g_root.rad = g_root.deg/180*Math.PI;

    g_root.deg_exp = Math.trunc(g_root.deg/360);

    if(g_root.rad < 0) g_root.rad = (Math.PI*2) + g_root.rad;
    g_root.rad = ((g_root.rad * ORBIT_ZOOM_PI_QA) % (Math.PI * ORBIT_ZOOM_PI_QA * 2)) / ORBIT_ZOOM_PI_QA;
    g_root.deg = g_root.rad * 180 / Math.PI;

    //console.log(g_root.deg, g_root.deg_exp)
}
function LoopDrag(d){
    var dif_x = -(g_root.x - g_project.width_h/2 - d3.event.x + g_root.looper.size/SCROLL_LOOP_SIZE_FIX);
    var atc = (g_project.spiral_info.spiral_length)/g_project.width_h*(dif_x)/SCROLL_LOOP_POS_FIX;
    g_root.deg = atc;
    g_root.rad = g_root.deg/180*Math.PI;

    if(g_root.rad < 0) g_root.rad = (Math.PI*2) + g_root.rad;
    g_root.rad = ((g_root.rad * ORBIT_ZOOM_PI_QA) % (Math.PI * ORBIT_ZOOM_PI_QA * 2)) / ORBIT_ZOOM_PI_QA;
    g_root.deg = g_root.rad * 180 / Math.PI;

    if(g_root.deg > 270 && temp_deg_old < 90) g_root.deg_exp--;
    if(g_root.deg < 90 && temp_deg_old > 270) g_root.deg_exp++;

    temp_deg_old = g_root.deg;
    //console.log(g_root.deg, g_root.deg_exp)
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
    // modify CHECKED dictionary
    if (data.values.data.checked) 
    {
        // deselect planet
        data.values.data.checked = false;

        if (data.values.data.ic_id in CHECKED) 
        {
            delete CHECKED[data.values.data.ic_id];
        }
    }
    else 
    {
        // select planet
        data.values.data.checked = true;
        CHECKED[data.values.data.ic_id] = data.values.data;
    }
    
    let num_checked   = Object.keys(CHECKED).length;
    let has_checked = (num_checked > 0);
    
    if (has_checked) {
        if (g_view === VIEW_PL)
        SelectionCreate(data.values.data.values.back.values.this, data.values.data.values.back);
    } 
    else 
    {
        // bring back planet text
        if (data.values.data.values.back.values.text) {
            data.values.data.values.back.values.text.style("opacity", 1);
        }

        // clear selection
        ClearSelection();
    }

    // Adjust Select-All Button In Hover Menu
    document.getElementById("select-all").checked = has_checked;
    document.getElementById("select-all").indeterminate = (has_checked) && (num_checked < g_project.current_ic.sub_folders.length);
    document.getElementById("select-all-label").textContent = has_checked ? "Deselect" : "Select all";

    if (data.values.data.values.text) {
        data.values.data.values.text.style("opacity", 1);
    }

    OverlayDestroy();
}

function SelectAllPlanets(data){
    switch(g_view)
    {
        case VIEW_PL:
            d3.selectAll("g.planet.dom").each(function(d){
                d.checked = true;
                CHECKED[d.ic_id] = d;
            });
            
            SelectionCreate(data.values.data.values.back.values.this, data.values.data.values.back);
            
            $(".planet-select").addClass("show");
            $(".planet-select i").text("check_circle");
            break;

        case VIEW_GR:
            g_project.current_ic.sub_folders.forEach((d) => {
                d.checked = true;
                CHECKED[d.ic_id] = d;
            });

            // set cards to be checked and checkmarks visible
            $(".card").find("input").prop("checked", true)
                .css("opacity", 1);
            break;

        default: break;
    }
}

function DeselectAllPlanets(data){
    CHECKED = {};
    MULTI = {};

    switch(g_view)
    {
        case VIEW_PL:
            d3.selectAll("g.planet.dom").each(function(d){
                //console.log(d);
                d.checked = false;
            });
        
            if (data.values.data.values.back.values.text) {
                data.values.data.values.back.values.text.style("opacity", 1);
            }
            
            ClearSelection();
        
            $(".planet-select").removeClass("show");
            $(".planet-select i").text("check_circle_outline");
            break;
        
        case VIEW_GR:
            g_project.current_ic.sub_folders.forEach((d) => {
                d.checked = false;
            });

            // set cards to be unchecked and checkmarks invisible
            $(".card").find("input").prop("checked", false)
                .css("opacity", 0);
            break;
    }
}

function PreserveSelection()
{
    if (CHECKED["SAVE"])
    {
        delete CHECKED["SAVE"];
    } else {
        CHECKED = {};
    }
}

function InstanceExists(instance)
{
    return Boolean(instance);
}

var handler = document.querySelector(".dragbar");
var isHandlerDragging = false;

// turn on dragging
document.addEventListener('mousedown', function(e) {
    if (e.target === handler) {
        isHandlerDragging = true;
        document.getElementsByClassName("tree-view")[0].style.transition = 'none';
    }
});
  
document.addEventListener('mousemove', function(e) {
    if (!isHandlerDragging) {
        return false;
    }

    // resize
    let x = $(".tree-view").offset().left;
    $(".tree-view").width(e.clientX - x);
});

// flag dragging off
document.addEventListener('mouseup', function(e) {
    isHandlerDragging = false;
    document.getElementsByClassName("tree-view")[0].style.transition = 'all 500ms ease';
});
// -------------------------------------------------------
// Select area
// let grid = document.getElementById("PROJECT-GRID");
// var div = document.getElementById('select-area'), x1 = 0, y1 = 0, x2 = 0, y2 = 0;

// let min_dist = 15;
// let drag_active = false;

// function reCalc() { //This will restyle the div
//     if (!drag_active) return;
//     var x3 = Math.min(x1,x2); //Smaller X
//     var x4 = Math.max(x1,x2); //Larger X
//     var y3 = Math.min(y1,y2); //Smaller Y
//     var y4 = Math.max(y1,y2); //Larger Y

//     div.style.left = x3 + 'px';
//     div.style.top = y3 + 'px';
//     div.style.width = x4 - x3 + 'px';
//     div.style.height = y4 - y3 + 'px';
// }

// grid.onmousedown = function(e) {
//     div.hidden = 0; //Unhide the div
//     x1 = e.clientX; //Set the initial X
//     y1 = e.clientY; //Set the initial Y
//     reCalc();
// };

// grid.onmousemove = function(e) {
//     drag_active = (Math.abs(x2 - x1) > min_dist || Math.abs(y2 - y1) > min_dist) ? true : false;
//     x2 = e.clientX; //Update the current position X
//     y2 = e.clientY; //Update the current position Y
//     reCalc();
// };

// onmouseup = function() {
//     div.hidden = 1; //Hide the div
//     drag_active = false;
// };