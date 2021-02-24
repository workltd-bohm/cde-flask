// -------------------------------------------------------

function CreateSpace(data) {
    g_root.x = g_project.width_h;
    g_root.y = g_project.height_h;
    g_root.scale = g_root.scale_old;
    g_root.cy_min = g_root.cy = -g_project.height_h /2;
    g_root.cy_max = g_root.cy_min;
    g_root.deg = g_root.rad = g_root.rad_diff = 0;
    g_root.zoom = true;
    if (g_root.slider) g_SunRadius *= SUN_SCROLL_ZOOM;
    g_PlanetRadius = g_PlanetRadius_old;
    g_root.slider = false;

    if (g_project.overlay) {
        g_project.overlay.remove();
        g_project.overlay = false;
    }

    if (g_project.selection) {
        g_project.selection.remove();
        g_project.selection = false;
    }

    g_project.current_ic = data;
    ClearDisplayName();

    // console.log(g_root.universe.data.overlay_type);
    // console.log(g_root.universe.data);
    // console.log(data);
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
    // g_root.universe.data.overlay_type == "ic" ? SendProject(data) : 1;
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

    // g_root.universe.selectAll("#Touch")
    //     .on("mouseover", function(){
    //         if (g_project.overlay){
    //             g_project.overlay.remove();
    //             g_project.overlay = false;
    //         }
    //     });

    // add path to a top bar
    if (SESSION.position) {
        found = RecursiveFileSearch(g_root.universe.data, g_root.universe.data);
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
                    if(g_project.search /*&& g_project.search.overlay_type == "ic"*/) g_project.search = false;
                    d3.selectAll("g.star").remove();
                    add.paths_path = {}
                    add.paths_path.back = g_project.paths;
                    g_project.paths = add.paths_path.back;
                    g_project.hist_path_len = add.paths_path.start;
                    CreateSpace(add);
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

    data.values.this.attr("id", "obj-" + data.id);

    if (g_root.slider) {
        g_root.cx = (-g_SunRadius * SUN_SCROLL_X_COEF);
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "translate(" + g_root.cx + ", 0)"); //, scale("+(SUN_SCROLL_SIZE_COEF)+")");
    }

    //Milos commented this out on 14.01.2021
    // data.values.effect = data.values.this.append("circle")
    //     .attr("class", "star effect")
    //     .attr("r", g_SunRadius * SUN_BG_RATIO);

    data.values.children = data.values.this.append("g").attr("class", "star child");

    data.values.object = data.values.this.append("g").attr("class", "star object");

    // Shaders start
    data.values.background = data.values.object.append("circle")
        .attr("class", "star background")
        .attr("r", g_SunRadius);

    data.values.picture = data.values.object.append("circle")
        .attr("class", "star pattern")
        .attr("r", g_SunRadius)

    // data.values.shader = data.values.object.append("circle")
    //     .attr("class", "star shader")
    //     .attr("r", g_SunRadius)

    // data.values.gloss = data.values.object.append("circle")
    //     .attr("class", "star gloss")
    //     .attr("r", g_SunRadius)
    // Shaders end

    data.values.select = data.values.this.append("circle")
        .attr("class", "star select")
        .attr("r", g_SunRadius)
        .on("mouseenter", function(d) {
            if (!g_project.move && g_root.zoom) 
            {
                OverlayDestroy();
                OverlayCreate(d3.select(this), d, data);
            }
            SetDisplayName(data.name);
        })
        .on("mouseleave", () => {
            ClearDisplayName();
        })
        .on("mousedown", function(d) {
            // ClickStart(function(data){
            //     // TODO: action menu
            //     // OverlayCreate(data);
            // }, data);
        })
        .on("mouseup", function(d) {
            // ClickStop(function(data){
            //     // NONE
            // }, data);
        });

    AddText(data, "star");

    // create children
    if (data.sub_folders) {
        data.values.children.selectAll("g")
            .data(data.sub_folders)
            .enter()
            .append("g")
            .attr("class", "planet dom")
            .each(function(d, i) { AddChildren(d3.select(this), d, data, i); });

        CreateSortMenu();
        CreateSelectMenu()
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

    data.values.rotation = data.values.back.sub_folders.length > 1 ? position * 360 / data.values.back.sub_folders.length : 1;

    data.values.this.attr("id", "obj-" + data.id);
    // data.values.this.attr("parent", (parent != null) ? "obj-"+data.par_id : "null");

    // Planet position
    if (g_root.slider) {
        let distance = {
            x:  (g_SunRadius + g_PlanetRadius * PLANET_ORBIT_COEF),
            y:  (data.values.position * (g_PlanetRadius * 2) * PLANET_SCROLL_COEF)
        };
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "translate(" + distance.x + ", " + distance.y + ")");
    } else {
        let g_orbit = (g_SunRadius + (g_project.height_h - g_SunRadius) / 2);  // distance from the center 
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "rotate(" + (data.values.rotation) + "), translate(" + g_orbit + ", 0), rotate(" + (-data.values.rotation) + ")");
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
    if (g_root.slider) {
        data.values.text.selectAll("text")
            .style("text-anchor", "start")
            .attr("transform", "translate(" + (g_SunRadius / PLANET_SCROLL_TEXT) + ")");
    }

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
            if (!g_project.overlay && !g_project.move && g_root.zoom) {
            }
            SetDisplayName(d.name);
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
                switch (g_root.universe.data.overlay_type) {
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
        .on("contextmenu", function(d){
            CreateContextMenu(d);
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

function AddTspan(target, newobj, text, prefix = null) {
    // TEXT_SUN_SCALE TEXT_MAX_LENGHT
    var max_text = TEXT_MAX_TEXT;
    var max_text_len = TEXT_MAX_LENGHT;
    if (g_root.slider) {
        max_text = TEXT_MAX_SCROLL_TEXT;
        max_text_len = TEXT_MAX_SCROLL_LENGHT;
    }

    text = text.slice(0, max_text);
    if (text.length >= max_text)
        text = text.slice(0, max_text - 4) + "...";

    var slice = ((text.length / max_text_len) | 0); // + 1;
    newobj.text_len = (slice > 0) ? max_text_len : newobj.text_len;
    var spacing = parseFloat($(target.node()).css("fontSize"));

    for (var i = 0; i <= slice; i++) {
        target.append("tspan")
            .attr('x', 0)
            .attr('y', (i - (slice) / 2) * spacing) //TEXT_SPACING)
            .html(text.slice(i * max_text_len, (i + 1) * max_text_len))
    }
    if (prefix) {
        target.append("tspan")
            .attr('x', 0)
            .attr('y', (slice + 1 - (slice) / 2) * spacing) //TEXT_SPACING)
            .html(prefix.slice(0)) // 1 to remove "."
    }
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
    // console.log(SESSION["position"])
    var found = false;
    if (SESSION["position"]) {
        found = RecursiveFileSearch(data, data);
        // console.log(found);
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
    //console.log(found)
    CreateSpace(found ? found[1] : data);
}

function DashboardCreate(data, project_position = null) {

    WindowResize();

    g_root.universe = SVG.append("g")
        .attr("id", "Universe")
        .attr("transform", "translate(" + (g_root.x) + "," + (g_root.y) + ")," + "scale(" + (g_root.scale) + ")")
        .call(globDrag)
        .call(globZoom);

    g_root.universe.append("circle")
        .attr("id", "Touch")
        .attr("r", g_TouchRadius);

    //g_project.project_position = project_position;

    g_root.universe.data = data[0];

    CreateDisplayName();

    PathCreation();

    HistoryCreation();

    ProjectPosiotionSet(g_root.universe.data);

    // 143 times per second
    d3.timer(function(elapsed) {
        if (InstanceExists(g_root.universe)) UpdateUniverse();
        else return;

        if ($($DASHBOARD).width() != g_project.width || $($DASHBOARD).height() != g_project.height) {
            WindowResize();
        }
    });
}

// -------------------------------------------------------