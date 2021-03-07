// -------------------------------------------------------

function CreateSpace(data) {
    // cache
    g_root.x = g_project.width_h;
    g_root.y = g_project.height_h;
    g_root.scale = g_root.scale_old;
    g_root.cy_min = g_root.cy = -g_project.height_h / 2;
    g_root.cy_max = g_root.cy_min;
    g_root.deg = g_root.rad = g_root.rad_diff = g_root.deg_exp = 0;
    g_root.zoom = true;
    if (g_root.slider) g_SunRadius *= SUN_SCROLL_ZOOM;
    if (g_root.slider) g_PlanetRadius *= PLANET_SCROLL_ZOOM;
    //g_PlanetRadius = g_PlanetRadius_old;
    g_root.slider = false;
    if (g_root.looper.this) g_root.looper.this.remove();
    g_root.looper.this = false;
    g_project.current_ic = data;

    // clear instances
    if (g_project.overlay) {
        g_project.overlay.remove();
        g_project.overlay = false;
    }

    if (g_project.selection) {
        g_project.selection.remove();
        g_project.selection = false;
    }

    ClearDisplayName();

    switch (data.overlay_type) {
        case "ic":
            SendProject(data);
            break;
        case "post_ic":
            EditPost(data, data.ic_id);
            break;
        case "bid_ic":
            ViewPost(data, data.ic_id);
            break;
        case "all_post_ic":
            ViewPost(data, data.ic_id);
            break;
        default:
            break;
    }

    // g_project.data.overlay_type == "ic" ? SendProject(data) : 1;
    CHECKED = {};

    // create sun
    g_root.universe.selectAll("g")
        .data([data])
        .enter()
        .append("g")
        .attr("class", "star dom")
        .style("opacity", 0) // must - old not deleted yet
        .transition() // must - old not deleted yet
        .delay(100) // must - old not deleted yet
        .style("opacity", 100) // must - old not deleted yet
        .each(function(d) { AddSun(d3.select(this), d); });

    // add path to a top bar TODO store in a function
    if (SESSION.position) {
        found = RecursiveFileSearch(g_project.data, g_project.data);
        if (found) {
            $(".info-path-text").empty();
            var path = found[0].reverse();

            for (let add of path) {
                add.box = {...g_box };
                add.values = {...add.values };

                let span = document.createElement("span");
                span.className = "path-link";
                span.textContent = add.name;

                span.onclick = function() {
                    if (g_project.search /*&& g_project.search.overlay_type == "ic"*/ ) g_project.search = false;
                    add.paths_path = {}
                    add.paths_path.back = g_project.paths;
                    g_project.paths = add.paths_path.back;
                    g_project.hist_path_len = add.paths_path.start;
                    CreateWorkspace(add);
                }

                $(".info-path-text").append(span);

                let slash = document.createElement("span");
                slash.className = "mx-2";
                slash.textContent = "/";
                $(".info-path-text").append(slash);
            }
        }
    }
}

