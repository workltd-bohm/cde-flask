const colorScale = [
    "#3345c9",
    "#274554",
    "#b088dc",
    "#572159",
    "#842309",
    "#c55656",
    "#ed8d2e",
    "#d7d120",
    "#afc556",
    "#448449",
    "#56c5af",
    "#8c45c9",
    "#ff88a2",
    "#9edc99",
    "#23a1af",
    "#e63232",
    "#006699",
    "#ff5733",
    "#731981",
    "#00aaff",
    "#ffcc00",
    "#ff3399",
];

function ChangeColor(data) {
    if (g_view !== VIEW_PL) { 
        let card_body = data.values.object.querySelector(".card-body");
        let card_body_copy = card_body.cloneNode(true);

        $(card_body).empty();
        let card_body_colors = document.createElement("DIV");
        colorScale.forEach(color => {
            let clickable = document.createElement("I");
            clickable.className = "card-color";
            clickable.style.backgroundColor = color;
            clickable.onclick = function() {
                data.values.data.color = color;
                SetColor(data, color);
                $(card_body).empty();
                card_body.outerHTML = card_body_copy.outerHTML;
            }

            card_body_colors.appendChild(clickable);
        });
        
        let text = document.createElement("SPAN");
        text.style.display = "block";
        text.textContent = "Choose a color:";
        card_body.appendChild(text);
        card_body.appendChild(card_body_colors);
        return; 
    }

    // Set Default Color
    let defaultColor = $(".foregin .material-icons").css("color");

    // Set Radius
    let _radius = g_OverlayRadius;
    if (!data.values.data.values.sun) {
        _radius = g_PlanetRadius;
    }

    // Create Pie
    let pie = d3.layout.pie().sort(null);
    let arc = d3.svg.arc().innerRadius(_radius * .5).outerRadius(_radius);

    // spawn color wheel group
    let object = data.values.data.values.sun ? d3.select("g.star.dom") : data.values.this;
    let offY = (g_root.slider && data.values.data.values.sun) ? (-g_SunRadius * SUN_SCROLL_Y_SUN_OFFS) : 0;

    let wheel = object.append("g")
        .attr("class", "color_wheel")
        .attr("transform", "translate(0, " + offY + "), scale(0.5), rotate(90)") // animation property
        .attr("opacity", "0"); // animation property

    if (g_root.slider && data.values.data.values.sun) {
        wheel.transition().duration(0)
            .attr("y", 0);
    }

    let circle = wheel.append("circle")
        .attr("r", _radius)
        .attr("fill", defaultColor)

    // animate wheel
    wheel.transition()
        .duration(200)
        .attr("transform", "translate(0, " + offY + "), scale(1), rotate(0)")
        .attr("opacity", "1");

    wheel.datum(Array(colorScale.length).fill(1))
        .selectAll("path")
        .data(pie)
        .enter()
        .append("path")
        .attr("fill", function(d, i) {
            return colorScale[i];
        })
        .attr("d", arc)
        .on("mouseover", function() {
            let fill = d3.select(this).attr("fill");
            circle.attr("fill", fill);
        })
        .on("click", function() {
            let fill = d3.select(this).attr("fill");
            data.values.data.color = fill;
            // $(".foregin .material-icons").css("color", fill); change color before reload?
            SetColor(data.values.data, fill);

            wheel.transition()
                .duration(200)
                .attr("opacity", 0)
                .each(function() {
                    setTimeout(() => {
                        d3.select(this).remove();
                    }, 200);
                });
        });

    // animate wheel on mouse leave
    wheel.on("mouseleave", function() {
        wheel.on("mouseleave", null)
            .transition()
            .duration(100)
            .attr("transform", "translate(0, " + offY + "), scale(1.25), rotate(90)")
            .transition()
            .duration(200)
            .attr("transform", "translate(0, " + offY + "), scale(0), rotate(270)")
            .attr("opacity", 0)
            .remove()
    });
};

