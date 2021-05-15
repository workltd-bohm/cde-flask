// -------------------------------------------------------

g_OverNone = []

g_OverUser = []

/* SUNs */
g_OverProjectRoot = [
    { name: "NEW PROJECT",      icon: "create_new_folder",  link: WrapNewProject },
    { name: "UPLOAD PROJECT",   icon: "cloud_upload",       link: WrapUploadProject }
]

g_OverProject = [
    { name: "UPLOAD",           icon: "arrow_circle_up",            link: WrapCreateFile },
    { name: "NEW",              icon: "create_new_folder",          link: WrapCreateFolder },
    { name: "DOWNLOAD",         icon: "cloud_download",             link: WrapDownload },
];

g_OverFolder = [
    { name: "UPLOAD",       icon: "arrow_circle_up",    link: WrapCreateFile },
    { name: "NEW",          icon: "create_new_folder",  link: WrapCreateFolder },
    { name: "DOWNLOAD",     icon: "cloud_download",     link: WrapDownload },
    { name: "SHARE",        icon: "share",              link: WrapShare },
];

g_OverFile = [
    { name: "PREVIEW",  icon: "preview",            link: WrapOpenFile },
    { name: "UPLOAD",   icon: "arrow_circle_up",    link: WrapCreateFile },
    { name: "SHARE",    icon: "share",              link: WrapShare },
    { name: "DOWNLOAD", icon: "cloud_download",     link: WrapDownload },
];

/* PLANETs */
g_OverProjectPlanet = [
    { name: "DOWNLOAD",         icon: "cloud_download",             link: WrapDownload },
    { name: "RENAME",           icon: "create",                     link: WrapRename },
    { name: "COLOR",            icon: "color_lens",                 link: ChangeColor },
    { name: "TRASH",            icon: "delete",                     link: WrapTrash },
];

g_OverFolderPlanet = [
    { name: "DETAILS",  icon: "preview",        link: WrapOpenFile },
    { name: "DOWNLOAD", icon: "cloud_download", link: WrapDownload },
    { name: "RENAME",   icon: "create",         link: WrapRename },
    { name: "COPY",     icon: "content_copy",   link: WrapCopy },
    { name: "MOVE",     icon: "open_with",      link: WrapMove },
    { name: "SHARE",    icon: "share",          link: WrapShare },
    { name: "COLOR",    icon: "color_lens",     link: ChangeColor },
    { name: "TRASH",    icon: "delete",         link: WrapTrash },
];

g_OverFilePlanet = [
    { name: "PREVIEW",  icon: "preview",        link: WrapOpenFile },
    { name: "DOWNLOAD", icon: "cloud_download", link: WrapDownload },
    { name: "RENAME",   icon: "create",         link: WrapRename },
    { name: "COPY",     icon: "content_copy",   link: WrapCopy },
    { name: "MOVE",     icon: "open_with",      link: WrapMove },
    { name: "SHARE",    icon: "share",          link: WrapShare },
    { name: "COLOR",    icon: "color_lens",     link: ChangeColor },
    { name: "TRASH",    icon: "delete",         link: WrapTrash },
];

g_OverSearch = [
    { name: "GO TO FOLDER", icon: "open_with", link: SearchOpen },
];

g_OverTrash = [
    { name: "EMPTY", icon: "delete_sweep", link: WrapEmptyTrash },
];

g_OverPlanetTrash = [
    { name: "RESTORE",  icon: "restore_from_trash", link: WrapRestore },
    { name: "DESTROY",  icon: "delete",             link: WrapDelete }
];

g_OverMarket = [
    { name: "MY POSTS", icon: "view_headline",  link: WrapMarketGetPosts }, //WrapNewPost
    { name: "MY BIDS",  icon: "view_list",      link: WrapMarketGetBids },
    { name: "NEW POST", icon: "addchart",       link: WrapNewPost },
];

