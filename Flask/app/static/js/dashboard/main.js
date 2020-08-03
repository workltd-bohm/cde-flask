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

// -------------------------------------------------------


function CreateSpace(data) {
    g_root.x = g_project.width_h;
    g_root.y = g_project.height_h;
    g_root.scale = g_root.scale_old;
    g_root.cy_min = g_root.cy = -g_project.height_h*PLANET_MIN_MAX_COEF/g_root.scale;
    g_root.cy_max = g_root.cy_min;
    g_root.deg = g_root.rad = g_root.rad_diff = 0;
    g_root.zoom = true;
    g_root.slider = false;

    g_root.children.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("class","sun")
        .style("opacity", 0)
        .transition()
        .delay(1)
        .style("opacity", 100)
        .each(function(d){AddSun(d3.select(this), d);});
}

function AddSun(obj, data){
    data.box = {...g_box};
    data.values = {};
    data.values.this = obj;
    data.values.rotation = 1;
    data.values.centar = true;

    if(data.sub_folders && data.sub_folders.length > PLANET_MAX_NUMBER) {
        g_root.slider = true;
        g_root.cy_max = -(data.sub_folders.length-1)*g_globusRadius*PLANET_SCROLL_COEF+g_project.height_h*PLANET_MIN_MAX_COEF;
    }

    data.values.this.attr("id", "obj-"+data.name);
    data.values.this.attr("parent", (parent != null) ? "obj-"+parent.name : "null");

    if (g_root.slider) {
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "translate("+(-g_globusRadius*SUN_SCROLL_X_COEF)+", 0)");//, scale("+(SUN_SCROLL_SIZE_COEF)+")");
    }

    data.values.children = data.values.this.append("g").attr("class", "child");

    var draw = data.values.this.append("g").attr("target", "target-"+data.name);

    data.values.picture = draw.append("circle")
        .attr("class", "object")
        .attr("r", g_globusRadius);

    data.values.text = data.values.this.append("g")
        .attr("class", "text")
    data.values.text.append("text")
        .attr("x",0)
        .attr("y",0)
        .attr("fill","rgb(0,0,0)")
        .attr("transform","rotate("+(-g_root.deg)+"), scale(2)")
        .attr("font-size", "28px")
        .style("filter", "url(#shadow)")
        .attr("text-anchor","middle")
        .html(data.name);
    data.values.text.append("text")
        .attr("x",0)
        .attr("y",0)
        .attr("fill","rgba(250,250,250,255)")
        .attr("transform","rotate("+(-g_root.deg)+"), scale(2)")
        .attr("font-size", "28px")
        .attr("text-anchor","middle")
        .html(data.name);

    if(data.sub_folders){
        data.values.children.selectAll("g")
            .data(data.sub_folders)
            .enter()
            .append("g")
            .attr("class","planet")
            .each(function(d, i){AddChildren(d3.select(this), d, data, i);});
    }
    
}

function AddChildren(obj, data, parent, position=0){
    data.box = {...g_box};
    data.values = {};
    data.values.this = obj;
    data.values.parent = (parent != null) ? d3.select("#obj-"+parent.name) : null;
    data.values.back = parent;
    data.values.position = position;

    data.values.rotation = data.values.back.sub_folders.length > 1 ? position*360/data.values.back.sub_folders.length : 1;

    data.values.this.attr("id", "obj-"+data.name);
    data.values.this.attr("parent", (parent != null) ? "obj-"+parent.name : "null");

    data.values.centar = false;
    if(g_root.slider) {
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "translate("+(g_globusRadius*PLANET_ORBIT_COEF)+", "+(data.values.position*g_globusRadius*PLANET_SCROLL_COEF)+")");
    }
    else {
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform","rotate("+(data.values.rotation)+"), translate("+(g_globusRadius*PLANET_ORBIT_COEF)+", 0), rotate("+(-data.values.rotation)+")");
    }

    var draw = data.values.this.append("g").attr("target", "target-"+data.name);

    data.values.picture = draw.append("circle")
        .attr("class", "object")
        .attr("r", g_globusRadius/PLANET_SUN_RATIO);

    data.values.text = data.values.this.append("g")
        .attr("class", "text")
    data.values.text.append("text")
        .attr("x",0)
        .attr("y",0)
        .attr("fill","rgb(0,0,0)")
        .attr("transform","rotate("+(-g_root.deg)+"), scale(1)")
        .attr("font-size", "28px")
        .style("filter", "url(#shadow)")
        .attr("text-anchor","middle")
        .html(data.name);
    data.values.text.append("text")
        .attr("x",0)
        .attr("y",0)
        .attr("fill","rgba(250,250,250,255)")
        .attr("transform","rotate("+(-g_root.deg)+"), scale(1)")
        .attr("font-size", "28px")
        .attr("text-anchor","middle")
        .html(data.name);

    if(g_root.slider) {
        data.values.text.selectAll("text").attr("text-anchor","left")
            .attr("transform","translate("+(g_globusRadius/PLANET_SCROLL_TEXT)+")");
    }
    data.values.shader = draw.append("circle")
        .attr("class", "shader")
        .attr("r", g_globusRadius/PLANET_SUN_RATIO)
        .attr("transform","rotate("+((g_root.slider)?0:data.values.rotation)+")");

    //if(data.sub_folders && data.sub_folders.length > 0){
        data.values.select = data.values.this.append("circle")
            .attr("class","select")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", g_globusRadius/PLANET_SUN_RATIO)
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
                    SunFadeout(data);
                }
            });
    //}
}

