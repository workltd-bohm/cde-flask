const ORBIT_MIN_ZOOM = 1;
const ORBIT_MAX_ZOOM = 1.2;
const ORBIT_ANIM_MOVE = 200;
const ORBIT_ANIM_MOVE_SCROLL = 50;
const ORBIT_ANIM_RESET = 600;
const ORBIT_ROT_CICLE = 0.66;
const ORBIT_ROT_SCALE = 0.001;
const ORBIT_SPEED_SCALE = 10;

const SUN_MIN_SIZE = 100;
const SUN_SIZE_COEF = 3;
const SUN_SCROLL_X_COEF = 2.5;
const SUN_SCROLL_SIZE_COEF = 0.3;

const PLANET_SUN_RATIO = 2;
const PLANET_MAX_NUMBER = 10;
const PLANET_MIN_MAX_COEF = 0.5;
const PLANET_SHADOW_RAD = 0.7;
const PLANET_ORBIT_COEF = 1.7;
const PLANET_SCROLL_COEF = 1.1;

const PADDING = 300;

const DASHBOARD = $("#index-dashboard");

var SVG = d3.select("#SVG");

var g_data = [{
    id: 0,
    box : [],
    values : {},
    children : [
        {id: 1, box : [], values : {}, children : []},
        {id: 2, box : [], values : {}, children : []},
        {id: 3, box : [], values : {}, children : []},
        {id: 4, box : [], values : {}, children : []},
        {id: 5, box : [], values : {}, children : []},
        {id: 6, box : [], values : {}, children : []},
        {id: 7, box : [], values : {}, children : []},
        {id: 8, box : [], values : {}, children : []},
        {id: 9, box : [], values : {}, children : []},
        {id: 10, box : [], values : {}, children : []},
        {id: 11, box : [], values : {}, children : []},
        {id: 12, box : [], values : {}, children : []},
        {id: 13, box : [], values : {}, children : []},
    ]
}];

var g_project = g_project = {
        width : 0,
        height : 0,
        width_h : 0,
        height_h : 0,
        coef_scale : 2,
        speed_scale : ORBIT_SPEED_SCALE,
        rotate_scale : ORBIT_ROT_SCALE,
        rotate : 0,
        dragging : false,
        skip: false,
        history : [g_data[0].children[0]],
        start : Date.now()
    };

var g_globusRadius = 0;

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
}
