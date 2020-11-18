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
        .style("text-anchor","middle")
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

function GetWarp(data){
    if(!g_project.warp) {
        //console.log(g_root.universe.data)
        //console.log(g_project.skip, g_project.search,g_project.paths)
        if(!g_project.search)
            switch(g_root.universe.data.overlay_type){
                case "search": 
                case "ic": AddPath(g_project.skip.values.back); break;
                default: break;
            }
        else{
            //console.log(g_project.skip, g_project.search,g_project.paths)
            // if(g_project.skip.overlay_type == "ic" && g_project.search.overlay_type == "search_target"){
            //     console.log(1)
            //     g_project.paths = g_project.skip.paths_path.this;
            //     g_project.skip.paths_path.child.selectAll("g").remove();
            // }
            
            // if (g_project.skip.overlay_type == "search_target") AddPath(g_project.search);
            if (data) g_project.skip = g_project.search;
            else g_project.search = g_project.skip;
            g_root.universe.data = g_project.search;
            
        }
        if(g_project.overlay) {
            g_project.overlay.remove();
            g_project.overlay = false;
        }
        
        if (g_project.skip) g_project.skip.values.parent.remove()
        if (data) g_project.skip = data;
        
        //console.log(g_project.skip, g_project.search,g_project.paths)
        switch(g_root.universe.data.overlay_type){
            case "user": UserActivity(g_project.skip); break;
            case "ic": CreateSpace(g_project.skip); break;
            case "project": WrapGetProject(g_project.skip); break;
            case "market": WrapGetMarket(g_project.skip); break;
            case "search": CreateSpace(g_project.skip); break; // TODO 
            case "search_target": SearchOpen(g_project.skip); break; // TODO 
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

    if(g_project.hist_path)
        g_project.hist_path.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform","translate("+(g_project.width)+","+(g_PathRadius*HISTORY_ORBIT_COEF)+")")
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
            //var rot_x  = Math.cos((g_root.deg+data.values.rotation)/180*Math.PI);
            // var anchor =  (rot_x > 0.2) ? "start" : (rot_x > -0.2 ) ? "middle" : "end";
            //var anchor =  (rot_x > 0) ? "start" : "end";
            //var anchor = "middle";
            var pos =  0; //rot_x*TEXT_MOVE_COEF*data.values.text_len;
            //data.values.text.selectAll("text").style("text-anchor", anchor)
            data.values.text.transition()
                .ease("linear")
                .duration(ORBIT_ANIM_MOVE)
                .attr("transform","rotate("+(-g_root.deg)+"), translate("+(pos)+")")

            if (data.overlay)
                data.overlay.object.transition()
                    .ease("linear")
                    .duration(ORBIT_ANIM_MOVE)
                    .attr("transform","rotate("+(-g_root.deg)+")")

            if (data.values.checked)
                data.values.checked.transition()
                    .ease("linear")
                    .duration(ORBIT_ANIM_MOVE)
                    .attr("transform","rotate("+(-g_root.deg)+"), translate(0,"+(-g_PlanetRadius)+")")
        });
    }
}