g_OverPost = [
    { name: "NEW POST", icon: "create_new_folder", link: WrapNewPost }, //WrapNewPost
    // { name: "ALL POSTS", icon: "preview", link: WrapOpenFile },
];

g_OverBid = [
    { name: "ALL POSTS", icon: "preview", link: WrapAllPost },
];
// -------------------------------------------------------

function OverlayCreate(obj, data, parent, planet = false) {
    data.overlay = {};
    data.overlay.this = obj;
    data.overlay.back = parent;

    var type = g_OverNone;
    switch (data.overlay_type) {
        case "ic":
            type = data.values.sun ? data.is_directory ? g_OverFolder : g_OverFile : () => { return; };
            break;
        case "user":
            type = g_OverUser;
            break;
        case "project_root":
            type = g_OverProjectRoot;
            break;
        case "search_target":
            type = g_OverSearch;
            break;
        case "trash":
            type = g_OverTrash;
            break;
        case "trash_planet":
            type = g_OverPlanetTrash;
            break;
        case "market":
            type = g_OverMarket;
            break;
        case "posts":
            type = g_OverPost;
            break;
        case "bids":
            type = g_OverBid;
            break;
        default:
            break;
    }
    if (type.length == 0) {
        OverlayDestroy();
        data.overlay = false;
        return;
    }

    if (planet) {
        if (data.overlay_type != "trash_planet") {
            type = [];
            for (let i = 0; i < g_OverPlanet.length; i++) {
                type.push({...g_OverPlanet[i] });
            }
        }
        if (data.checked) type[0].icon = "check_circle_outline";
    }

    data.values.text.style("opacity", 0);
    data.overlay.items = type.slice();

    // create an overlay group
    data.overlay.object = data.values.this.append("g")
        .attr("class", "star overlay");

    if (!data.values.sun) data.overlay.object.attr("transform", "rotate(" + (-g_root.deg) + ")");
    if (!data.values.sun) g_OverlayRadius = g_PlanetRadius * OVERLAY_SELECT_PLANET_RATIO;
    else g_OverlayRadius = g_SunRadius;

    //// [SLIDER START]
    if (g_root.slider && data.values.sun) {
        data.overlay.object
            .attr("transform", "translate(" + (-g_SunRadius * SUN_SCROLL_X_SUN_OFFS) + ", " + (-g_SunRadius * SUN_SCROLL_Y_SUN_OFFS) + ")");
    }
    //// [SLIDER END]

    g_OverlayItemSize = g_OverlayRadius / OVERLAY_SUN_RATIO;
    g_project.overlay = data.overlay.object; // set global variable to point to this group

    // var pie = d3.layout.pie().sort(null);
    // var arc = d3.svg.arc().innerRadius(g_OverlayRadius).outerRadius(g_OverlayRadius*1.5);
    // data.overlay.object.datum([1])
    //     .selectAll("path")
    //     .data(pie)
    //     .enter()
    //     .append("path")
    //     .attr("d", arc)
    //     .attr("class","overlay pattern")
    // append this group with a pattern (dark color)
    data.overlay.object.append("circle")
        .attr("class", "overlay pattern")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_OverlayRadius);

    data.overlay.object.append("circle")
        .attr("class", "overlay select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_OverlayRadius * OVERLAY_SELECT_RATIO)
        .on("mouseleave", function(d) {
            //console.log(Math.abs(d3.mouse(this)[0])+Math.abs(d3.mouse(this)[1])+" "+g_OverlayRadius)
            if (Math.abs(d3.mouse(this)[0]) + Math.abs(d3.mouse(this)[1]) >= g_OverlayRadius * OVARLAY_DESELECT_RATIO) { // TODO FIX
                data.values.text.style("opacity", 100);
                g_project.overlay.remove();
                g_project.overlay = false;
            }

            ClearDisplayName();
        })
        .on("mousedown", function(d) {
            if (!data.values.sun) ClickStart(function(d) {}, data);
        })
        .on("click", function(d) {
            if (!data.values.sun) {
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
                    ClickStop(function(data) {
                        data.values.text.style("opacity", 100);
                        g_project.overlay.remove();
                        g_project.overlay = false;
                        func(data);
                    }, data, true);
                }
            }
        })
        .on("contextmenu", function(d) {
            CreateContextMenu(d3.event, d);
        });

    AddOverText(data, obj = true, name = false);

    data.overlay.children = data.overlay.object.append("g")
        .attr("class", "overlay items")

    if (data.parent_id != "root") {
        for (var i = 0; i < data.overlay.items.length; i++) {
            if (data.overlay.items[i].name == "SHARE PROJECT") {
                data.overlay.items.splice(i, 1);
                break;
            }
        }
    }

    data.overlay.children.selectAll("g")
        .data(data.overlay.items)
        .enter()
        .append("g")
        .attr("class", "item")
        .each(function(d, i) { AddItem(d3.select(this), d, data, i); });
}

