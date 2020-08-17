
// -------------------------------------------------------


function CreateSpace(data) {
    g_root.x = g_project.width_h;
    g_root.y = g_project.height_h;
    g_root.scale = g_root.scale_old;
    g_root.cy_min = g_root.cy = -g_project.height_h*PLANET_MIN_MAX_COEF/g_root.scale;
    g_root.cy_max = g_root.cy_min;
    g_root.deg = g_root.rad = g_root.rad_diff = 0;
    g_root.zoom = true;
    if (g_root.slider) g_SunRadius *= SUN_SCROLL_ZOOM;
    g_PlanetRadius = g_PlanetRadius_old;
    g_root.slider = false;

    g_root.universe.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("class","star")
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
    data.id = data.ic_id; // .replace(/[\/.]/g, "-");
    //data.par_id = parent.ic_id.replace(/\//g,"-");

    if(data.sub_folders) {
        g_PlanetRadius_old = g_PlanetRadius;
        if( data.sub_folders.length >= PLANET_MAX_NUMBER_MIN && data.sub_folders.length < PLANET_MAX_NUMBER_MAX ) {
            g_PlanetRadius /= (data.sub_folders.length+1)/PLANET_MAX_NUMBER_MIN;
        }
        else if( data.sub_folders.length >= PLANET_MAX_NUMBER_MAX) {
            g_root.slider = true;
            g_SunRadius /= SUN_SCROLL_ZOOM;
            g_PlanetRadius /= PLANET_SCROLL_ZOOM;
            g_root.cy_max = -(data.sub_folders.length-1)*g_SunRadius*PLANET_SCROLL_COEF+g_project.height_h*PLANET_MIN_MAX_COEF;
        }
    }

    data.values.this.attr("id", "obj-"+data.id);

    if (g_root.slider) {
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "translate("+(-g_SunRadius*SUN_SCROLL_X_COEF)+", 0)");//, scale("+(SUN_SCROLL_SIZE_COEF)+")");
    }

    data.values.children = data.values.this.append("g").attr("class", "child");

    var draw = data.values.this.append("g").attr("class", "object");

    data.values.picture = draw.append("circle")
        .attr("class", "pattern")
        .attr("r", g_SunRadius);

    data.values.text = draw.append("g")
        .attr("class", "text")
    data.values.text.append("text")
        .attr("x",0)
        .attr("y",0)
        .attr("fill","rgb(0,0,0)")
        .attr("transform","rotate("+(-g_root.deg)+"), scale("+(TEXT_SUN_SCALE)+")")
        .attr("font-size", TEXT_SUN_SIZE)
        .style("filter", "url(#shadow)")
        .attr("text-anchor","middle")
        .html(data.name);
    data.values.text.append("text")
        .attr("x",0)
        .attr("y",0)
        .attr("fill", TEXT_SUN_COLOR)
        .attr("transform","rotate("+(-g_root.deg)+"), scale("+(TEXT_SUN_SCALE)+")")
        .attr("font-size", TEXT_SUN_SIZE)
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
    data.id = data.ic_id; // .replace(/[\/.]/g,"-");
    data.par_id = parent.ic_id; // .replace(/[\/.]/g,"-");
    data.values.back = parent;
    data.values.position = position;
    data.values.parent = (parent != null) ? d3.select("#obj-"+data.par_id) : null;

    data.values.rotation = data.values.back.sub_folders.length > 1 ? position*360/data.values.back.sub_folders.length : 1;

    data.values.this.attr("id", "obj-"+data.id);
    // data.values.this.attr("parent", (parent != null) ? "obj-"+data.par_id : "null");

    data.values.centar = false;
    if(g_root.slider) {
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "translate("+(g_SunRadius*PLANET_ORBIT_COEF)+", "+(data.values.position*g_SunRadius*PLANET_SCROLL_COEF)+")");
    }
    else {
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform","rotate("+(data.values.rotation)+"), translate("+(g_SunRadius*PLANET_ORBIT_COEF)+", 0), rotate("+(-data.values.rotation)+")");
    }

    var draw = data.values.this.append("g").attr("class", "object");

    data.values.picture = draw.append("circle")
        .attr("class", "pattern")
        .attr("r", g_PlanetRadius);

    data.values.shader = draw.append("circle")
        .attr("class", "shader")
        .attr("r", g_PlanetRadius)
        .attr("transform","rotate("+((g_root.slider)?0:data.values.rotation)+")");

    data.values.text = draw.append("g")
        .attr("class", "text")
    data.values.text.append("text")
        .attr("class", "text_back")
        .attr("x",0)
        .attr("y",0)
        .attr("fill","rgb(0,0,0)")
        .attr("transform","rotate("+(-g_root.deg)+"), scale("+(TEXT_SUN_SCALE/TEXT_PLANET_SUN_RATIO)+")")
        .attr("font-size", TEXT_PLANET_SIZE)
        .style("filter", "url(#filter_shadow)")
        .attr("text-anchor","middle")
        .html(data.name);
    data.values.text.append("text")
        .attr("class", "text_front")
        .attr("x",0)
        .attr("y",0)
        .attr("fill", TEXT_PLANET_COLOR)
        .attr("transform","rotate("+(-g_root.deg)+"), scale("+(TEXT_SUN_SCALE/TEXT_PLANET_SUN_RATIO)+")")
        .attr("font-size", TEXT_PLANET_SIZE)
        .attr("text-anchor","middle")
        .html(data.name);
    if(g_root.slider) {
        data.values.text.selectAll("text").attr("text-anchor","left")
            .attr("transform","translate("+(g_SunRadius/PLANET_SCROLL_TEXT)+")");
    }

    //if(data.sub_folders && data.sub_folders.length > 0){
        data.values.select = data.values.this.append("circle")
            .attr("class","select")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", g_PlanetRadius)
            .attr("fill", "rgba(0,0,0,0)")
            .attr("stroke", "none")
            .on("mouseenter",function(d){
                data.values.select.attr("fill", PLANET_SELECT_COLOR);
            })
            .on("mouseleave",function(d){
                data.values.select.attr("fill","rgba(0,0,0,0)");
            })
            .on("mousedown",function(d){
                data.box.position.x = d3.event.x;
                data.box.position.y = d3.event.y;
                ClickStart(function(data){
                    // TODO: action menu
                }, data);
            })
            .on("mouseup",function(d){
                ClickStop(SunFadeout, data);
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
        g_root.x -= vec_x*g_SunRadius*PLANET_ORBIT_COEF*g_root.scale;
        g_root.y -= vec_y*g_SunRadius*PLANET_ORBIT_COEF*g_root.scale;
    }
    else {
        var vec_x = g_SunRadius*PLANET_ORBIT_COEF-g_SunRadius*SUN_SCROLL_X_COEF;
        var vec_y = data.values.position*g_SunRadius*PLANET_SCROLL_COEF;
        g_root.x -= vec_x*g_root.scale;
        g_root.y -= (vec_y+g_root.cy)*g_root.scale;
    }

    //console.log(data.values.parent.select("#target-"+data.values.back.name).selectAll("circle"));
    // data.values.back.values.this.select("g[target='target-"+data.values.back.id+"']").transition()
    data.values.back.values.picture.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .style("opacity", 0)
    if(ORBIT_PATTERN) data.values.picture.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .attr("transform","rotate("+(-g_root.deg)+")")
    data.values.shader.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .style("opacity", 0)
    data.values.back.values.text.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .style("opacity", 0)
    data.values.text.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .attr("text-anchor","middle")
        .attr("transform","translate("+(-g_SunRadius/PLANET_SCROLL_TEXT)+")");
    data.values.back.values.children.selectAll("g.planet").each(function(d){
        // console.log(data.values.this[0] == d.values.this[0]);
        // if(d3.select(this).attr("id") && data.values.this.attr("id") != d3.select(this).attr("id")) {
        if(data.values.this[0] != d.values.this[0]) {
            //console.log(data.values.this , d3.select(this));
            d3.select(this).transition()
                .ease("linear")
                .duration(ORBIT_ANIM_MOVE)
                .style("opacity", 0)
        }
        // if(data.values.this.attr("id") == d3.select(this).attr("id")){
        else {
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


function AnimateUniverse() {
    g_root.universe.select("g.star").each(AnimateStar);
    // g_root.scale = g_root.scale_old;
    // globZoom.scale(g_root.scale_old);
    // var offsetX =  g_root.scale*(g_root.x - g_project.width_h) ;
    // var offsetY =  g_root.scale*(g_root.y - g_project.height_h) ;
    // g_root.width = g_project.width_h + offsetX ;
    // g_root.height = g_project.height_h + offsetY ;
    //.log(parseFloat(g_PatternPlanet.attr("x")));

    if(ORBIT_PATTERN){
        g_project.rotate += ORBIT_ROT_SCALE/100*g_project.speed_scale;
        if(g_project.rotate > 0) g_project.rotate = -ORBIT_ROT_CICLE;
        g_PatternSun.attr("x", g_project.rotate);
        g_PatternPlanet.attr("x", g_project.rotate);
    }

    if(g_project.skip != false || g_project.warp){
        g_root.universe.transition()
            .duration(1)
            .attr("transform","translate("+(g_root.x)+","+(g_root.y)+"), scale("+(g_root.scale)+")") //, rotate("+(g_root.deg)+")")
        if(!g_project.warp) {
            //console.log(g_project.skip.values.back)
            AddPath(g_project.skip.values.back);
            g_project.skip.values.parent.remove()
            CreateSpace([g_project.skip]);
            g_project.warp = 2;
            g_project.skip = false;
        }
        else g_project.warp--;
    }
    else{
        g_root.universe.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform","translate("+(g_root.x)+","+(g_root.y)+"), scale("+(g_root.scale)+")") //, rotate("+(g_root.deg)+")")
    }
}

function AnimateStar(data) {
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

    g_root.universe = SVG.append("g")
        .attr("id","Universe")
        .attr("transform","translate("+(g_root.x)+","+(g_root.y)+"),"+"scale("+(g_root.scale)+")")
        .call(globDrag)
        .call(globZoom);

    g_root.universe.append("circle")
        .attr("id", "Touch")
        .attr("r", g_TouchRadius);

    CreateSpace(data);

    d3.timer(function(elapsed) {
        AnimateUniverse();

        if ($(DASHBOARD).width() != g_project.width || $(DASHBOARD).height() != g_project.height){
            WindowResize();
        }
    });
}
