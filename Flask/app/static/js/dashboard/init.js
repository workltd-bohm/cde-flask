const ORBIT_MIN_ZOOM = 1
const ORBIT_MAX_ZOOM = 2;
const ORBIT_ANIM_MOVE = 200;

const PADDING = 300;

var g_project = {};
var g_globusRadius = 0;
var g_root = {};
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
        ]
    },
];
// var g_data = [{
//     name : "Sunce",
//     class : "centar",
//     id : "1",
//     parent : "0",
//     box : {
//         position : {x : 0,y : 0,z : 0},
//         velocity : {x : 0,y : 0,z : 0},
//         rotate : {x : 0,y : 0,z : 0},
//         translate : {x : 0,y : 0,z : 0},
//         scale : 1,
//         width : 0,
//         height : 0,
//         border : 0,
//         color : {r : 0,g : 0,b : 0, a : 1},
//         bcolor : {r : 0,g : 0,b : 0, a : 1},
//         bgcolor : {r : 0,g : 0,b : 0, a : 1},
//         flat : 1
//     },
//     values : {},
//     children : []
// }];

function WindowResize(){
    var dash = $("#index-dashboard");

    var dash_w = dash.width()*1.2;
    var dash_h = dash.height();

    g_project = {
        width : dash_w,
        height : dash_h,
        width_h : dash_w/2,
        height_h : dash_h/2,
        padding : PADDING,
        start : Date.now()
    };

    g_globusRadius = g_project.height/2 - g_project.padding;

    g_root.x = g_project.width_h;
    g_root.y = g_project.height_h;
}

$( document ).ready(function() {

    WindowResize();

    // -------------------------------------------------------

    g_root = {
        x : g_root.x,
        y : g_root.y,
        width : g_project.width_h,
        height : g_project.height_h,
        degree : 0,
        scale : 1,
        scale_old : 1,
        moving : false,
        follow : null,
        children : null
    }

    // -------------------------------------------------------

    var globDrag = d3.behavior.drag()
        //.on("drag", Move);
        .on("drag", Rotate); 
    var globZoom = d3.behavior.zoom()
        .scaleExtent([ORBIT_MIN_ZOOM,ORBIT_MAX_ZOOM])
        .on("zoom", Zoom);
    var projection = d3.geo.orthographic()
        .scale(g_globusRadius)
        .translate([0, 0])
        .clipAngle(90)
        .precision(.1);
    var path = d3.geo.path()
        .projection(projection);

    // -------------------------------------------------------

    var SVG = d3.select("#SVG");
    var SWGDefs = SVG.append("defs");

    // -------------------------------------------------------

    var planetShadow = SWGDefs.append("radialGradient")
        .attr("id", "planetShadow")
        .attr("r", 0.7)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("fx", "50%")
        .attr("fy", "50%");
    planetShadow.append("stop").attr("offset", "0%").style("stop-color", "rgba(0,0,0,0.1)");
    planetShadow.append("stop").attr("offset", "60%").style("stop-color", "rgba(0,0,0,0.3)");
    planetShadow.append("stop").attr("offset", "100%").style("stop-color", "rgba(0,0,0,0.5)");

    // -------------------------------------------------------

    g_root.children = SVG.append("g")
        .attr("id","Star")
        .attr("transform","translate("+(g_root.x)+","+(g_root.y)+"),"+"scale("+(g_root.scale)+") ")
        .call(globDrag)
        .call(globZoom);

    g_root.children.append("circle")
        .attr("id", "Touch")
        .attr("r", g_globusRadius*4);

    g_root.children.selectAll("g")
        .data(g_data)
        .enter()
        .append("g")
        .each(function(d){AddChildren(d3.select(this),d,null);});

    
    function AddChildren(obj, data, parent, level=1){
        data.values.this = obj;

        //data.values.parent = d3.select("#obj-"+data.parent);
        data.values.back = parent;

        if(data.id > 0)
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform","rotate("+(data.id*45)+"), translate("+(g_globusRadius*2)+", 0)");

        var pre = data.values.this.append("g");

        data.values.this.append("circle")
            .attr("class", "object")
            .attr("r", g_globusRadius/level);

        data.values.this.append("circle")
            .attr("class", "shader")
            .attr("r", g_globusRadius/level);

        pre.selectAll("g")
            .data(data.children)
            .enter()
            .append("g")
            .each(function(d){AddChildren(d3.select(this),d,data, level+1);});
    }

    // -------------------------------------------------------

    function Move() {
        g_root.x += d3.event.dx/g_root.scale;
        g_root.y += d3.event.dy/g_root.scale;
    }
    function Rotate() {
        var dif_x = g_root.x - d3.event.x;
        var dif_y = g_root.y - d3.event.y;
        var deg = Math.atan2(dif_y, dif_x);
        g_root.degree += Math.sin((g_root.degree-(deg))/180*Math.PI)*5;
    }
    function Zoom() {
        projection.translate(d3.event.translate);
        projection.scale(d3.event.scale);
        g_root.scale = d3.event.scale;//g_project.event_scale;
        // var offsetX =  g_root.scale*(g_root.x - g_project.width_h) ;
        // var offsetY =  g_root.scale*(g_root.y - g_project.height_h) ;
        // g_root.width = g_project.width_h + offsetX ;
        // g_root.height = g_project.height_h + offsetY ;
    }

    d3.timer(function(elapsed) {
        // g_root.scale = g_root.scale_old;
        // globZoom.scale(g_root.scale_old);
        var offsetX =  g_root.scale*(g_root.x - g_project.width_h) ;
        var offsetY =  g_root.scale*(g_root.y - g_project.height_h) ;
        g_root.width = g_project.width_h + offsetX ;
        g_root.height = g_project.height_h + offsetY ;
        g_root.children.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform","translate("+(g_root.x)+","+(g_root.y)+"), rotate("+(g_root.degree)+"), scale("+(g_root.scale)+") ")
            .each("end", function(){d3.selectAll(".putanja").attr("stroke-width", 1/g_root.scale);});
    });

});

$( window ).resize(function() {
    WindowResize();
});