function OverlayDestroy() {
    if (g_project.overlay) {
        g_project.overlay.remove();
        g_project.overlay = false;
    }
}

function AddItem(obj, data, parent, position = 0) {
    data.box = {...g_box };
    data.values = {};
    data.values.this = obj;
    data.values.data = parent;
    data.values.back = parent.overlay;

    data.values.rotation = position * 360 / data.values.back.items.length - 90;

    if (!data.values.data.values.sun) {
        g_OverlayItemSize = g_SunRadius / OVERLAY_PLANET_RATIO * .8;
        g_OverlayRadius = g_PlanetRadius + .5 * (g_OverlayItemSize + OVERLAY_PLANET_MARGIN);
    }

    // if (data.values.sun)
    // {
    //     g_OverlayItemSize = g_SunRadius / OVERLAY_SUN_RATIO;
    //     g_OverlayRadius = g_PlanetRadius + g_OverlayItemSize + OVERLAY_SUN_MARGIN;
    // } else {
    //     g_OverlayItemSize = g_SunRadius / OVERLAY_PLANET_RATIO;
    //     g_OverlayRadius = g_PlanetRadius + g_OverlayItemSize + OVERLAY_PLANET_MARGIN;
    // }

    let margin = data.values.data.values.sun ? OVERLAY_SUN_MARGIN : OVERLAY_PLANET_MARGIN;

    data.values.this.attr("transform", "rotate(" + (data.values.rotation) + "), translate(" + (g_OverlayRadius - g_OverlayItemSize - margin) + ", 0), rotate(" + (-data.values.rotation) + ")");

    // data.item.picture = data.values.this.append("circle")
    //     .attr("class", "pattern overlay")
    //     .attr("r", g_OverlayItemSize)

    data.values.picture = data.values.this.append("foreignObject")
        .attr("x", -g_OverlayItemSize / 2)
        .attr("y", -g_OverlayItemSize / 2)
        .attr("width", g_OverlayItemSize)
        .attr("height", g_OverlayItemSize)
        .append("xhtml:div")
        .attr("class", "item foregin");


    var defaultColor = null; //$(".foregin .material-icons .planet").css("color");
    if (data.values.data.color && data.values.data.values.sun) defaultColor = data.values.data.color;

    var tmp = data.values.picture.append("i")
        .attr("class", "item material-icons" + ((data.values.data.values.sun) ? " sun" : " planet"))
        .style("font-size", g_OverlayItemSize + "px")
        .html(data.icon);

    if (defaultColor) tmp.style("color", defaultColor)

    data.values.select = data.values.this.append("circle")
        .attr("class", "item select")
        // .attr("id", data.link)
        .attr("r", g_OverlayItemSize / 2)
        .on("mouseover", function(d) {
            data.values.back.text.selectAll("text").html(data.name);
        })
        .on("mouseleave", function(d) {
            data.values.back.text.selectAll("text").html("");
            //console.log(Math.abs(d3.mouse(this)[0])+Math.abs(d3.mouse(this)[1])+" "+g_OverlayRadius)
            //if(Math.abs(d3.mouse(this)[0])+Math.abs(d3.mouse(this)[1]) >= g_OverlayRadius*OVARLAY_DESELECT_RATIO){ // TODO FIX
            // if (d3.mouse(this)[0] >= divRect.left && event.clientX <= divRect.right &&
            //     event.clientY >= divRect.top && event.clientY <= divRect.bottom) {
            if (data.name != "COLOR") {
                parent.values.text.style("opacity", 100);
                g_project.overlay.remove();
                g_project.overlay = false;
            }
            //}
        })
        .on("mousedown", function(d) {
            // ClickStart(function(data){
            //     // NONE
            // }, data);
        })
        .on("mouseup", function(d) {
            // ClickStop(function(data){
            //     // NONE
            //     //console.log("click")
            // }, data);
            data.link(data);
        });

}