function AddSun(obj, data) {
    data.box = {...g_box };
    data.values = {};
    data.values.this = obj;
    data.values.parent = obj;
    data.values.back = data;
    data.values.data = data;
    data.values.rotation = 1;
    data.values.sun = true;

    data.overlay_type == "ic" ? WrapOpenFile(data, false) : 1;

    data.id = data.ic_id; // .replace(/[\/.]/g, "-");
    //data.par_id = parent.ic_id.replace(/\//g,"-");

    if (data.sub_folders) {
        // Scaling planets (middle option)
        // g_PlanetRadius_old = g_PlanetRadius;
        // if (data.sub_folders.length >= PLANET_MAX_NUMBER_MIN && data.sub_folders.length < PLANET_MAX_NUMBER_MAX) {
        //     g_PlanetRadius /= (data.sub_folders.length + 1) / PLANET_MAX_NUMBER_MIN;
        // } else 
        if (data.sub_folders.length > PLANET_MAX_NUMBER_MAX) {
            g_root.slider = true;
            g_SunRadius /= SUN_SCROLL_ZOOM;
            g_PlanetRadius /= PLANET_SCROLL_ZOOM;
            g_root.cy_max = -(data.sub_folders.length - 2) * (g_PlanetRadius * 2) * PLANET_SCROLL_COEF;
        }
    }

    //// [SLIDER START]
    if (g_root.slider) {
        var deg_min = (360 / PLANET_MAX_NUMBER_MAX);
        var max_size_coef = Math.trunc(data.sub_folders.length / PLANET_MAX_NUMBER_MAX) + 1;
        var deg_max_wanted = max_size_coef * 360;
        var deg_max_curr = data.sub_folders.length * deg_min;
        var deg_adjust = (deg_max_wanted - deg_max_curr) / data.sub_folders.length;
        g_project.spiral_info.planet_distance = deg_min + deg_adjust;
        g_project.spiral_info.planet_number = (data.sub_folders.length < 15) ? 3 : 4;
        g_project.spiral_info.planet_number_max = data.sub_folders.length;
        g_project.spiral_info.spiral_length = g_project.spiral_info.planet_number_max * g_project.spiral_info.planet_distance;
    }
    //// [SLIDER END]

    data.values.this.attr("id", "obj-" + data.id);

    if (g_root.slider) {
        g_root.cx = (-g_SunRadius * SUN_SCROLL_X_COEF);
        g_root.cy = (-g_SunRadius * SUN_SCROLL_Y_COEF);
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "translate(" + g_root.cx + ", " + g_root.cy + ")"); //, scale("+(SUN_SCROLL_SIZE_COEF)+")");
    }
    //console.log(g_root.x, g_root.cx, g_root.y, g_root.cy)
    //Milos commented this out on 14.01.2021
    // data.values.effect = data.values.this.append("circle")
    //     .attr("class", "star effect")
    //     .attr("r", g_SunRadius * SUN_BG_RATIO);

    data.values.children = data.values.this.append("g").attr("class", "star child");

    data.values.object = data.values.this.append("g").attr("class", "star object");

    // Shaders start
    data.values.background = data.values.object.append("circle")
        .attr("class", "star background")
        .attr("r", g_SunRadius)
        .style("fill", data.color);

    data.values.picture = data.values.object.append("circle")
        .attr("class", "star pattern")
        .attr("r", g_SunRadius)

    
    data.values.select = data.values.this.append("circle")
    .attr("class", "star select")
    .attr("r", 0)
    .on("mouseenter", function(d) {
        if (!g_project.move && g_root.zoom) 
        {
            // OverlayDestroy();
            // OverlayCreate(d3.select(this), d, data);
        }
        SetDisplayName(data.name);
    })
    .on("mouseleave", function () {
        ClearDisplayName();
    })
    .on("contextmenu", function(d){
        CreateContextMenu(d3.event, d);
    });    

    // add name to the sun
    AddText(data, "star");

    // Gets overlay type
    let overlay_type = GetContextType(data);
    data.values.overlay = data.values.object
        .append("g")
        .attr("class", "overlay-menu")
        .on("mouseenter", function(d) {
            if (!g_project.move && g_root.zoom) 
            {
                // OverlayDestroy();
                // OverlayCreate(d3.select(this), d, data);
            }
            SetDisplayName(data.name);
        })
        .on("mouseleave", function () {
            ClearDisplayName();
        })
        .on("contextmenu", function(d){
            CreateContextMenu(d3.event, data);
        });
        
    data.values.overlay.append("circle")
        .attr("r", g_SunRadius)
        .attr("fill", "transparent");

    let menu_items = data.values.overlay.append("g")
        .attr("class", "overlay-menu-items");

    menu_items.selectAll("g.overlay-menu-items")
        .data(overlay_type)
        .enter()
        .append("foreignObject")
        .each(function(d, i){
            // calculate position
            let rot = i * 360 / overlay_type.length - 90;
            let len = g_SunRadius - g_OverlayItemSize;
            let pos = {};
            pos.x = Math.cos(rot * Math.PI / 180) * len;
            pos.y = Math.sin(rot * Math.PI / 180) * len;

            g_OverlayItemSize = 28;
            d3.select(this)
                // center object
                .attr("x", -g_OverlayItemSize / 2)
                .attr("y", -g_OverlayItemSize / 2)
                .attr("width", g_OverlayItemSize)
                .attr("height", g_OverlayItemSize)
                .style("overflow", "visible")
                // place around circle
                .attr("transform", "translate(" + (pos.x) + ", " + (pos.y) + ")")
                    .append("xhtml:i")
                    .attr("class", "material-icons")
                    .attr("title", d.name)
                    .style("font-size", g_OverlayItemSize + "px")
                    .style("color", data.color ? FlipColor(data.color) : "#303030")
                    // icon
                    .text(d.icon)
                    // function    
                    .on("click", function(){
                        d.link(data);
                    });
        });

    // data.values.shader = data.values.object.append("circle")
    //     .attr("class", "star shader")
    //     .attr("r", g_SunRadius)

    // data.values.gloss = data.values.object.append("circle")
    //     .attr("class", "star gloss")
    //     .attr("r", g_SunRadius)
    // Shaders end
        
    //// [SLIDER START]
    if (g_root.slider) {
        data.values.object.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "translate(" + (-g_SunRadius * SUN_SCROLL_X_SUN_OFFS) + ", " + (-g_SunRadius * SUN_SCROLL_Y_SUN_OFFS) + ")");
        data.values.select.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "translate(" + (-g_SunRadius * SUN_SCROLL_X_SUN_OFFS) + ", " + (-g_SunRadius * SUN_SCROLL_Y_SUN_OFFS) + ")");
    }
    //// [SLIDER END]

    // create children
    if (data.sub_folders) {
        data.values.children.selectAll("g")
            .data(data.sub_folders)
            .enter()
            .append("g")
            .attr("class", "planet dom")
            .each(function(d, i) { AddChildren(d3.select(this), d, data, i); });

        CreateSortMenu();
        CreateSelectMenu();
        CreateViewMenu();
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

    if (g_project.move) MoveCreate(data.values.this, data.values.back);

    if (g_root.slider) CreateSlider();
}

