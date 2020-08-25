
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
        .style("opacity", 0) // must - old not deleted yet
        .transition() // must - old not deleted yet
        .delay(100) // must - old not deleted yet
        .style("opacity", 100) // must - old not deleted yet
        .each(function(d){AddSun(d3.select(this), d);});
}

function AddSun(obj, data){
    data.box = {...g_box};
    data.values = {};
    data.values.this = obj;
    data.values.rotation = 1;

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

    data.values.object = data.values.this.append("g").attr("class", "object");

    data.values.picture = data.values.object.append("circle")
        .attr("class", "pattern")
        .attr("r", g_SunRadius)
        .on("mouseover",function(d){
            data.values.text.style("opacity", 0);
            if(!g_project.overlay && g_root.zoom) OverlayCreate(d3.select(this), d, data);
        })
        .on("mousedown",function(d){
            ClickStart(function(data){
                // TODO: action menu
                // OverlayCreate(data);
            }, data);
        })
        .on("mouseup",function(d){
            ClickStop(function(data){
                // NONE
            }, data);
        });

    AddText(data);

    if(data.sub_folders){
        data.values.children.selectAll("g")
            .data(data.sub_folders)
            .enter()
            .append("g")
            .attr("class","planet")
            .each(function(d, i){AddChildren(d3.select(this), d, data, i);});
    }

    // data.values.select = data.values.this.append("circle")
    //     .attr("class","select")
    //     .attr("cx", 0)
    //     .attr("cy", 0)
    //     .attr("r", g_SunRadius)
    //     .on("mouseover",function(d){
    //         OverlayCreate(data);
    //     })
    //     .on("mousedown",function(d){
    //         ClickStart(function(data){
    //             // TODO: action menu
    //             // OverlayCreate(data);
    //         }, data);
    //     })
    //     .on("mouseup",function(d){
    //         ClickStop(function(data){
    //             // NONE
    //         }, data);
    //     });
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

    data.values.object = data.values.this.append("g").attr("class", "object");

    data.values.picture = data.values.object.append("circle")
        .attr("class", "pattern_planet")
        .attr("r", g_PlanetRadius);

    data.values.shader = data.values.object.append("circle")
        .attr("class", "shader")
        .attr("r", g_PlanetRadius)
        .attr("transform","rotate("+((g_root.slider)?0:data.values.rotation)+")");

    AddText(data);
    if(g_root.slider) {
        data.values.text.selectAll("text")
            .attr("text-anchor","left")
            .attr("transform","translate("+(g_SunRadius/PLANET_SCROLL_TEXT)+")");
    }

    data.values.select = data.values.this.append("circle")
        .attr("class","select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_PlanetRadius)
        .on("mousedown",function(d){
            ClickStart(function(data){
                // TODO: action menu
            }, data);
        })
        .on("mouseup",function(d){
            ClickStop(SunFadeout, data);
        });
}

// -------------------------------------------------------

function AddText(data, fix=false) {
    var newobj = data.values;
    //console.log(obj)
    newobj.text = newobj.object.append("g")
        .attr("class", "text")
    newobj.text.append("text")
        .attr("class", "text_back")
        .attr("x",0)
        .attr("y",0)
        .attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        .html(data.name);
    newobj.text.append("text")
        .attr("class", "text_front")
        .attr("x",0)
        .attr("y",0)
        .attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        .html(data.name);
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
    if(g_root.slider) data.values.text.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .attr("text-anchor","middle")
        .attr("transform","translate("+(-g_SunRadius/PLANET_SCROLL_TEXT)+")");
    data.values.back.values.children.selectAll("g.planet").each(function(d){
        if(data.values.this[0] != d.values.this[0]) {
            d3.select(this).transition()
                .ease("linear")
                .duration(ORBIT_ANIM_MOVE)
                .style("opacity", 0)
        }
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
            AddPath(g_project.skip.values.back);
            if(g_project.overlay) {
                g_project.overlay.remove();
                g_project.overlay = false;
            }
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

// -------------------------------------------------------

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

// -------------------------------------------------------