function AddOverText(data, fix = false) {
    var newobj = data.overlay;
    newobj.text = newobj.object.append("g")
        .attr("class", "overlay text")
    newobj.text.append("text")
        .attr("class", "text_back")
        .attr("x", 0)
        .attr("y", 0)
        .attr("transform", "rotate(" + (fix ? 0 : -g_root.deg) + ")")
        .html("");
    newobj.text.append("text")
        .attr("class", "text_front")
        .attr("x", 0)
        .attr("y", 0)
        .attr("transform", "rotate(" + (fix ? 0 : -g_root.deg) + ")")
        .html("");
}

function CreateUndoMenu(){
    let undo_menu = document.createElement("a");
    undo_menu.className = "hover-menu-item px-3 py-2 mt-3";
    undo_menu.id = "btn-undo";
    
    // let button = document.createElement("a");
    // button.className = "btn-undo";

    let icon = document.createElement("span");
    icon.className = "material-icons";
    icon.textContent = "undo";

    let text = document.createElement("span");
    text.className = "me-1"
    text.textContent = "Undo";

    undo_menu.appendChild(text);
    undo_menu.appendChild(icon);
    // undo_menu.appendChild(button);

    undo_menu.addEventListener("click", function() {
        SubmitUndo(g_project.history);
    });

    $(".hover-menu").append(undo_menu);
}

function CreateSortMenu() {
    let sort_menu = document.createElement("a");
    sort_menu.className = "hover-menu-item px-3 py-2 mt-3";
    sort_menu.id = "btn-sort";

    // let button = document.createElement("a");
    // button.className = "btn-sort";

    let icon = document.createElement("span");
    icon.className = "material-icons";
    icon.textContent = "sort";

    let text = document.createElement("span");
    text.className = "me-1"
    text.textContent = "Sort";

    sort_menu.appendChild(text);
    sort_menu.appendChild(icon);

    sort_menu.onclick = function(event) {
        $(event.target
                .closest(".hover-menu-item")
                .querySelector(".hover-dropdown"))
            .toggleClass("d-none");
    }

    // add button to sort-menu
    // sort_menu.appendChild(button);

    let dropdown = document.createElement("div");
    dropdown.className = "hover-dropdown d-none";

    // by alphabet option
    let menu_item = document.createElement("a");
    menu_item.className = "mt-2";

    icon = document.createElement("span");
    icon.className = "material-icons";
    icon.textContent = "sort_by_alpha";

    text = document.createElement("span");
    text.className = "ms-1"
    text.textContent = "By name";

    menu_item.appendChild(icon);
    menu_item.appendChild(text);

    menu_item.onclick = function() {
        SortByName(g_project.current_ic);
    }

    dropdown.appendChild(menu_item);

    // by date option
    menu_item = document.createElement("a");
    menu_item.className = "mt-2";

    icon = document.createElement("span");
    icon.className = "material-icons";
    icon.textContent = "schedule";

    text = document.createElement("span");
    text.className = "ms-1"
    text.textContent = "By date";

    menu_item.appendChild(icon);
    menu_item.appendChild(text);

    menu_item.onclick = function() {
        SortByDate(g_project.current_ic);
    }

    dropdown.appendChild(menu_item);

    // add dropdown to sort-menu
    sort_menu.appendChild(dropdown);

    $(".hover-menu").append(sort_menu);
}