function AddChildren(obj, data, parent, position = 0) {
    data.box = {...g_box };
    data.values = {};
    data.values.this = obj;
    data.id = data.ic_id; // .replace(/[\/.]/g,"-");
    data.par_id = parent.ic_id; // .replace(/[\/.]/g,"-");
    data.values.back = parent;
    data.values.position = position;
    data.values.parent = (parent != null) ? d3.select("#obj-" + data.par_id) : null;
    data.values.sun = false;
    data.values.data = parent;
    data.values.data.checked = false;

    //// [SLIDER START]
    // data.values.rotation = data.values.back.sub_folders.length > 1 ? position * 360 / data.values.back.sub_folders.length : 1;
    //// [SLIDER OLD/NEW]
    if (g_root.slider) {
        data.values.rotation = position * g_project.spiral_info.planet_distance;
        //data.values.rotation = position * 360 / PLANET_MAX_NUMBER_MAX;
    } else {
        data.values.rotation = data.values.back.sub_folders.length > 1 ? position * 360 / data.values.back.sub_folders.length : 1;
    }
    //// [SLIDER END]

    data.values.this.attr("id", "obj-" + data.id);
    // data.values.this.attr("parent", (parent != null) ? "obj-"+data.par_id : "null");

    // position planet
    if (g_root.slider) {
        //// [SLIDER START]
        // let distance = {
        //     x:  (g_SunRadius + g_PlanetRadius * PLANET_ORBIT_COEF),
        //     y:  (data.values.position * (g_PlanetRadius * 2) * PLANET_SCROLL_COEF)
        // };
        // data.values.this.transition()
        //     .ease("linear")
        //     .duration(ORBIT_ANIM_MOVE)
        //     .attr("transform", "translate(" + distance.x + ", " + distance.y + ")");
        //// [SLIDER OLD/NEW]
        let g_orbit = (g_SunRadius + (g_project.height_h - g_SunRadius) / 2) * ORBIT_SCROLL_COEF; // distance from the center
        //console.log(g_orbit, g_SunRadius, g_project.height_h, ORBIT_SCROLL_COEF) 
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "rotate(" + (-data.values.rotation) + "), translate(" + g_orbit + ", 0), rotate(" + (data.values.rotation) + ")");
        //// [SLIDER END]
    } else {
        let g_orbit = (g_SunRadius + (g_project.height_h - g_SunRadius) / 2); // distance from the center 
        //console.log(g_orbit, g_SunRadius, g_project.height_h, ORBIT_SCROLL_COEF) 
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "rotate(" + (-data.values.rotation) + "), translate(" + g_orbit + ", 0), rotate(" + (data.values.rotation) + ")");
    }


    data.values.object = data.values.this.append("g").attr("class", "planet object");

    // Shaders start
    data.values.background = data.values.object.append("circle")
        .attr("class", "planet background" + (data.is_directory ? " dir" + (data.sub_folders == 0 ? " empty" : "") : ""))
        .attr("r", g_PlanetRadius);

    data.values.picture = data.values.object.append("circle")
        .attr("class", "planet pattern" + (data.is_directory ? " dir" + (data.sub_folders == 0 ? " empty" : "") : ""))
        .attr("r", g_PlanetRadius);

    // data.values.shader = data.values.object.append("circle")
    //     .attr("class", "planet shader")
    //     .attr("r", g_PlanetRadius)
    //     .attr("transform", "rotate(" + ((g_root.slider) ? 0 : data.values.rotation) + ")");

    // data.values.gloss = data.values.object.append("circle")
    //     .attr("class", "planet gloss")
    //     .attr("r", g_PlanetRadius)
    //     .attr("transform", "rotate(" + ((g_root.slider) ? 0 : data.values.rotation) + ")");

    // Text
    AddText(data, "planet");
    //// [SLIDER START]
    // if (g_root.slider) {
    //     data.values.text.selectAll("text")
    //         .style("text-anchor", "start")
    //         .attr("transform", "translate(" + (g_SunRadius / PLANET_SCROLL_TEXT) + ")");
    // }
    //// [SLIDER END]

    // set color of a planet
    if (data.color) {
        data.values.background
            .style("fill", data.color)

        data.values.this.select(".text_front")
            .style("fill", FlipColor(data.color))
    }

    // planet select = mouse over overlay for planets
    data.values.select = data.values.this.append("circle")
        .attr("class", "planet select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_PlanetRadius)
        .on("mouseover", function(d) {
            if (!g_project.overlay && !g_project.move && g_root.zoom) {}
            SetDisplayName(GetDisplayName(d));
        })
        .on("mouseleave", () => {
            ClearDisplayName();
        })
        .on("mousedown", function(d) {
            ClickStart(function(d) {
                // if(!g_project.overlay && g_root.zoom){
                //     OverlayCreate(d3.select(this), d, data);
                // }
            }, data);
        })
        .on("click", function(d) {
            if (!g_project.selection) {
                var func = function() {};
                switch (g_project.data.overlay_type) {
                    case "user":
                        func = GetWarp;
                        break;
                    default:
                        func = SunFadeout;
                        break;
                }
                ClickStop(func, data, true);
            }
        })
        .on("contextmenu", function(d) {
            CreateContextMenu(d3.event, d);
        });

    data.values.checked = data.values.this.append("foreignObject")
        .attr("x", -g_OverlayItemSize / 2)
        .attr("y", -g_OverlayItemSize / 2)
        .attr("width", g_OverlayItemSize)
        .attr("height", g_OverlayItemSize)
        .attr("transform", "translate(0, " + (-(g_OverlayRadius - g_OverlayItemSize - OVERLAY_PLANET_MARGIN)) + ")")
        .style("opacity", 0);

    data.values.checked.append("xhtml:div")
        .attr("class", "planet foregin select")
        .append("i")
        .attr("class", "planet material-icons select")
        .style("font-size", g_OverlayItemSize + "px")
        .html("check_circle");

}