function SunFadeout(data){
    g_root.zoom = false;
    g_root.scale_old = g_root.scale;
    g_root.scale *= PLANET_SUN_RATIO;
    if (!g_root.slider) {
        var vec_x = Math.cos((g_root.deg+data.values.rotation)/180*Math.PI);
        var vec_y = Math.sin((g_root.deg+data.values.rotation)/180*Math.PI);
        g_root.x -= vec_x*g_globusRadius*PLANET_ORBIT_COEF*g_root.scale;
        g_root.y -= vec_y*g_globusRadius*PLANET_ORBIT_COEF*g_root.scale;
    }
    else {
        var vec_x = g_globusRadius*PLANET_ORBIT_COEF-g_globusRadius*SUN_SCROLL_X_COEF;
        var vec_y = data.values.position*g_globusRadius*PLANET_SCROLL_COEF;
        g_root.x -= vec_x*g_root.scale;
        g_root.y -= (vec_y+g_root.cy)*g_root.scale;
    }

    //console.log(data.values.parent.select("#target-"+data.values.back.name).selectAll("circle"));
    data.values.back.values.this.select("g[target='target-"+data.values.back.name+"']").transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .style("opacity", 0)
    data.values.back.values.text.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .style("opacity", 0)
    data.values.shader.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .style("opacity", 0)
    data.values.picture.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .attr("transform","rotate("+(-g_root.deg)+")")
    data.values.text.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .attr("transform","translate(0)");
    data.values.back.values.children.selectAll("g.planet").each(function(d){
        if(d3.select(this).attr("id") && data.values.this.attr("id") != d3.select(this).attr("id")) {
            //console.log(data.values.this.attr("id") , d3.select(this).attr("id"));
            d3.select(this).transition()
                .ease("linear")
                .duration(ORBIT_ANIM_MOVE)
                .style("opacity", 0)
        }
        if(data.values.this.attr("id") == d3.select(this).attr("id")){
            d3.select(this).transition()
                .ease("linear")
                .duration(ORBIT_ANIM_RESET)
                .each("end", function(){
                    g_project.skip = data;
                })
        }
    });
}

// -------------------------------------------------------

function Move(zoom=false) {
    // g_root.cx += d3.event.dx/g_root.scale;
    console.log(d3.event)
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


function AnimateUniverse() {
    g_root.children.selectAll("g.sun").each(AnimateSun);
    // g_root.scale = g_root.scale_old;
    // globZoom.scale(g_root.scale_old);
    // var offsetX =  g_root.scale*(g_root.x - g_project.width_h) ;
    // var offsetY =  g_root.scale*(g_root.y - g_project.height_h) ;
    // g_root.width = g_project.width_h + offsetX ;
    // g_root.height = g_project.height_h + offsetY ;
    //.log(parseFloat(planetZemlja.attr("x")));
    g_project.rotate += ORBIT_ROT_SCALE/100*g_project.speed_scale;
    if(g_project.rotate > 0) g_project.rotate = -ORBIT_ROT_CICLE;
    planetZemlja.attr("x", g_project.rotate);
    g_root.obj.transition()
        .ease("linear")
        .duration((g_project.warp) ? function(){g_project.warp--; return 0;} : ORBIT_ANIM_MOVE)
        .attr("transform","translate("+(g_root.x)+","+(g_root.y)+"), scale("+(g_root.scale)+")") //, rotate("+(g_root.deg)+")")
        .transition()
        .each(function(){
            if(g_project.skip != false){
                g_project.warp = 3;
                g_project.skip.values.parent.remove()
                CreateSpace([g_project.skip]);
                g_project.skip = false;
            }
        });
        //.each("end", function(){d3.selectAll(".putanja").attr("stroke-width", 1/g_root.scale);});
}

function AnimateSun(data) {
    //data.values.children.selectAll("g.planet").each(AnimatePlanet);
    AnimatePlanet(data);
}

function AnimatePlanet(data) {
    if(g_root.slider){
        if(1){
            data.values.children.transition()
                .ease("linear")
                .duration(ORBIT_ANIM_MOVE_SCROLL)
                .attr("transform","translate(0,"+(g_root.cy)+")");
        }
    }
    else {
        data.values.children.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform","rotate("+(g_root.deg)+")");

        data.values.children.selectAll("g.planet").each(function(data){
            data.values.text.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform","rotate("+(-g_root.deg)+")");
        });
    }
}

function DashboardCreate(data) {

    WindowResize();

    // -------------------------------------------------------

    // -------------------------------------------------------

    g_root.obj = SVG.append("g")
        .attr("id","Universe")
        .attr("transform","translate("+(g_root.x)+","+(g_root.y)+"),"+"scale("+(g_root.scale)+")")
        .call(globDrag)
        .call(globZoom);

    g_root.children = g_root.obj.append("g")
        .attr("id","Star")

    g_root.children.append("circle")
        .attr("id", "Touch")
        .attr("r", g_globusRadius*4);

    CreateSpace(data);

    d3.timer(function(elapsed) {
        AnimateUniverse();

        if ($(DASHBOARD).width() != g_project.width || $(DASHBOARD).height() != g_project.height){
            WindowResize();
        }
    });
}

$( document ).ready(function(){
    $.getJSON(PROJECT_PATH, function(data){
        DashboardCreate([data.root_ic]);
        PathCreation([data.root_ic]);
    });
});
