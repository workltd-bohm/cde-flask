function SunFadeout(data) {
    g_root.zoom = false;
    g_root.scale_old = g_root.scale;
    g_root.scale *= PLANET_SUN_RATIO;

    var orbit = (g_SunRadius + (g_project.height_h - g_SunRadius) / 2) * g_root.scale;
    if (!g_root.slider) {
        var vec_x = Math.cos((g_root.deg - data.values.rotation) / 180 * Math.PI);
        var vec_y = Math.sin((g_root.deg - data.values.rotation) / 180 * Math.PI);
        //console.log(orbit, g_SunRadius, g_project.height_h, ORBIT_SCROLL_COEF) 
        //console.log(g_root.cx, vec_x * orbit, g_root.cy, vec_y * orbit)
        g_root.x -= vec_x * orbit;
        g_root.y -= vec_y * orbit;
    } else {
        //// [SLIDER START]
        // var vec_x = g_SunRadius * PLANET_ORBIT_COEF - g_SunRadius * SUN_SCROLL_X_COEF;
        // var vec_y = data.values.position * g_SunRadius * PLANET_SCROLL_COEF * SUN_SCROLL_Y_COEF;
        // g_root.x -= (vec_x + g_root.cx) * g_root.scale;
        // g_root.y -= (vec_y + g_root.cy) * g_root.scale;
        //// [SLIDER OLD/NEW]
        var vec_x = Math.cos((g_root.deg - data.values.rotation) / 180 * Math.PI);
        var vec_y = Math.sin((g_root.deg - data.values.rotation) / 180 * Math.PI);

        orbit *= ORBIT_SCROLL_COEF;
        //console.log(orbit, g_SunRadius, g_project.height_h, ORBIT_SCROLL_COEF) 
        //console.log(g_root.cx, vec_x * orbit, g_root.cy, vec_y * orbit)
        g_root.x -= g_root.cx * SUN_SCROLL_ANIM_FIX + vec_x * orbit;
        g_root.y -= g_root.cy * SUN_SCROLL_ANIM_FIX + vec_y * orbit;
        //// [SLIDER END]
    }

    // Animate shaders
    // data.values.back.values.effect.transition()
    //     .ease("linear")
    //     .duration(ORBIT_ANIM_MOVE)
    //     .style("opacity", 0)
    data.values.back.values.background.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .style("opacity", 0)
    data.values.back.values.picture.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .style("opacity", 0)
    // data.values.back.values.shader.transition()
    //     .ease("linear")
    //     .duration(ORBIT_ANIM_MOVE)
    //     .style("opacity", 0)
    // data.values.back.values.gloss.transition()
    //     .ease("linear")
    //     .duration(ORBIT_ANIM_MOVE)
    //     .style("opacity", 0)
    if (ORBIT_PATTERN) data.values.picture.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .attr("transform", "rotate(" + (-g_root.deg) + ")")
        // data.values.shader.transition()
        //     .ease("linear")
        //     .duration(ORBIT_ANIM_MOVE)
        //     .style("opacity", 0)
        // data.values.gloss.transition()
        //     .ease("linear")
        //     .duration(ORBIT_ANIM_MOVE)
        //     .style("opacity", 0)
    data.values.back.values.text.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .style("opacity", 0)
    if(g_root.slider) g_root.looper.this.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .style("opacity", 0)
    data.values.text.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + (-g_SunRadius / PLANET_SCROLL_TEXT) + ")");
    data.values.back.values.children.selectAll("g.planet").each(function(d) {
        if (data.values.this[0] != d.values.this[0]) {
            d3.select(this).transition()
                .ease("linear")
                .duration(ORBIT_ANIM_MOVE)
                .style("opacity", 0)
        } else {
            d3.select(this).transition()
                .ease("linear")
                .duration(ORBIT_ANIM_RESET)
                .each("end", function() {
                    g_project.skip = data;
                })
        }
    });

    d3.select("#planet-orbit").transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .style("opacity", 0)

    if (g_project.overlay) {
        g_project.overlay.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_RESET)
            .style("opacity", 0)
    }
    if (g_project.move) {
        g_project.move.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_RESET)
            .style("opacity", 0)
    }
}