// applies the new color to the appropriate IC
function SetColor(data, fill) {
    console.log(data);
    var o = Object.values(CHECKED);
    var multi = [];
    for (var i = 0; i < o.length; i++) {
        multi.push({
            ic_id: o[i].ic_id,
            parent_id: o[i].parent_id,
            color: data.color
        });
    }
    LoadStart();
    $.ajax({
        url: (o.length > 0) ? "/set_color_multi" : "/set_color",
        type: 'POST',
        data: JSON.stringify((o.length > 0) ? multi : 
            { 
                ic_id: data.ic_id, 
                parent_id: data.parent_id, 
                color: data.color, 
                name: data.name 
            }),
        timeout: 30000,
        success: function(response) {
            MakeSnackbar(response);
            SESSION["undo"] = true;

            // Multi
            if (o.length > 0) {
                Object.values(CHECKED).forEach((d) => {
                    if (g_view === VIEW_PL) {
                        // update background color
                        d.values.background
                            .transition()
                            .ease("ease")
                            .duration(500)
                            .style("fill", fill);

                        // update text color
                        d.values.object.selectAll(".text_front")
                            .transition()
                            .ease("ease-in-out")
                            .duration(500)
                            .style("fill", FlipColor(fill));
                    } else if (g_view === VIEW_GR) {
                        d.values.object.style.boxShadow = fill + " 0px 4px 0px";
                    }
                });
            } else {
                if (g_view === VIEW_PL) {
                    // update background color
                    data.values.background
                        .transition()
                        .ease("ease")
                        .duration(500)
                        .style("fill", fill);
    
                    // update text color
                    data.values.object.selectAll(".text_front")
                        .transition()
                        .ease("ease-in-out")
                        .duration(500)
                        .style("fill", FlipColor(fill));
                } else if (g_view === VIEW_GR) {
                    data.values.object.style.boxShadow = fill + " 0px 4px 0px";
                }
            }

            DeselectAllPlanets(g_project.current_ic);
            CreateTreeStructure();
            LoadStop();

        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                //
            }
        }
    });
}

function FlipColor(color) {
    color = color.substring(1); // strip #
    var rgb = parseInt(color, 16); // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff; // extract red
    var g = (rgb >> 8) & 0xff; // extract green
    var b = (rgb >> 0) & 0xff; // extract blue

    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    if (luma < 128) {
        return '#e8e8e8';
    } else {
        return '#303030';
    }
}

ApplyTheme();
function ApplyTheme(){
    let theme_object = GetThemeObject();

    let root = document.querySelector(":root");

    // Setting Theme Colors
    root.style.setProperty("--dashboard-text",  theme_object.dash_text);
    root.style.setProperty("--dashboard-bg",    theme_object.dash_bg);

    root.style.setProperty("--text-primary",    theme_object.text_primary);
    root.style.setProperty("--text-secondary",  theme_object.text_secondary);

    root.style.setProperty("--bg-primary",      theme_object.bg_primary);
    root.style.setProperty("--bg-secondary",    theme_object.bg_secondary);

    root.style.setProperty("--sidebar-bg",      theme_object.sidebar_bg);
    
    root.style.setProperty("--sun-bg",          theme_object.sun_bg);
    root.style.setProperty("--sun-text",        theme_object.sun_text);
    
    root.style.setProperty("--planet-bg",       theme_object.planet_bg);
    root.style.setProperty("--planet-text",     theme_object.planet_stroke);
    root.style.setProperty("--planet-stroke",   theme_object.planet_text);
}

// Get Light or Dark Colors Values + Get Stored Theme
function GetThemeObject() {
    let root = document.querySelector(":root");
    let docstyle = getComputedStyle(root);

    const light = {};
    const dark = {};

    // Light Theme Values
    light.dash_text =       getCol("--text-light");
    light.dash_bg =         getCol("--dashboard-bg-light");

    light.text_primary =    getCol("--text-dark");
    light.text_secondary =  getCol("--text-darker");
    
    light.bg_primary =      getCol("--bg-lighter");
    light.bg_secondary =    getCol("--bg-light");
    
    light.sidebar_bg =      getCol("--sidebar-bg-light");

    light.sun_bg =          getCol("--sun-bg-light");
    light.sun_text =        getCol("--sun-text-light");

    light.planet_bg =       getCol("--planet-bg-light");
    light.planet_text =     getCol("--planet-text-light");
    light.planet_stroke =   getCol("--planet-stroke-light");
    
    // Dark Theme Values
    dark.dash_text =        getCol("--text-dark");
    dark.dash_bg =          getCol("--dashboard-bg-dark");
    
    dark.text_primary =     getCol("--text-light");
    dark.text_secondary =   getCol("--text-lighter");

    dark.bg_primary =       getCol("--bg-darker");
    dark.bg_secondary =     getCol("--bg-dark");

    dark.sidebar_bg =       getCol("--sidebar-bg-dark");

    dark.sun_bg =           getCol("--sun-bg-dark");
    dark.sun_text =         getCol("--sun-text-dark");

    dark.planet_bg =        getCol("--planet-bg-dark");
    dark.planet_text =      getCol("--planet-text-dark");
    dark.planet_stroke =    getCol("--planet-stroke-dark");

    function getCol(v) {
        return docstyle.getPropertyValue(v);
    }
    
    let theme = window.localStorage.getItem('theme') || 'light';
    return (theme === "light") ? light : dark;
}

// Toggles Between Light and Dark Theme
function ToggleTheme() {
    let theme = window.localStorage.getItem('theme') || 'light';
    window.localStorage.setItem('theme', theme === 'light' ? "dark": "light");
    ApplyTheme();
}