// -------------------------------------------------------

function AddTspan(target, newobj, text, suffix = null) {
    var max_text = TEXT_MAX_TEXT;
    var max_text_len = TEXT_MAX_LINE_CHARS;

    if (text.length >= max_text)
        text = text.slice(0, max_text - 3) + "...";

    // slice the text to fit inside circle
    var slices = ((text.length / max_text_len) | 0);
    
    // calculate line height spacing
    var spacing = parseFloat($(target.node()).css("fontSize"));

    for (var i = 0; i <= slices; i++) {
        target.append("tspan")
            .attr('x', 0)
            .attr('y', (i - (slices) / 2) * spacing)
            .html(text.slice(i * max_text_len, (i + 1) * max_text_len))
    }

    if (suffix) {
        target.append("tspan")
            .attr('x', 0)
            .attr('y', (slices + 1 - (slices) / 2) * spacing) 
            .html(suffix.slice(0)) // 1 to remove "."
    }
}

function AddText2(data, text, x, y, cls = "") {
    let values = data.values;
    
    values.text_len = text.length;

    // create new text group
    values.text = values.object.append("g")
        .attr("class", cls + " text")

    // add new text element
    tmp = values.text.append("text")
        .attr("class", cls + " text_front")
        .attr("x", x)
        .attr("y", y)
        .style("fill", data.color ? FlipColor(data.color) : "")
        
    AddTspan(tmp, values, text, data.type ? data.type : null);
}