function GetWarp(data) {
    if (!g_project.warp) {
        //console.log(g_project.data)
        //console.log(g_project.skip, g_project.search,g_project.paths)
        if (!g_project.search)
            switch (g_project.data.overlay_type) {
                case "search":
                case "ic":
                    // AddPath(g_project.skip.values.back); remove old path
                    break;
                default:
                    break;
            }
        else {
            //console.log(g_project.skip, g_project.search,g_project.paths)
            // if(g_project.skip.overlay_type == "ic" && g_project.search.overlay_type == "search_target"){
            //     console.log(1)
            //     g_project.paths = g_project.skip.paths_path.this;
            //     g_project.skip.paths_path.child.selectAll("g").remove();
            // }

            // if (g_project.skip.overlay_type == "search_target") AddPath(g_project.search);
            if (data) g_project.skip = g_project.search;
            else g_project.search = g_project.skip;
            g_project.data = g_project.search;
            console.log("check")

        }
        if (g_project.overlay) {
            g_project.overlay.remove();
            g_project.overlay = false;
        }
        
        // remove star dom
        if (g_project.skip) ClearSpace();

        if (data) g_project.skip = data;

        // console.log(g_project.skip, g_project.search, g_project.paths)
        console.log(g_project.data.overlay_type);
        switch (g_project.data.overlay_type) {
            case "user":
                UserActivity(g_project.skip);
                break;
            case "ic":
                CreateWorkspace(g_project.skip);
                break;
            case "project_root":
                backButtonFlag = false;
                WrapGetProject(g_project.skip);
                break;
            case "market":
                WrapGetMarket(g_project.skip);
                break;
            case "search":
                CreateWorkspace(g_project.skip);
                break; // TODO 
            case "search_target":
                SearchOpen(g_project.skip);
                break; // TODO 
            default:
                CreateWorkspace(g_project.skip);
                break;
        }

        g_project.warp = ORBIT_ANIM_RESET_SKIP;
        g_project.skip = false;
    } else g_project.warp--;
}

// -------------------------------------------------------

function AnimateScrollSun(data){
    if (g_root.deg_exp >= 0) {
        g_project.spiral_info.spiral_position = (g_root.deg + (360 * g_root.deg_exp)) % g_project.spiral_info.spiral_length;
    }
    else {
        g_project.spiral_info.spiral_position = 
            (g_root.deg + Math.abs(g_project.spiral_info.spiral_length + (360 * g_root.deg_exp) % g_project.spiral_info.spiral_length))
            % g_project.spiral_info.spiral_length;
    }
    g_project.spiral_info.spiral_position += PLANET_SCROLL_DEG_OFF;
}

function AnimateScrollPlanet(data){
    var dist_ratio = 
        Math.min(Math.abs(g_project.spiral_info.spiral_position - data.values.rotation - g_project.spiral_info.spiral_length), 
        Math.abs(g_project.spiral_info.spiral_position - data.values.rotation + g_project.spiral_info.spiral_length));
    dist_ratio = Math.min(Math.abs(g_project.spiral_info.spiral_position - data.values.rotation), dist_ratio);
    var planet_opacity = (g_project.spiral_info.planet_distance * g_project.spiral_info.planet_number > dist_ratio) ? 1 : 0;
    //console.log(data.values.position, g_project.spiral_info.planet_distance, spiral_position, Math.abs(spiral_position - data.values.rotation), planet_opacity)

    if(!planet_opacity) data.values.this.style("display", "none");
     else data.values.this.style("display", "block");
}

function UpdateUniverse() {
    if (g_view === VIEW_GR) return;// todo remove
    
    g_root.universe.select("g.star").each(AnimateStar);

    if (ORBIT_PATTERN && ORBIT_PATTERN_ANIM) {
        g_root.rotate += ORBIT_ROT_SCALE / 100 * g_project.speed_scale;
        if (g_root.rotate > 0) g_root.rotate = -ORBIT_ROT_CICLE;
        g_PatternSun.attr("x", g_root.rotate);
        g_PatternPlanet.attr("x", g_root.rotate);
    }

    if (g_project.skip != false || g_project.warp) {
        g_root.looper.transition()
            .duration(1)
            .attr("transform", "translate(" + (g_root.x) + "," + (g_root.y) + ")," + "scale(" + (g_root.scale) + ")")
        g_root.universe.transition()
            .duration(1)
            .attr("transform", "translate(" + (g_root.x) + "," + (g_root.y) + "), scale(" + (g_root.scale) + ")") //, rotate("+(g_root.deg)+")")
        GetWarp();
    } else {
        g_root.looper.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "translate(" + (g_root.x) + "," + (g_root.y) + ")," + "scale(" + (g_root.scale) + ")")
        g_root.universe.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "translate(" + (g_root.x) + "," + (g_root.y) + "), scale(" + (g_root.scale) + ")") //, rotate("+(g_root.deg)+")")
    }

    g_root.looper.x = g_project.width_h/g_project.spiral_info.spiral_length*(g_project.spiral_info.spiral_position);
    if(!g_root.looper.x) g_root.looper.x = 0;
    if (g_root.looper.pos)
        g_root.looper.pos
            .attr("transform", "translate(" + (g_root.looper.x) + ", 0)")
    if (g_root.looper.posL)
        g_root.looper.posL
            .attr("transform", "translate(" + (g_root.looper.x) + ", 0)")
    if (g_root.looper.posR)
        g_root.looper.posR
            .attr("transform", "translate(" + (g_root.looper.x) + ", 0)")

    if (g_project.hist_path)
        g_project.hist_path.transition()
        .ease("linear")
        .duration(ORBIT_ANIM_MOVE)
        .attr("transform", "translate(" + (g_project.width) + "," + (g_PathRadius * HISTORY_ORBIT_COEF) + ")")

    // position display name
    if (g_project.display_name)
        g_project.display_name
            .attr("transform", "translate(" + (g_root.x) + ", " + (g_root.y + g_project.height_h - g_PathRadius * PATH_ORBIT_COEF) + ")");
}

