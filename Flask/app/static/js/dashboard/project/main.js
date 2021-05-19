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
    OverlayDestroy();
    ClearSelection();
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

    // Preserve Selection When Switching Views
    PreserveSelection();

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

    CreatePath();
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

    console.log(data)

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
        .style("fill", data.color); // set color background 

    data.values.picture = data.values.object.append("circle")
        .attr("class", "star pattern")
        .attr("r", g_SunRadius)


    data.values.select = data.values.this.append("circle")
        .attr("class", "star select")
        .attr("r", 0)
        .on("mouseenter", function(d) {
            if (!g_project.move && g_root.zoom) {
                // OverlayDestroy();
                // OverlayCreate(d3.select(this), d, data);
            }
            SetDisplayName(data.name);
        })
        .on("mouseleave", function() {
            ClearDisplayName();
        })
        .on("contextmenu", function(d) {
            CreateContextMenu(d3.event, d);
        });

    // create text group
    data.values.text = data.values.object.append("g")
        .attr("class", "star text")

    // add name to the sun
    AddText2(data, data.name, data.type ? data.type : null, 0, 0);
    
    // add date to the sun
    if (data.history.length && !data.is_directory) {
        AddText2(data, GetDate(data)[0], null, 0, GetRadius(data) * 2/3, .75, "planet-date");
        AddText2(data, GetDate(data)[1], null, 0, GetRadius(data) * 2/3 + parseInt($(".planet-date").css("font-size")), .75, "planet-time");
    }

    // Gets overlay type
    let overlay_type = GetContextType(data);
    data.values.overlay = data.values.object
        .append("g")
        .attr("class", "overlay-menu")
        .on("mouseenter", function(d) {
            if (!g_project.move && g_root.zoom) {
                // OverlayDestroy();
                // OverlayCreate(d3.select(this), d, data);
            }
            SetDisplayName(data.name);
        })
        .on("mouseleave", function() {
            ClearDisplayName();
        })
        .on("contextmenu", function(d) {
            CreateContextMenu(d3.event, data);
        });

    // get color from the sun and make overlay same color
    let color_default = getComputedStyle(document.documentElement).getPropertyValue("--sun-bg").trim();
    data.values.overlay.append("circle")
        .attr("r", g_SunRadius)
        .attr("fill", hexToRGB(data.color ? data.color : color_default, .75));

    let menu_items = data.values.overlay.append("g")
        .attr("class", "overlay-menu-items");

    menu_items.selectAll("g.overlay-menu-items")
        .data(overlay_type)
        .enter()
        .append("foreignObject")
        .each(function(d, i) {
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
                .on("click", function() {
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
    if (data.sub_folders.length) {
        data.values.children.selectAll("g")
            .data(data.sub_folders)
            .enter()
            .append("g")
            .attr("class", "planet dom")
            .each(function(d, i) { AddChildren(d3.select(this), d, data, i); });
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
    // Planet Data Configuration
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
    data.values.data.checked = (data.ic_id in CHECKED) ? true : false;

    //// [SLIDER START]
    // data.values.rotation = data.values.back.sub_folders.length > 1 ? position * 360 / data.values.back.sub_folders.length : 1;
    //// [SLIDER OLD/NEW]
    if (g_root.slider) {
        data.values.rotation = position * g_project.spiral_info.planet_distance;
        //data.values.rotation = position * 360 / PLANET_MAX_NUMBER_MAX;
    } else {
        data.values.rotation = (data.values.back.sub_folders.length > 1) ? -position * (360 / data.values.back.sub_folders.length) : 1;
    }
    //// [SLIDER END]

    data.values.this.attr("id", "obj-" + data.id);
    // data.values.this.attr("parent", (parent != null) ? "obj-"+data.par_id : "null");

    // Position Planet(s)
    let g_orbit;
    if (g_root.slider) {
        g_orbit = (g_SunRadius + (g_project.height_h - g_SunRadius) / 2) * ORBIT_SCROLL_COEF; // distance from the center
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "rotate(" + (-data.values.rotation) + "), translate(" + g_orbit + ", 0), rotate(" + (data.values.rotation) + ")");
    } else {
        g_orbit = (g_SunRadius + (g_project.height_h - g_SunRadius) / 2.5); // distance from the center
        data.values.this.transition()
            .ease("linear")
            .duration(ORBIT_ANIM_MOVE)
            .attr("transform", "rotate(" + (-data.values.rotation) + "), translate(" + g_orbit + ", 0), rotate(" + (data.values.rotation) + ")");
    }

    // Create Planet Orbit
    if (position === 0) {
        d3.select("g.star.dom")
            .insert("circle", "g.star.child") // Inserts A Circle Before "g.star.child"
            .attr("r", g_orbit)
            .attr("id", "planet-orbit");
    }

    data.values.object = data.values.this.append("g").attr("class", "planet object");

    // Shaders start
    let add_class = "";
    switch(data.overlay_type) {
        case "project":
            add_class = " project";
            break;
        case "ic":
            add_class = (data.is_directory) ? " folder" + (data.sub_folders == 0 ? " empty" : "") : " file";
            break;
        case "shared":
            add_class = " shared";
            break;
        case "user":
        case "search":
        default:
            break;
    }

    // Background Color
    data.values.background = data.values.object.append("circle")
        .attr("class", "planet background" + add_class)
        .attr("r", g_PlanetRadius);

    data.values.picture = data.values.object.append("circle")
        .attr("class", "planet pattern" + add_class)
        .attr("r", g_PlanetRadius);

    // These Must Also Be Included In / Removed From Animation
    // data.values.shader = data.values.object.append("circle")
    //     .attr("class", "planet shader")
    //     .attr("r", g_PlanetRadius)
    //     .attr("transform", "rotate(" + ((g_root.slider) ? 0 : data.values.rotation) + ")");

    // data.values.gloss = data.values.object.append("circle")
    //     .attr("class", "planet gloss")
    //     .attr("r", g_PlanetRadius)
    //     .attr("transform", "rotate(" + ((g_root.slider) ? 0 : data.values.rotation) + ")");

    // Text
    data.values.text = data.values.object.append("g")
        .attr("class", "planet text")

    AddText2(data, data.name, data.type ? data.type : null, 0, 0);

    // Planet Dates
    // |exclude user profile   |exclude folders      |exclude projects                     |exclude shared
    if (data.history.length && !data.is_directory && !(data.overlay_type === "project") && !(data.overlay_type === "shared"))
    {
        AddText2(data, GetDate(data)[0], null, 0, GetRadius(data) * 2/3, .8, "planet-date");
        AddText2(data, GetDate(data)[1].split(":").slice(0, 2).join(":"), null, 0, GetRadius(data) * 2/3 + parseInt($(".planet-date").css("font-size")), .8, "planet-time");
    }

    // Planet Color
    if (data.color) {
        data.values.background
            .style("fill", data.color)

        data.values.this.selectAll(".text_front")
            .style("fill", FlipColor(data.color))
    }

    // Planet(s) Mouse Events
    data.values.select = data.values.this.append("circle")
        .attr("class", "planet select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_PlanetRadius)
        .on("mouseenter", function(d) {
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
            var func = function() {};
            switch (g_project.data.overlay_type) {
                case "user":
                    func = GetWarp;
                    break;
                case "project_root":
                    func = SunFadeout;
                    break;
                case "ic":
                default:
                    func = data.is_directory ? SunFadeout : WrapOpenFile;
                    break;
            }
            ClickStop(func, data, true);
        })
        .on("contextmenu", function(d) {
            CreateContextMenu(d3.event, d);
        });

    data.values.data = data;    // Reference Hack - Be Careful

    // Don't Create Checkboxes For Project Or User
    if (InProjectList() || (g_project.current_ic.overlay_type === "user")) return;
    
    // Create The Select Checkbox ForeignObject (container)
    g_OverlayItemSize = 24;
    data.values.checked = data.values.this.append("foreignObject")
        .attr("class", "planet-select")
        .attr("x", -g_OverlayItemSize / 2)
        .attr("y", -g_OverlayItemSize / 2)
        .attr("width", g_OverlayItemSize)
        .attr("height", g_OverlayItemSize)
        .attr("transform", "translate(0, " + (-(g_PlanetRadius - g_OverlayItemSize / 1.5)) + ")")
        .attr("title", "SELECT")
        .on("click", function(data){            
            SelectPlanet(data);
            
            // Change Visual Representation Of Checkbox
            if (data.values.data.ic_id in CHECKED) {
                this.querySelector("i").textContent = "check_circle";
                this.classList.add("show");
            } else {
                this.querySelector("i").textContent = "check_circle_outline";
                this.classList.remove("show");
            }
        });
    
    // Create The Icon Checkmark
    data.values.checked.append("xhtml:div")
        .attr("class", "planet foregin select")
        .append("i")
        .attr("class", "planet material-icons select")
        .style("font-size", g_OverlayItemSize + "px")
        .style("color", data.color ? FlipColor(data.color) : "#303030")
        .html("check_circle_outline");

    // Preserve Selected Ics Throught Changing Views
    if (data.values.data.checked) {
        // Fake False Checked So It Gets Triggered
        data.values.data.checked = false;
        // Set Id So Element Can Be Get By Id
        data.values.checked.attr("id", "select-me");
        // Trigger Click
        document.getElementById("select-me").dispatchEvent(new Event('click'));
        // Remove Id
        document.getElementById("select-me").removeAttribute("id");
    }
}
// -------------------------------------------------------

function AddTspan(target, text, x, y, suffix = null, size = 1) {
    var max_text = TEXT_MAX_TEXT;
    var max_text_len = TEXT_MAX_LINE_CHARS;

    if (text.length >= max_text)
        text = text.slice(0, max_text - 3) + "...";

    // slice the text to fit inside circle
    var slices = text.length > max_text_len ? ((text.length / max_text_len) | 0) : 0;

    // calculate line height spacing
    var spacing = parseFloat($(target.node()).css("fontSize"));

    for (var i = 0; i <= slices; i++) {
        let txt = target.append("tspan")
            .attr('x', x)
            .attr('y', y ? y : (i - (slices) / 2) * spacing)
            .html(text.slice(i * max_text_len, (i + 1) * max_text_len));

        // scale text if given 'size' argument
        txt.style("font-size", (size !== 1) ? spacing * size : spacing);
    }

    if (suffix) {
        target.append("tspan")
            .attr('x', 0)
            .attr('y', (slices + 1 - (slices) / 2) * spacing)
            .html(suffix.slice(0)) // 1 to remove "."
    }
}

// Note: Rename This To AddText After AddText Is No Longer Used
function AddText2(data, text, suffix = null, x, y, size = 1, cls = "") {
    let values = data.values;

    values.text_len = text.length;

    // add new text element
    let tmp = values.text.append("text")
        .attr("class", cls + " text_front")
        .attr("x", x)
        .attr("y", y)
        .style("fill", data.color ? FlipColor(data.color) : "")

    AddTspan(tmp, text, x, y, suffix, size);
}

// Add Text To SVG (will not be used soon)
function AddText(data, cls = "", fix = false) {
    var newobj = data.values;
    var newName = data.name;
    // if(data.type){
    //     newName = data.name + data.type
    // }
    newobj.text_len = newName.length;
    
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

    $("#Universe").remove();

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

    $("#Slider").remove();

    g_root.looper = SVG.append("g")
        .attr("id", "Slider")
        .attr("transform", "translate(" + (g_root.x) + "," + (g_root.y) + ")," + "scale(" + (g_root.scale) + ")")
        .call(loopDrag);

    //g_project.project_position = project_position;

    g_project.data = data;

    CreateDisplayName();

    ProjectPosiotionSet(g_project.data);

    // Polls x times, per refresh rate of monitor
    d3.timer(function(elapsed) {
        if (InstanceExists(g_root.universe)) UpdateUniverse();
        else return;

        let offX = $SVG.offset().left;
        let offY = $SVG.offset().top;
        
        if ($($DASHBOARD).width() - offX != g_project.width || $($DASHBOARD).height() - offY != g_project.height) {
            WindowResize();
        }
    });
}

function CreateHoverMenu()
{
    $(".hover-menu").empty();

    // Appended - Each Comes After
    CreateUndoMenu();
    CreateSortMenu();
    if (g_project.current_ic.sub_folders.length && !InProjectList()) CreateSelectMenu();
    CreateViewMenu();

    // Prepended - Each Comes Before
    if (g_view === VIEW_GR) CreateNewMenu();
    if (!g_project.current_ic.is_directory && g_view === VIEW_GR) CreatePreviewMenu();

    // Action Menu For Grid (if selected)
    if (Object.keys(CHECKED).length && g_view === VIEW_GR) {
        CreateActionMenu();
    }

    // Accept / Decline Buttons for grid view
    if (g_project.move && g_view === VIEW_GR) CreatePromptMenu();


    // Change Toggle View Icon 
    let view_button_text = (g_view === VIEW_PL) ? "grid_view" : "public";
    $("#btn-view").children().last().text(view_button_text);
}

function CreateWorkspace(data) {
    // Get the session view
    if (SESSION.view) {
        g_view = SESSION.view;
    }

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

    // Creates Action ("Hover") Menu
    CreateHoverMenu();

    // hide activity when on root path
    HideActivity();
}

function CreatePromptMenu()
{
    let menu = document.createElement("div");
    menu.className = "prompt-menu";

    let button_accept = document.createElement("a");
    button_accept.className = "hover-menu-item px-3 py-2 mt-3 glow";
    button_accept.textContent = "Accept";
    button_accept.onclick = function() {
        ApplyMove(g_project.move);
    }
    
    let button_cancel = document.createElement("a");
    button_cancel.className = "hover-menu-item px-3 py-2 mt-3 glow";
    button_cancel.textContent = "Cancel";
    button_cancel.onclick = function() {
        ClearMove();
    }

    menu.appendChild(button_accept);
    menu.appendChild(button_cancel);
    $(".hover-menu").prepend(menu);
}

function CreateGrid(data) {
    // hacking "sun" data
    data.values = {};
    data.values.back = data;
    data.values.data = data;
    data.values.sun = true;
    data.id = data.ic_id;
    g_project.current_ic = data;    // set current ic (global)
    
    PreserveSelection();
    
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

    CreatePath();

    let grid = document.createElement('div');
    grid.className = "row m-5";
    grid.style.marginTop = $(".hover-menu").outerHeight() + "px";

    grid.onclick = function(event) {
        // deselect card
        if (!event.target.closest(".card")) {
            $(".card").removeClass("selected");
        }
    }

    // Right Click menu
    // grid.oncontextmenu = function(event) {
    //     CreateContextMenu(event, data);
    // }

    $("#PROJECT-GRID").empty().append(grid);

    // Process Grid Items
    g_project.current_ic.sub_folders.forEach(
        (d) => {
            // Create A Card
            let card_holder = document.createElement("div");
            card_holder.className = "col-xs-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 col-xxl-2 p-2";
            let card = document.createElement("div");
            card.className = "card";
            
            // config (hack) data
            d.values = {};
            d.values.sun = false;
            d.values.data = d;
            d.values.back = data;
            d.values.data.checked = d.ic_id in CHECKED ? true : false;
            d.values.object = card;

            card.onclick = function(event) {
                if (event.target.type === 'checkbox' || event.target.className === "card-color") {
                    return;
                }

                if (event.ctrlKey) {
                    // Disable Select For Projects
                    if (InProjectList()) return;

                    // Hold Ctrl To Select
                    $(this).addClass("selected");
                    SelectPlanet(d);
                } else {
                    // Load New Ic / Folder / Project / Open File
                    data.overlay_type === "project_root" ? WrapGetProject(d) : d.is_directory ? CreateWorkspace(d) : WrapOpenFile(d);
                }
            }

            // right click menu
            card.oncontextmenu = (event) => {
                CreateContextMenu(event, d);
            }

            // Checkboxes For Cards
            if (!InProjectList()) {
                // show checkbox on mouseover
                card.onmouseover = () => {
                    card.querySelector("input").style.opacity = 1;
                }
                
                card.onmouseout = () => {
                    let check = card.querySelector("input");
                    if (!check.checked) {
                        check.style.opacity = 0;
                    }
                }

                // Create Checkbox
                let checkbox = document.createElement("input");
                checkbox.className = "position-absolute m-2";
                checkbox.type = 'checkbox';
                checkbox.style.width = '20px';
                checkbox.style.height = '20px';
                checkbox.style.opacity = 0;
    
                // Cards Selection
                checkbox.onclick = function(){
                    SelectPlanet(d);
    
                    // set the HTML prop (otherwise only browser will know it's checked)
                    $(this).prop("checked", checkbox.checked);
                }
    
                // Preserve Checked Cards Through Changing Views
                if (d.checked) {
                    d.checked = false;
                    checkbox.click();
                    checkbox.style.opacity = 1;
                }

                card.appendChild(checkbox);
            }
                
            // create image
            let img = document.createElement('img');
            img.className = "card-img-top";
            img.alt = "Preview unavailable";
            img.src = d.thumb_id ? GetFileURL(d) : GetDefaultImg(d);

            // create body
            let body = document.createElement('div');
            body.className = 'card-body p-2';

            // body title
            let title = document.createElement('h6');
            title.className = "card-title";
            title.textContent = d.name;

            // body info
            let info = document.createElement('p');
            info.className = "card-text mt-1 d-flex justify-content-between";

            let date = document.createElement("span");
            date.textContent = GetDate(d)[0]; // parse date of file creation

            let time = document.createElement("span");
            time.textContent = GetDate(d)[1];

            // colored border for cards
            if (d.color)
            {
                card.style.boxShadow = "0 4px 0 " + d.color; 
            }
            
            info.appendChild(date);
            info.appendChild(time);

            body.appendChild(title);
            body.appendChild(info);

            card.appendChild(img);
            card.appendChild(body);

            card_holder.appendChild(card);
            grid.appendChild(card_holder);
        }
    );

    // If there aren't any subfolders
    if (data.sub_folders.length <= 0)
    {
        // Preview option for files
        if (!data.is_directory) {
            let preview_button = document.createElement("a");
            preview_button.textContent = "Preview";
            preview_button.className = "grid-link";
            preview_button.style.display = "inline-block";
            preview_button.onclick = function () {
                WrapOpenFile(data);
            }
            grid.appendChild(preview_button);
        } else {
        // Display "Empty" Text
            let empty_text = "";
            switch(data.overlay_type) {
                case "project_root":
                    empty_text = "You don't have any projects.";
                    break;
                case "ic":
                    empty_text = "Nothing to show.";
                    break;
                case "trash":
                    empty_text = "Trash is empty.";
                    break;
            }

            let nothing_text = document.createElement("span");
            nothing_text.textContent = empty_text;
            grid.appendChild(nothing_text);
        }

        // No Create Button If It's Not An Ic Or Project Root (etc Trash)
        if (data.overlay_type !== "ic" && InProjectList()) return;

        // Add Create Buttons
        let button_create = document.createElement("a");
        button_create.style.display = "inline-block";
        button_create.className = "grid-link";
        button_create.innerHTML = "Create&#9656;";
        button_create.onclick = function(event) {
            type = GetContextType(g_project.current_ic);

            // Make A Copy Of OverFile Object, To Remove First Option
            if (type === g_OverFile) {
                type = g_OverFile.slice();
                type.shift();
            }

            CreateMenu(event, data, type);
        }
        
        grid.appendChild(button_create);
    }

    // Persist Move Data
    if (g_project.move) MoveCreate(null, data.values.back);
    
    // resize cards & tell broswer to observe change in size of the element for resizing
    ResizeCards();
    cardsResizeObserver.observe(document.getElementById("PROJECT-GRID"));
}

const cardsResizeObserver = new ResizeObserver(entries => {
    ResizeCards();    
});

function ResizeCards(){
    // .. make cards square shape
    let card_width = $(".card-body").innerWidth();
    let card_body_height = $(".card-body").innerHeight();
    $(".card-img-top").height(card_width - card_body_height);
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
// ---------------------HELPER FUNCTIONS FOR PROJECT-------------------

function GetRadius(data)
{
    // Returns Radius Of A Planet Body
    return data.values.object.selectAll("circle").attr("r");
}

function GetDate(data)
{
    // Returns date in format ['dd.mm.yyyy', 'hh:mm:ss']
    return data.history[0].date.split("-");
}