function AddText(data, cls = "", fix = false) {
    var newobj = data.values;
    var newName = data.name;
    // if(data.type){
    //     newName = data.name + data.type
    // }
    newobj.text_len = newName.length;
    newobj.text = newobj.object.append("g")
        .attr("class", cls + " text")
    var tmp = newobj.text.append("text")
        .attr("class", cls + " text_back")
        .attr("x", 0)
        .attr("y", 0)
        //.attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        //.html(newName);
    AddTspan(tmp, newobj, newName, data.type ? data.type : null);
    tmp = newobj.text.append("text")
        .attr("class", cls + " text_front")
        .attr("x", 0)
        .attr("y", 0)
        .style("fill", data.color ? FlipColor(data.color) : "")
        //.attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        //.html(newName);
    AddTspan(tmp, newobj, newName, data.type ? data.type : null);
}

// -------------------------------------------------------

function RecursiveFileSearch(back, data) {
    var found = false;
    // console.log(data.parent_id +"  "+ data.ic_id, data.sub_folders.length)
    if ((data.parent_id == SESSION["position"]["parent_id"]) &&
        (data.ic_id == SESSION["position"]["ic_id"])) {
        return [
            [], data
        ];
    } else if (data.sub_folders && data.sub_folders.length > 0) {
        for (var elem of data.sub_folders) {
            found = RecursiveFileSearch(data, elem);
            if (found) {
                found[0].push(data);
                break;
            }
        }
    }
    if (!found) {
        if (data.ic_id == SESSION["position"]["parent_id"]) {
            return [
                [], data
            ];
        }
    }
    return found;
}

