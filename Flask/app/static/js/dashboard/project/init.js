const ORBIT_MIN_ZOOM = 1;
const ORBIT_MAX_ZOOM = 1.2;

const ORBIT_ANIM_MOVE = 200;
const ORBIT_ANIM_MOVE_SCROLL = 5;
const ORBIT_ANIM_RESET = 600;
const ORBIT_ANIM_RESET_SKIP = 20;

const ORBIT_DUB_CLK_DIF =  50;

const ORBIT_PATTERN = true;
const ORBIT_PATTERN_ANIM = false;
const ORBIT_ROT_CICLE = 0.66;
const ORBIT_ROT_SCALE = 0.001;
const ORBIT_SPEED_SCALE = 10;

const SUN_MIN_SIZE = 100;
const SUN_SIZE_COEF = 4; //g_SunRadius = frame/SUN_SIZE_COEF;
const SUN_SCROLL_X_COEF = 2;
const SUN_SCROLL_SIZE_COEF = 0.3;
const SUN_SCROLL_ZOOM = 1.2;

const SUN_BG_RATIO = 1; //How much around the sun can be seen (used for effects) - 1.5 if you want to see the shadow

// const PLANET_MAX_NUMBER_MIN = 9;
const PLANET_MAX_NUMBER_MAX = 10;

const PLANET_SUN_RATIO = 1.5; // g_PlanetRadius = g_SunRadius/PLANET_SUN_RATIO;
const PLANET_MIN_MAX_COEF = 0.5;
const PLANET_SHADOW_RAD = 0.7;
const PLANET_ORBIT_COEF = 1.8;
const PLANET_SCROLL_COEF = 1.3;
const PLANET_SCROLL_TEXT = 1.1;
const PLANET_SCROLL_ZOOM = 1.2;

const PATH_SUN_RATIO = 4;
const PATH_ORBIT_COEF = 1.1;
const PATH_TEXT_PADDING = 11;
const PATH_TEXT_MAX_TEXT = 20;

const HISTORY_SUN_RATIO = 4;
const HISTORY_ORBIT_COEF = 1.1;
const HISTORY_TEXT_PADDING = 3;

const OVERLAY_SUN_RATIO = 5;
const OVERLAY_SUN_MARGIN = 2;
const OVERLAY_PLANET_RATIO = 5;
const OVERLAY_PLANET_MARGIN = 10;

const OVERLAY_SELECT_RATIO = 1.1;
const OVARLAY_DESELECT_RATIO = 0.8;
const OVERLAY_SELECT_PLANET_RATIO = 1;

const CHECKED_SELECT_RATIO = 1.2;
const CHECKED_ALLGROUP_OFFSET = 2.5; //offset of Select All/Clear All in the Y direction -g_OverlayRadius * CHECKED_ALLGROUP_OFFSET

const TEXT_SPACING = 20;
const TEXT_PLANET_SUN_RATIO = 2;
const TEXT_MOVE_COEF = 4;
const TEXT_MAX_LENGHT = 12;
const TEXT_MAX_SCROLL_LENGHT = 60;
const TEXT_MAX_TEXT = 30;
const TEXT_MAX_SCROLL_TEXT = 60;


// ----------------------------------------------------

const $DASHBOARD = $("#index-dashboard");
// define jQuery workspace
const $WS = $(".workspace");

const $SVG = $("#PROJECT");
const SVG = d3.select("#PROJECT");

// ----------------------------------------------------
const PLANETARY = 0;
const GRID = 1;

var g_project = {
        width : 0,
        height : 0,
        width_h : 0,
        height_h : 0,
        coef_scale : 2,
        speed_scale : ORBIT_SPEED_SCALE,
        rotate_scale : ORBIT_ROT_SCALE,
        dragging : false,
        skip: false,
        //project_position: null,
        //project_position_mix: null,
        search:false,
        history_num : 0,
        clck_start : 0,
        clck_stop : 0,
        current_ic : null,
        hist_path : null,
        hist_path_len : 0,
        paths_path : null,
        display_name : null,
        overlay : null,
        selection : null,
        move : null,
        history : null,
        paths : null,
        warp : 0,
        start : Date.now(),
        view : GRID
    };
var g_project_per = {...g_project};

var g_TouchRadius = 0;
var g_SunRadius = 0;
var g_PlanetRadius = 0;
var g_PlanetRadius_old = 0;
var g_PathRadius = 0;
var g_HistRadius = 0;
var g_OverlayRadius = 0;
var g_OverlayItemSize = 0;

var g_box = {
        position : {x : 0,y : 0,z : 0},
        velocity : {x : 0,y : 0,z : 0},
        rotate : {x : 0,y : 0,z : 0},
        translate : {x : 0,y : 0,z : 0},
        scale : 1,
        width : 1,
        height : 1,
        border : 1,
        color : {r : 0,g : 0,b : 0, a : 1},
        bcolor : {r : 0,g : 0,b : 0, a : 1},
        bgcolor : {r : 0,g : 0,b : 0, a : 1},
        flat : 1
    };

var g_root = {
    x : g_project.width_h,
    y : g_project.height_h,
    cx : 0,
    cy : 0,
    width : g_project.width_h,
    height : g_project.height_h,
    rotate : 0,
    deg : 0,
    rad : 0,
    rad_diff : 0,
    scale : 1.1,
    scale_old : 1.1,
    scale_scroll : SUN_SCROLL_SIZE_COEF,
    focus : null,
    children : null,
    obj : null,
    zoom : false,
    slider : false,
    universe : null
}

function ClearProject(hard=false){
    if(g_root.universe) g_root.universe.remove();
    if(g_project.hist_path) g_project.hist_path.remove();
    if(g_project.paths_path) g_project.paths_path.remove();
    if(g_project.overlay) g_project.overlay.remove();
    if(g_project.selection) g_project.selection.remove();
    if(g_project.move) g_project.move.remove();
    g_project = {...g_project_per};
    if(hard)SESSION = {};
}

// -------------------------------------------------------