function SortByName(data) {
    if (data.sub_folders.length <= 1) {
        MakeSnackbar("Nothing to sort");
        return;
    }

    let items = data.sub_folders;
    let item_tmp;
    for (let i = 0; i < items.length - 1; i++) {
        for (let j = i + 1; j < items.length; j++) {
            let str1 = items[j].name.toLowerCase();
            let str2 = items[i].name.toLowerCase();
            
            let parsed1 = parseInt(items[j].name);
            let parsed2 = parseInt(items[i].name);
            
            let sorted;

            // if both are numbers
            if (!isNaN(parsed1) && !isNaN(parsed2)) {
                sorted = (parsed1 < parsed2)

                if (sorted) {
                    item_tmp = items[j]; // store
                    items.splice(j, 1); // remove j'th element
                    items.splice(i, 0, item_tmp); // replace element
                    i = 0; // reset loop
                    continue;
                }
                // if parsed numbers are the same, compare them alphabetically
                else if (parsed1 === parsed2) {
                    sorted = str1.localeCompare(str2);
                
                    if (sorted === -1) { // -1 = str1 is sorted before str2
                        item_tmp = items[j]; // store
                        items.splice(j, 1); // remove j'th element
                        items.splice(i, 0, item_tmp); // replace element
                        i = 0; // reset loop
                        continue;
                    }
                }
            } 
            // if both are strings or one of them is a number
            else if ((isNaN(parsed1) && isNaN(parsed2)) || (isNaN(parsed1) && !isNaN(parsed2)) || (!isNaN(parsed1) && isNaN(parsed2))) 
            {
                sorted = str1.localeCompare(str2);
                
                if (sorted === -1) { // -1 = str1 is sorted before str2
                    item_tmp = items[j]; // store
                    items.splice(j, 1); // remove j'th element
                    items.splice(i, 0, item_tmp); // replace element
                    i = 0; // reset loop
                    continue;
                }
            } 
        }
    }

    CreateWorkspace(data);

    MakeSnackbar("Items sorted alphabetically.");
}

function SortByDate(data) {
    if (data.sub_folders.length <= 1) 
    {
        MakeSnackbar("Nothing to sort");
        return;
    }

    // local function will parse the date from history of creation in data values
    function parseDate(objdate) 
    {
        let date_time = objdate.split("-");
        let date = date_time[0].split(".");
        let time = date_time[1].split(":");

        let y = date[2];
        let m = date[1];
        let d = date[0];

        let h = time[0];
        let mn= time[1];
        let s = time[2];
        
        return new Date(y, m, d, h, mn, s);
    }

    let items = data.sub_folders;

    // for each sub folder, add date object
    items.forEach((item) => {
        item.date = parseDate(item.history[0].date);
    })
    
    // use the date object to sort items
    items.sort((a, b) => a.date - b.date);

    // create the workspace with sorted items
    CreateWorkspace(data);

    MakeSnackbar("Items sorted by date of creation.");
}

function CreateSelectMenu() {
    let select_menu = document.createElement("a");
    select_menu.className = "hover-menu-item px-3 py-2 mt-3";

    // let button_select = document.createElement("a");
    // button_select.className = "btn-select-all";

    let checkbox = document.createElement("input");
    checkbox.id = "select-all";
    checkbox.name = "select-all";
    checkbox.type = "checkbox";

    let label = document.createElement("label");
    label.className = "me-2";
    label.id = "select-all-label";
    label.htmlFor = "select-all";
    label.textContent = "Select all";
    label.style.cursor = "pointer";

    // simulate label click
    checkbox.onclick = function(){
        label.click();
    }

    select_menu.appendChild(label);
    select_menu.appendChild(checkbox);

    // select_menu.appendChild(button_select);

    select_menu.onclick = function() {
        // simulate label click
        let lbl = document.getElementById("select-all-label");
        lbl.click();

        let checked = document.getElementById("select-all").checked;

        if (checked) {
            SelectAllPlanets(g_project.current_ic);
            lbl.textContent = "Deselect";
        } else {
            DeselectAllPlanets(g_project.current_ic);
            lbl.textContent = "Select all";
        }
    }

    // When Preserving Selection - Change The Looks Of The Checkbox
    let num_checked = Object.keys(CHECKED).length;
    checkbox.checked = Boolean(num_checked);
    checkbox.indeterminate = Boolean(num_checked > 0 && num_checked < g_project.current_ic.sub_folders.length);
    label.textContent = (num_checked > 0) ? "Deselect" : "Select all";

    $(".hover-menu").append(select_menu);
}