function ProjectPosiotionSet(data) {
    var found = false;
    if (SESSION["position"]) {
        found = RecursiveFileSearch(data, data);
        // if (found) {
        //     var path = found[0].reverse()
        //         // console.log(path);
        //     for (var add of path) {
        //         add.box = {...g_box };
        //         add.values = {...add.values };
        //         AddPath(add);
        //     }
        // }
    }
    CreateWorkspace(found ? found[1] : data);
}

function CreateDashboard(data, project_position = null) {
    WindowResize();

    g_root.universe = SVG.append("g")
        .attr("id", "Universe")
        .attr("transform", "translate(" + (g_root.x) + "," + (g_root.y) + ")," + "scale(" + (g_root.scale) + ")")
        .call(globDrag)
        .call(globZoom)
        .on("mousedown.zoom", null)
        .on("touchstart.zoom", null)
        .on("touchmove.zoom", null)
        .on("touchend.zoom", null);

    g_root.universe.append("circle")
        .attr("id", "Touch")
        .attr("r", g_TouchRadius);

    g_root.looper = SVG.append("g")
        .attr("id", "Slider")
        .attr("transform", "translate(" + (g_root.x) + "," + (g_root.y) + ")," + "scale(" + (g_root.scale) + ")")
        .call(loopDrag);

    //g_project.project_position = project_position;

    g_project.data = data;

    CreateDisplayName();

    PathCreation();

    HistoryCreation();

    ProjectPosiotionSet(g_project.data);

    // 143 times per second
    d3.timer(function(elapsed) {
        if (InstanceExists(g_root.universe)) UpdateUniverse();
        else return;

        let offY = $SVG.offset().top;
        if ($($DASHBOARD).width() != g_project.width || $($DASHBOARD).height() - offY != g_project.height) {
            WindowResize();
        }
    });
}

function CreateWorkspace(data) {
    CreateSortMenu();
    CreateSelectMenu();
    CreateViewMenu();

    switch (g_view) {
        // planetary
        case 0:
            $("#PROJECT-GRID").hide(); // todo animate maybe
            $("#PROJECT").show();
            ClearSpace();
            CreateSpace(data);
            break;

            // grid view
        case 1:
            $("#PROJECT-GRID").show(); // todo animate maybe
            $("#PROJECT").hide();
            CreateGrid(data);
            break;
    }

    // hide activity when on root path
    $(".activity-menu").toggleClass("d-none", (g_project.current_ic.path === "." 
        && g_project.current_ic.overlay_type !== "user"));
}