function AnimateStar(data) {
    AnimatePlanet(data);
}

function AnimatePlanet(data) {
    if (g_root.slider) {
        //// [SLIDER START]
        // if (1) {
        //     data.values.children.transition()
        //         .ease("linear")
        //         .duration(ORBIT_ANIM_MOVE_SCROLL)
        //         .attr("transform", "translate(0," + (g_root.cy) + ")");
        // }
        //// [SLIDER OLD/NEW]
        data.values.children.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "rotate(" + (g_root.deg) + ")");

        AnimateScrollSun(data);

        //console.log(g_project.spiral_info.spiral_position, g_root.deg_exp, g_root.deg, g_project.spiral_info.spiral_length, g_project.spiral_info.planet_distance)
        data.values.children.selectAll("g.planet").each(function(data) {
            //var rot_x  = Math.cos((g_root.deg+data.values.rotation)/180*Math.PI);
            // var anchor =  (rot_x > 0.2) ? "start" : (rot_x > -0.2 ) ? "middle" : "end";
            //var anchor =  (rot_x > 0) ? "start" : "end";
            //var anchor = "middle";
            var pos = 0; //rot_x*TEXT_MOVE_COEF*data.values.text_len;
            //data.values.text.selectAll("text").style("text-anchor", anchor)

            AnimateScrollPlanet(data);

            data.values.text.transition()
                    .ease("linear")
                    .duration(ORBIT_ANIM_MOVE)
                    .attr("transform", "rotate(" + (-g_root.deg) + "), translate(" + (pos) + ")")

            if (data.overlay)
                data.overlay.object.transition()
                .ease("linear")
                .duration(ORBIT_ANIM_MOVE)
                .attr("transform", "rotate(" + (-g_root.deg) + ")")

            if (data.values.checked)
                data.values.checked.transition()
                .ease("linear")
                .duration(ORBIT_ANIM_MOVE)
                .attr("transform", "rotate(" + (-g_root.deg) + "), translate(0," + (-(g_PlanetRadius - g_OverlayItemSize / 1.5)) + ")")
        });
        //// [SLIDER END]
    } else {
        data.values.children.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "rotate(" + (g_root.deg) + ")");

        data.values.children.selectAll("g.planet").each(function(data) {
            //var rot_x  = Math.cos((g_root.deg+data.values.rotation)/180*Math.PI);
            // var anchor =  (rot_x > 0.2) ? "start" : (rot_x > -0.2 ) ? "middle" : "end";
            //var anchor =  (rot_x > 0) ? "start" : "end";
            //var anchor = "middle";
            var pos = 0; //rot_x*TEXT_MOVE_COEF*data.values.text_len;
            //data.values.text.selectAll("text").style("text-anchor", anchor)
            data.values.text.transition()
                .ease("linear")
                .duration(ORBIT_ANIM_MOVE)
                .attr("transform", "rotate(" + (-g_root.deg) + "), translate(" + (pos) + ")")

            if (data.overlay)
                data.overlay.object.transition()
                .ease("linear")
                .duration(ORBIT_ANIM_MOVE)
                .attr("transform", "rotate(" + (-g_root.deg) + ")")

            if (data.values.checked)
                data.values.checked.transition()
                .ease("linear")
                .duration(ORBIT_ANIM_MOVE)
                .attr("transform", "rotate(" + (-g_root.deg) + "), translate(0," + (-(g_PlanetRadius - g_OverlayItemSize / 1.5)) + ")")
        });
    }
}