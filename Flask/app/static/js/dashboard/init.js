const ORBIT_MIN_ZOOM = 1
const ORBIT_MAX_ZOOM = 2;
const ORBIT_ANIM_MOVE = 200;
const ORBIT_ROT_CICLE = 0.66;
const ORBIT_ROT_SCALE = 0.001;
const ORBIT_SPEED_SCALE = 10;

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
    }];

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
        coef_scale : 2,
        speed_scale : ORBIT_SPEED_SCALE,
        rotate_scale : ORBIT_ROT_SCALE,
        rotate : 0,
        skip: false,
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
        focus : null,
        children : null
    }

    // -------------------------------------------------------

    var globDrag = d3.behavior.drag()
        //.on("drag", Move);
        //.on("drag", Rotate); 
    var globZoom = d3.behavior.zoom()
        //.scaleExtent([ORBIT_MIN_ZOOM,ORBIT_MAX_ZOOM])
        //.on("zoom", Zoom);
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
    planetShadow.append("stop").attr("offset", "60%").style("stop-color", "rgba(0,0,0,0.5)");
    planetShadow.append("stop").attr("offset", "100%").style("stop-color", "rgba(0,0,0,0.8)");

    var planetZemlja = SWGDefs.append("pattern")
            //.attr("patternUnits","userSpaceOnUse")
            .attr("id", "slika-zemlja")
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
            .attr("xlink:href", IMG_PATH);

    // -------------------------------------------------------

    g_root.children = SVG.append("g")
        .attr("id","Star")
        .attr("transform","translate("+(g_root.x)+","+(g_root.y)+"),"+"scale("+(g_root.scale)+") ")
        .call(globDrag)
        .call(globZoom);

    g_root.children.append("circle")
        .attr("id", "Touch")
        .attr("r", g_globusRadius*4);

    CreateSun(g_data);

    function CreateSun(data) {
        g_root.x = g_project.width_h;
        g_root.y = g_project.height_h;
        g_root.scale = 1;
        g_root.children.selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .each(function(d){AddChildren(d3.select(this), d, null);});
    }

    function AddChildren(obj, data, parent, level=1){
        data.values.this = obj;
        data.values.parent = (parent != null) ? d3.select("#obj-"+parent.id) : null;
        data.values.back = parent;
        data.box = {...g_box};

        data.values.this.attr("id", "obj-"+data.id);
        data.values.this.attr("parent", (parent != null) ? "obj-"+parent.id : "null");

        if(level > 1) {
            data.values.this.transition()
                .ease("linear")
                .duration(ORBIT_ANIM_MOVE)
                .attr("transform","rotate("+(data.id*45)+"), translate("+(g_globusRadius*2)+", 0), rotate("+(-data.id*45)+")");
        }

        var pre = data.values.this.append("g").attr("class", "child");

        var obj = data.values.this.append("g").attr("target", "target-"+data.id);
        obj.append("circle")
            .attr("class", "object")
            .attr("r", g_globusRadius/level);

        obj.append("circle")
            .attr("class", "shader")
            .attr("r", g_globusRadius/level);

        if(level > 1)  {
            data.values.select = data.values.this.append("circle")
                .attr("class","select")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", g_globusRadius/level)
                .attr("fill", "rgba(0,0,0,0)")
                .attr("stroke", "none")
                .on("mouseenter",function(d){
                    data.values.select.attr("fill","rgba(255,255,255,0.3)");
                })
                .on("mouseleave",function(d){
                    data.values.select.attr("fill","rgba(0,0,0,0)");
                })
                .on("mousedown",function(d){
                    data.box.position.x = d3.event.x;
                    data.box.position.y = d3.event.y;
                })
                .on("mouseup",function(d){
                    if(data.box.position.x == d3.event.x && data.box.position.y == d3.event.y) {
                        var vec_x = Math.cos((data.id*45)/180*Math.PI);
                        var vec_y = Math.sin((data.id*45)/180*Math.PI);
                        g_root.x -= vec_x*g_globusRadius*4;
                        g_root.y -= vec_y*g_globusRadius*4;
                        g_root.scale *= 2;
                        //console.log(data.values.parent.select("#target-"+data.values.back.id).selectAll("circle"));
                        data.values.parent.select("g[target='target-"+data.values.back.id+"']").transition()
                                .ease("linear")
                                .duration(ORBIT_ANIM_MOVE)
                                .style("opacity", 0)
                        data.values.parent.select("g.child").selectAll("g").each(function(d){
                                if(d3.select(this).attr("id") && data.values.this.attr("id") != d3.select(this).attr("id")) {
                                    //console.log(data.values.this.attr("id") , d3.select(this).attr("id"));
                                    d3.select(this).transition()
                                        .ease("linear")
                                        .duration(ORBIT_ANIM_MOVE)
                                        .style("opacity", 0)
                                        .transition()
                                        .each("end", function(){
                                            //var tmp = d3.select("#Star");
                                            g_project.skip = true;
                                            data.values.parent.remove();
                                            CreateSun(g_data);
                                        })
                                }
                            });
                    }
                });
        }

        pre.selectAll("g")
            .data(data.children)
            .enter()
            .append("g")
            .each(function(d){AddChildren(d3.select(this), d, data, level+1);});
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
        //g_root.degree += Math.sin((g_root.degree-(deg))/180*Math.PI)*5;
    }
    function Zoom() {
        projection.translate(d3.event.translate);
        projection.scale(d3.event.scale);
        g_root.scale = d3.event.scale;
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
        //.log(parseFloat(planetZemlja.attr("x")));
        g_project.rotate += ORBIT_ROT_SCALE/100*g_project.speed_scale;
        if(g_project.rotate > 0) g_project.rotate = -ORBIT_ROT_CICLE;
        planetZemlja.attr("x", g_project.rotate);
        g_root.children.transition()
            .ease("linear")
            .duration(g_project.skip ? 1 : ORBIT_ANIM_MOVE)
            .attr("transform","translate("+(g_root.x)+","+(g_root.y)+"), rotate("+(g_root.degree)+"), scale("+(g_root.scale)+") ");
            //.each("end", function(){d3.selectAll(".putanja").attr("stroke-width", 1/g_root.scale);});
        g_project.skip = false;
    });

});

$( window ).resize(function() {
    WindowResize();
});