function CreateMenu(event, data, type)
{
    // create the new create wrapper
    let wrap = document.createElement("div");
    wrap.className = "create-menu-wrapper";

    let menu = document.createElement("div");
    menu.className = "create-menu";

    // fill the menu with items
    for (let item of type) {
        // create new item on the menu
        let new_item = document.createElement("div");
        new_item.className = "create-menu-item";

        // create icon for the new item
        let icon = document.createElement("span");
        icon.className = "create-menu-item-icon material-icons";
        icon.textContent = item.icon;

        // create name of the new item
        let name = document.createElement("span");
        name.className = "create-menu-item-name ms-2 me-5";
        name.textContent = item.name.toLowerCase();

        /* used for animated background on hover */
        let bg = document.createElement("div");
        bg.className = "create-menu-item-bg";
        bg.innerHTML = "&nbsp;";

        // attach icon, name, bg and event to menu-item 
        new_item.appendChild(icon);
        new_item.appendChild(name);
        new_item.appendChild(bg);

        // hack the data for the function to work
        data.values.data = data;

        // attach the item's function to this item
        new_item.addEventListener("click", () => {
            item.link(data);

            // Destroy The Menu
            $(".create-menu-wrapper").remove();
        });

        // finally, add the item we've generated to the context-menu list
        menu.appendChild(new_item);
    }

    // add the menu to the wrapper
    wrap.appendChild(menu);

    // get position of the mouse
    let mouse = {
        x: event.clientX - $(".sidebar").outerWidth(),
        y: event.clientY - $(".topbar").height()
    };

    // set the position of context menu
    let offset = 24;
    wrap.style.left = mouse.x + offset + "px";
    wrap.style.top = mouse.y + "px";

    // destroy
    wrap.onmouseleave = function () {
        $(".create-menu-wrapper").remove();
    }

    // remove existing and add new context menu to the screen
    $(".create-menu-wrapper").remove();
    $(".workspace").append(wrap);

    // prevent from going off screen
    // element must be rendered first
    let width = $(wrap).outerWidth();
    let height = $(wrap).outerHeight();
    let offX = parseInt(wrap.style.left);
    let offY = parseInt(wrap.style.top);
    let wsWidth = parseInt($WS.outerWidth());
    let wsHeight = parseInt($WS.outerHeight());

    if (offY + height > wsHeight) {
        wrap.style.top = (wsHeight - height) + "px";
    }

    if (offX + width > wsWidth) {
        wrap.style.left = (wsWidth - width) + "px";
    }
}