function CreateGrid(data) {
    data.values = {};
    data.values.back = data;
    data.values.data = data;
    g_project.current_ic = data;
    data.id = data.ic_id;

    switch (data.overlay_type) {
        case "ic":
            WrapOpenFile(data, false);
            SendProject(data);
            break;
        case "post_ic":
            EditPost(data, data.ic_id);
            break;
        case "bid_ic":
            ViewPost(data, data.ic_id);
            break;
        case "all_post_ic":
            ViewPost(data, data.ic_id);
            break;
        default:
            break;
    }

    // Topbar path
    if (SESSION.position) {
        found = RecursiveFileSearch(g_project.data, g_project.data);
        if (found) {
            $(".info-path-text").empty();
            var path = found[0].reverse();

            for (let add of path) {
                add.box = {...g_box };
                add.values = {...add.values };

                let span = document.createElement("span");
                span.className = "path-link";
                span.textContent = add.name;

                span.onclick = function() {
                    if (g_project.search /*&& g_project.search.overlay_type == "ic"*/ ) g_project.search = false;
                    add.paths_path = {}
                    add.paths_path.back = g_project.paths;
                    g_project.paths = add.paths_path.back;
                    g_project.hist_path_len = add.paths_path.start;
                    CreateWorkspace(add);
                }

                $(".info-path-text").append(span);

                let slash = document.createElement("span");
                slash.className = "mx-2";
                slash.textContent = "/";
                $(".info-path-text").append(slash);
            }
        }
    }

    let grid = document.createElement('div');
    grid.className = "row mx-3";
    grid.style.marginTop = $(".hover-menu").outerHeight() + "px";
    grid.onclick = function(event) {
        // deselect card
        if (!event.target.closest(".card")) {
            $(".card").removeClass("selected");
        }
    }

    $("#PROJECT-GRID").empty().append(grid);

    // process all grid items 
    g_project.current_ic.sub_folders.forEach(
        (d) => {
            // create a card
            let card_holder = document.createElement("div");
            card_holder.className = "col-md-2 p-2";

            let card = document.createElement("div");
            card.className = "card";
            card.onclick = function(event) {
                // select cards
                if (event.ctrlKey) {
                    $(this).addClass("selected");
                } else {
                    $(".card").not(this).fadeOut(() => {
                        data.overlay_type !== "project" ? CreateGrid(d) : WrapGetProject(d);
                    });
                }
            }

            card.oncontextmenu = (event) => {
                CreateContextMenu(event, d);
            }

            // create image
            let img = document.createElement('img');
            img.className = "card-img-top";
            img.alt = "Preview unavailable";
            img.src = "https://yuanpaygroup.com/assets/img/ficoin_FIH.png";

            // create body
            let body = document.createElement('div');
            body.className = 'card-body';

            // body title
            let title = document.createElement('h5');
            title.className = "card-title";
            title.textContent = d.name;

            // body info
            let info = document.createElement('p');
            info.className = "card-text";
            info.textContent = d.history[0].date.split("-")[0]; // parse date of file creation

            body.appendChild(title);
            body.appendChild(info);

            card.appendChild(img);
            card.appendChild(body);

            card_holder.appendChild(card);
            grid.appendChild(card_holder);
        }
    );
}

function CreateSlider() {

    g_root.looper.this = g_root.looper.append("g").attr("class", "looper")

    g_root.looper.this.attr("transform", "translate(0, " + (g_project.height_h - SCROLL_LOOP_X) + ")");

    g_root.looper.box = g_root.looper.this.append("rect")
        .attr("class", "slider rect")
        .attr("x", -g_project.width_h / 2)
        .attr("y", -SCROLL_LOOP_H / 2)
        .attr("width", g_project.width_h)
        .attr("height", SCROLL_LOOP_H)

    g_root.looper.svg = g_root.looper.this.append("svg")
        .attr("class", "slider svg")
        .attr("x", -g_project.width_h / 2)
        .attr("y", -SCROLL_LOOP_H / 2)
        .attr("width", g_project.width_h)
        .attr("height", SCROLL_LOOP_H)

    g_root.looper.svg.append("rect")
        .attr("class", "slider bground")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", g_project.width_h)
        .attr("height", SCROLL_LOOP_H)

    g_root.looper.size = g_project.width_h / g_project.spiral_info.spiral_length * g_project.spiral_info.planet_distance * g_project.spiral_info.planet_number;
    g_root.looper.pos = g_root.looper.svg.append("rect")
        .attr("class", "slider pos")
        .attr("x", -g_root.looper.size / 2)
        .attr("y", 0)
        .attr("width", g_root.looper.size)
        .attr("height", SCROLL_LOOP_H)
    g_root.looper.posL = g_root.looper.svg.append("rect")
        .attr("class", "slider pos")
        .attr("x", -g_root.looper.size / 2 + g_project.width_h)
        .attr("y", 0)
        .attr("width", g_root.looper.size)
        .attr("height", SCROLL_LOOP_H)
    g_root.looper.posR = g_root.looper.svg.append("rect")
        .attr("class", "slider pos")
        .attr("x", -g_root.looper.size / 2 - g_project.width_h)
        .attr("y", 0)
        .attr("width", g_root.looper.size)
        .attr("height", SCROLL_LOOP_H)
}

function ClearSpace() {
    if (InstanceExists(g_root.universe)) {
        d3.selectAll("g.star").remove();
    }
}
// -------------------------------------------------------