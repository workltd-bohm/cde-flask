
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

    g_project.overlay = false;

    // g_project.project_position = data.path;

    g_root.universe.selectAll("g")
        .data([data])
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

    data.values.children = data.values.this.append("g").attr("class", "star child");

    data.values.object = data.values.this.append("g").attr("class", "star object");

    data.values.picture = data.values.object.append("circle")
        .attr("class", "star pattern")
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

    AddText(data, "star");

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

    data.values.object = data.values.this.append("g").attr("class", "planet object");

    data.values.picture = data.values.object.append("circle")
        .attr("class", "planet pattern")
        .attr("r", g_PlanetRadius);
    if (data.color) data.values.picture.style("fill", data.color)

    data.values.shader = data.values.object.append("circle")
        .attr("class", "planet shader")
        .attr("r", g_PlanetRadius)
        .attr("transform","rotate("+((g_root.slider)?0:data.values.rotation)+")");

    AddText(data, "planet");
    if(g_root.slider) {
        data.values.text.selectAll("text")
            .attr("text-anchor","left")
            .attr("transform","translate("+(g_SunRadius/PLANET_SCROLL_TEXT)+")");
    }

    data.values.select = data.values.this.append("circle")
        .attr("class","planet select")
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

function AddTspan(target, newobj, text){
    // TEXT_SUN_SCALE TEXT_MAX_LENGHT
    var slice = ((text.length/TEXT_MAX_LENGHT) | 0); // + 1;
    newobj.text_len = (slice > 0) ? TEXT_MAX_LENGHT : newobj.text_len;
    var spacing = parseFloat($(target.node()).css("fontSize"));
    for(var i = 0; i <= slice; i++){
        target.append("tspan")
        .attr('x', 0)
        .attr('y', (i-(slice)/2)*spacing) //TEXT_SPACING)
        .html(text.slice(i*TEXT_MAX_LENGHT, (i+1)*TEXT_MAX_LENGHT))
    }
}

function AddText(data, cls="", fix=false) {
    var newobj = data.values;
    var newName = data.name;
    if(data.type){
        newName = data.name + data.type
    }
    newobj.text_len = newName.length;
    newobj.text = newobj.object.append("g")
        .attr("class", cls+" text")
    var tmp = newobj.text.append("text")
        .attr("class", cls+" text_back")
        .attr("x",0)
        .attr("y",0)
        //.attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        //.html(newName);
    AddTspan(tmp, newobj, newName);
    tmp = newobj.text.append("text")
        .attr("class", cls+" text_front")
        .attr("x",0)
        .attr("y",0)
        //.attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        //.html(newName);
    AddTspan(tmp, newobj, newName);
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
    // if(g_root.slider) 
    data.values.text.transition()
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

function GetWarp(){
    if(!g_project.warp) {
        g_root.universe.data.overlay_type == "ic" ? AddPath(g_project.skip.values.back) : 1;
        if(g_project.overlay) {
            g_project.overlay.remove();
            g_project.overlay = false;
        }
        
        g_project.skip.values.parent.remove()

        switch(g_root.universe.data.overlay_type){
            case "ic": CreateSpace(g_project.skip); break;
            case "project": WrapGetProject(g_project.skip); break;
            case "market": WrapGetMarket(g_project.skip); break;
            default : CreateSpace(g_project.skip); break;
        }

        g_project.warp = ORBIT_ANIM_RESET_SKIP;
        g_project.skip = false;
    }
    else g_project.warp--;
}

// -------------------------------------------------------


function AnimateUniverse() {
    g_root.universe.select("g.star").each(AnimateStar);

    if(ORBIT_PATTERN && ORBIT_PATTERN_ANIM){
        g_root.rotate += ORBIT_ROT_SCALE/100*g_project.speed_scale;
        if(g_root.rotate > 0) g_root.rotate = -ORBIT_ROT_CICLE;
        g_PatternSun.attr("x", g_root.rotate);
        g_PatternPlanet.attr("x", g_root.rotate);
    }

    if(g_project.skip != false || g_project.warp){
        g_root.universe.transition()
            .duration(1)
            .attr("transform","translate("+(g_root.x)+","+(g_root.y)+"), scale("+(g_root.scale)+")") //, rotate("+(g_root.deg)+")")
        GetWarp();
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
            var rot_x  = Math.cos((g_root.deg+data.values.rotation)/180*Math.PI);
            var anchor =  (rot_x > 0.2) ? "start" : (rot_x > -0.2 ) ? "middle" : "end";
            var pos =  rot_x*TEXT_MOVE_COEF*data.values.text_len;
            data.values.text.selectAll("text").style("text-anchor", anchor)
            data.values.text.transition()
                .ease("linear")
                .duration(ORBIT_ANIM_MOVE)
                .attr("transform","rotate("+(-g_root.deg)+"), translate("+(pos)+")")
        });
    }
}

// -------------------------------------------------------

function RecursiveFileSearch(back, data){
    var found = false;
    // console.log(data.parent_id +"  "+ data.ic_id, data.sub_folders.length)
    if ((data.parent_id == SESSION["position"]["parent_id"]) &&
        (data.ic_id == SESSION["position"]["ic_id"])){
        return [[], data];
    }
    else if (data.sub_folders && data.sub_folders.length > 0){
        for (var elem of data.sub_folders){
            found = RecursiveFileSearch(data, elem);
            if (found) {
                found[0].push(data);
                break;
            }
        }
    }
    if (!found) {
        if (data.ic_id == SESSION["position"]["parent_id"]){
            return [[], data];
        }
    }
    return found;
}

function ProjectPosiotionSet(data){
    // console.log(SESSION["position"])
    var found = false;
    if(SESSION["position"]){
        found = RecursiveFileSearch(data, data);
        if (found) {
            var path = found[0].reverse()
            //console.log(path);
            for (var add of path){
                add.box = {...g_box};
                add.values = {...add.values};
                AddPath(add);
            }
        }
    }
    //console.log(found)
    CreateSpace(found ? found[1] : data);
}

function DashboardCreate(data, project_position=null) {

    WindowResize();

    g_root.universe = SVG.append("g")
        .attr("id","Universe")
        .attr("transform","translate("+(g_root.x)+","+(g_root.y)+"),"+"scale("+(g_root.scale)+")")
        .call(globDrag)
        .call(globZoom);

    g_root.universe.append("circle")
        .attr("id", "Touch")
        .attr("r", g_TouchRadius);

    g_root.universe.data = data[0];
    //g_project.project_position = project_position;

    PathCreation(data);

    ProjectPosiotionSet(g_root.universe.data);

    d3.timer(function(elapsed) {
        if(g_root.universe) AnimateUniverse();
        else return;

        if ($($DASHBOARD).width() != g_project.width || $($DASHBOARD).height() != g_project.height){
            WindowResize();
        }
    });
}

// -------------------------------------------------------