function CreateContextMenu(event, data) {
    // get the type of context menu (using ic type)
    let type = GetContextType(data);

    // exit if non-applicable
    if (!type) { return; }

    // create the new context wrapper
    let wrap = document.createElement("div");
    wrap.className = "context-menu-wrapper";

    let menu = document.createElement("div");
    menu.className = "context-menu";

    // fill the menu with items
    for (let item of type) {
        // create new item on the menu
        let new_item = document.createElement("div");
        new_item.className = "context-menu-item";

        // create icon for the new item
        let icon = document.createElement("span");
        icon.className = "context-menu-item-icon material-icons";
        icon.textContent = item.icon;

        // create name of the new item
        let name = document.createElement("span");
        name.className = "context-menu-item-name ms-2 me-5";
        name.textContent = item.name.toLowerCase();

        /* used for animated background on hover */
        let bg = document.createElement("div");
        bg.className = "context-menu-item-bg";
        bg.innerHTML = "&nbsp;";

        // attach icon, name, bg and event to menu-item 
        new_item.appendChild(icon);
        new_item.appendChild(name);
        new_item.appendChild(bg);

        // hack the data for the function to work
        data.values.data = data;

        // attach the item's function to this item
        new_item.addEventListener("click", () => {
            item.link(data);
        });

        // finally, add the item we've generated to the context-menu list
        menu.appendChild(new_item);
    }

    // add the menu to the wrapper
    wrap.appendChild(menu);

    // get position of the mouse
    let mouse = {
        x: event.clientX - $(".sidebar").outerWidth(),
        y: event.clientY - $(".topbar").height()
    };

    // set the position of context menu
    wrap.style.left = mouse.x + "px";
    wrap.style.top = mouse.y + "px";

    // remove existing and add new context menu to the screen
    $(".context-menu-wrapper").remove();
    $(".workspace").append(wrap);

    console.log($(".context-menu-wrapper"))
    // prevent from going off screen
    // element must be rendered first
    let width = $(wrap).outerWidth();
    let height = $(wrap).outerHeight();
    let offX = parseInt(wrap.style.left);
    let offY = parseInt(wrap.style.top);
    let wsWidth = parseInt($WS.outerWidth());
    let wsHeight = parseInt($WS.outerHeight());

    if (offY + height > wsHeight) {
        wrap.style.top = (wsHeight - height) + "px";
    }

    if (offX + width > wsWidth) {
        wrap.style.left = (wsWidth - width) + "px";
    }
}

function CreateViewMenu() {
    let view_menu = document.createElement("a");
    view_menu.className = "hover-menu-item px-3 py-2 mt-3";
    view_menu.id = "btn-view";

    // button
    // let button = document.createElement("a");
    // button.className = "btn-view";

    // button icon
    let icon = document.createElement("span");
    icon.className = "material-icons";
    icon.textContent = "remove_red_eye";

    // button text
    let text = document.createElement("span");
    text.className = "me-1"
    text.textContent = "View";

    view_menu.appendChild(text);
    view_menu.appendChild(icon);

    view_menu.onclick = function(event) {
        // $(event.target
        //         .closest(".hover-menu-item")
        //         .querySelector(".hover-dropdown"))
        //     .toggleClass("d-none");
        ToggleViewMode();
    }

    // add button to view-menu
    // view_menu.appendChild(button);

    // create dropdown
    // let dropdown = document.createElement("div");
    // dropdown.className = "hover-dropdown d-none";

    /* options */

    // > planetary option
    // create button
    // let menu_item = document.createElement("a");
    // menu_item.className = "mt-2";

    // // button icon
    // icon = document.createElement("span");
    // icon.className = "material-icons";
    // icon.textContent = "wb_sunny";

    // // button text
    // text = document.createElement("span");
    // text.className = "ms-1"
    // text.textContent = "Planetary";

    // menu_item.appendChild(icon);
    // menu_item.appendChild(text);

    // menu_item.onclick = function() {
    //     ToggleViewMode();
    // }

    // dropdown.appendChild(menu_item);

    // // grid option
    // menu_item = document.createElement("a");
    // menu_item.className = "mt-2";

    // // grid icon
    // icon = document.createElement("span");
    // icon.className = "material-icons";
    // icon.textContent = "view_comfy";

    // // grid text
    // text = document.createElement("span");
    // text.className = "ms-1"
    // text.textContent = "Grid";

    // menu_item.appendChild(icon);
    // menu_item.appendChild(text);

    // menu_item.onclick = function() {
    //     g_view = VIEW_GR;
    //     CreateWorkspace(g_project.current_ic);
    // }

    // dropdown.appendChild(menu_item);

    // // add dropdown to sort-menu
    // view_menu.appendChild(dropdown);

    $(".hover-menu").append(view_menu);
}

function CreateNewMenu() {
    let button_create = document.createElement("a");
    button_create.className = "hover-menu-item px-3 py-2 mt-3";

    let span = document.createElement("span");
    span.innerHTML = "Create &#9654;";

    button_create.appendChild(span);

    button_create.onclick = function (e) {
        type = GetContextType(g_project.current_ic);

        // Make A Copy Of OverFile Object, To Remove First Option
        if (type === g_OverFile) {
            type = g_OverFile.slice();
            type.shift();
        }

        CreateMenu(e, g_project.current_ic, type);
    }

    $(".hover-menu").prepend(button_create);
}

function CreatePreviewMenu() {
    let button_preview = document.createElement("a");
    button_preview.className = "hover-menu-item px-3 py-2 mt-3";
    
    // text
    let span = document.createElement("span");
    span.textContent = "Preview";
    span.className = "me-1";

    button_preview.appendChild(span);

    // icon
    span = document.createElement("span");
    span.className = "material-icons";
    span.textContent = "preview";

    button_preview.appendChild(span);

    button_preview.onclick = function (e) {
        WrapOpenFile(g_project.current_ic);
    }

    $(".hover-menu").prepend(button_preview);
}

function CreateActionMenu()
{
    RemoveActionMenu();

    let button_preview = document.createElement("a");
    button_preview.className = "hover-menu-item btn-action px-3 py-2 mt-3";
    
    // text
    let span = document.createElement("span");
    span.textContent = "Action";
    span.className = "me-1";

    button_preview.appendChild(span);

    // icon
    span = document.createElement("span");
    span.className = "material-icons";
    span.textContent = "category";

    button_preview.appendChild(span);

    button_preview.onclick = function (e) {
        CreateMenu(e, g_project.current_ic, g_OverSelect);
    }

    $(".hover-menu").prepend(button_preview);
}

function RemoveActionMenu()
{
    $(".btn-action").remove();
}

function GetContextType(data) {
    let type = data.overlay_type;
    switch (type) {
        case "ic":
            type = data.values.sun ? data.is_directory ? data.parent === '.' ? 
                g_OverProject : g_OverFolder : g_OverFile : 
                    data.is_directory ? g_OverFolderPlanet : g_OverFilePlanet;
            break;
        case "user":
            type = g_OverUser;
            break;
        case "project_root":
            type = g_OverProjectRoot;
            break;
        case "project":
            type = data.values.sun ? g_OverProject : g_OverProjectPlanet;
            break;
        case "search_target":
            type = g_OverSearch;
            break;
        case "trash":
            type = g_OverTrash;
            break;
        case "trash_planet":
            type = g_OverPlanetTrash;
            break;
        case "market":
            type = g_OverMarket;
            break;
        case "posts":
            type = g_OverPost;
            break;
        case "bids":
            type = g_OverBid;
            break;
        default:
            type = false;
            break;
    }
    
    // switch(type) {
    //     case g_OverFilePlanet:
    //     case g_OverFolderPlanet:
    //     case g_OverProjectPlanet:
    //         let g_OverTemp = type.slice();
    //         let deselect = { name: "DESELECT", icon: "check_circle_outline", link: SelectPlanet };
    //         g_OverTemp[0] = data.values.data.checked ? deselect : g_OverTemp[0];
    //         return g_OverTemp;
    //     default:
    //     }
    return type;
}

function ToggleViewMode(){
    // Toggle Between Views
    g_view = g_view === VIEW_PL ? VIEW_GR : VIEW_PL;

    // Store View Mode In Session
    SESSION.view = g_view;

    // Preserve Checked Ics
    if (Object.keys(CHECKED).length) {
        CHECKED["SAVE"] = true;
    }

    // Create Workspace With New View
    CreateWorkspace(g_project.current_ic);
}
// -------------------------------------------------------