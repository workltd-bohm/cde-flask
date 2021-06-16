// -------------------------------------------------------
function DrawPath(obj, data) {
    data.paths_path = {};
    data.paths_path.this = obj;
    data.paths_path.back = g_project.paths;
    data.paths_path.index = g_project.history_num++;
    data.paths_path.start = g_project.hist_path_len;

    //    console.log(g_project.hist_path_len, data.paths_path.start*PATH_TEXT_PADDING)
    data.paths_path.this.attr("transform", "translate(" + (data.paths_path.start * PATH_TEXT_PADDING) + ", 0)");

    data.paths_path.object = data.paths_path.this.append("g").attr("class", "path draw");

    // data.paths_path.picture = data.paths_path.object.append("circle")
    //     .attr("class", "path pattern")
    //     .attr("r", g_PathRadius);

    AddPathText(data, data.name, fix = true);

    data.paths_path.select = data.paths_path.object.append("rect")
        .attr("class", "path select")
        .attr("x", 0)
        .attr("y", -2 * PATH_TEXT_PADDING)
        .attr("width", g_project.hist_path_len * PATH_TEXT_PADDING)
        .attr("height", 3 * PATH_TEXT_PADDING)
        .on("mousedown", function(d) {
            ClickStart(function(data) {}, data);
        })
        .on("mouseup", function(d) {
            ClickStop(function(data) {
                if (g_project.search /*&& g_project.search.overlay_type == "ic"*/ ) g_project.search = false;
                g_project.paths = data.paths_path.back;
                g_project.hist_path_len = data.paths_path.start;
                data.paths_path.this.selectAll("g").remove();
                CreateWorkspace(data);
            }, data, true);
        });

    data.paths_path.child = data.paths_path.this.append("g").attr("class", "path next");
    g_project.paths = data.paths_path.child
}

function AddPathText(data, text, fix = false) {
    var newobj = data.paths_path;

    text = text.slice(0, PATH_TEXT_MAX_TEXT);
    if (text.length >= PATH_TEXT_MAX_TEXT)
        text = text.slice(0, PATH_TEXT_MAX_TEXT - 4) + "...";
    text = "/" + text;
    //    console.log(text.length, text)
    g_project.hist_path_len = text.length;

    newobj.text = newobj.object.append("g")
        .attr("class", "path text")
    var tmp = newobj.text.append("text")
        .attr("class", "path text_back")
        .attr("x", 0)
        .attr("y", 0)
        //.attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        .html(text);
    tmp = newobj.text.append("text")
        .attr("class", "path text_front")
        .attr("x", 0)
        .attr("y", 0)
        //.attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        .html(text);
}

function AddPath(data) {
    if (!g_project.paths) {
        g_project.paths = g_project.paths_path.append("g")
            .attr("class", "paths")
    }
    var d = data;
    DrawPath(g_project.paths, d);
}

// creates path group (obsolete)
function PathCreation() {
    g_project.hist_path_len = 0;
    g_project.paths_path = SVG.append("g")
        .attr("id", "Path")
        .attr("transform", "translate(" + (g_PathRadius * PATH_ORBIT_COEF) + "," + (g_project.height - g_PathRadius * PATH_ORBIT_COEF) + ")")
}

function GetDisplayName(ic) {
    // console.log(ic);
    switch(ic.overlay_type)
    {
        case "project":
        case "trash_planet":
        case "shared":
            return ic.name;
        
        case "search_target":
            return ic.path;

        default: break;
    }

    if (!SESSION.is_iso) {
        if (ic.is_directory) {
            return ic.name;
        }
        else {
            if (!ic.type) {
                return "";
            }
            return ic.name + ic.type;
        }
    }
    
    if (ic.is_directory)
        return ic.name;
    else {
        displayName = ['', '', '', '', '', '', '', '', '', ''];
        try {
            for (var i = 0; i < ic.tags.length; i++) {
                if (ic.tags[i].key == "project_code") {
                    t = ic.tags[i].tag;
                    if (t.startsWith('#'))
                        t = t.substring(1);
                    displayName[0] = t;
                }
                if (ic.tags[i].key == "company_code") {
                    t = ic.tags[i].tag;
                    if (t.startsWith('#'))
                        t = t.substring(1);
                    displayName[1] = t;
                }
                if (ic.tags[i].key == "project_volume_or_system") {
                    t = ic.tags[i].tag.split(',')[0];
                    if (t.startsWith('#'))
                        t = t.substring(1);
                    displayName[2] = t;
                }
                if (ic.tags[i].key == "project_level") {
                    t = ic.tags[i].tag.split(',')[0];
                    if (t.startsWith('#'))
                        t = t.substring(1);
                    displayName[3] = t;
                }
                if (ic.tags[i].key == "type_of_information") {
                    t = ic.tags[i].tag.split(',')[0];
                    if (t.startsWith('#'))
                        t = t.substring(1);
                    displayName[4] = t;
                }
                if (ic.tags[i].key == "role_code") {
                    t = ic.tags[i].tag.split(',')[0];
                    if (t.startsWith('#'))
                        t = t.substring(1);
                    displayName[5] = t;
                }
                if (ic.tags[i].key == "file_number") {
                    t = ic.tags[i].tag.split(',')[0];
                    if (t.startsWith('#'))
                        t = t.substring(1);
                    displayName[6] = t;
                }
                if (ic.tags[i].key == "status") {
                    t = ic.tags[i].tag.split(',')[0];
                    if (t.startsWith('#'))
                        t = t.substring(1);
                    displayName[7] = t;
                }
                if (ic.tags[i].key == "revision") {
                    t = ic.tags[i].tag.split(',')[0];
                    if (t.startsWith('#'))
                        t = t.substring(1);
                    displayName[8] = t;
                }
                if (ic.tags[i].key == "uniclass_2015") {
                    t = ic.tags[i].tag;
                    if (t.startsWith('#'))
                        t = t.substring(1);
                    displayName[9] = t;
                }
            }
            if (displayName[9] == '')
                displayName.pop()
            isProper = true;
            for (var j = 0; j < displayName.length; j++) {
                if (displayName[j] == '') {
                    isProper = false;
                    break;
                }
            }
            if (isProper)
                return displayName.join('-') + '_' + ic.name + ic.type;
            else
                return ic.name + ic.type
        } catch {
            return ic.name + ic.type;
        }
    }
}

function CreateDisplayName() {
    // reset
    ClearDisplayName();

    // singleton
    if (document.getElementById("display_name")) {
        g_project.display_name = d3.select("#display_name")
        return;
    }

    // create SVG with display name text
    g_project.display_name = SVG.append("text")
        .attr("id", "display_name")
        .attr("transform", "translate(" + (g_root.x) + ", " + (g_root.y + g_project.height_h - g_PathRadius * PATH_ORBIT_COEF) + ")");
}

function SetDisplayName(string) {
    if (InstanceExists(g_project.display_name))
        g_project.display_name.text(string);
}

function ClearDisplayName() {
    if (InstanceExists(g_project.display_name))
        g_project.display_name.text("");
}

function CreatePath() {
    // Topbar path
    $(".info-path-text").empty();

    if (SESSION.position) {
        found = RecursiveFileSearch(g_project.data, g_project.data);
        if (found) {
            var path = found[0].reverse();

            // Add current ic to the list
            path.push(g_project.current_ic);

            // Add Link For Projects (Root)
            let projects_link = document.createElement("span");
            projects_link.className = "path-link";
            projects_link.textContent = "Projects";
            projects_link.onclick = function(){
                SelectProject();
            }
            $(".info-path-text").append(projects_link);
            let slash = document.createElement("span");
            slash.className = "mx-2";
            slash.textContent = "/";
            $(".info-path-text").append(slash);

            // Add Path Links
            for (let add of path) {
                add.box = {...g_box };
                add.values = {...add.values };

                let span = document.createElement("span");
                span.className = "path-link";
                span.textContent = add.name;

                $(".info-path-text").append(span);

                if (add === g_project.current_ic) {
                    span.classList.remove("path-link");
                    span.classList.add("path-name")
                    continue;
                }

                span.onclick = function() {
                    if (g_project.search /*&& g_project.search.overlay_type == "ic"*/ ) g_project.search = false;
                    add.paths_path = {}
                    add.paths_path.back = g_project.paths;
                    g_project.paths = add.paths_path.back;
                    g_project.hist_path_len = add.paths_path.start;
                    CreateWorkspace(add);
                }

                let slash = document.createElement("span");
                slash.className = "mx-2";
                slash.textContent = "/";
                $(".info-path-text").append(slash);
            }

            // Clamping Links To Fit
            if ($(".info-path-text").width() > $(".info-path").width()) {
                // Display First (Projects) , Last, Second, Second Last, etc.
                let n_items = $(".path-link").length;
                let handlerFunction;
                let removedAtLeastOne = false;
                for (let i = 2; i < n_items-1; i++)
                {
                    // Exit If Removal Is Not Needed
                    if ($(".info-path-text").width() < $(".info-path").width()) {
                        break;
                    }

                    // Change The Text Of Last Item To ...
                    // So That The User Can Click On It &
                    // Go To The "Middle" Folder
                    // if (!removedAtLeastOne) {
                    //     document.getElementsByClassName("path-link")[i].textContent = "...";
                    //     i = 1;    // Loop Will Increment After This
                    //     n_items = $(".path-link").length;
                    //     continue;
                    // }

                    // Remove Link
                    $(".path-link")[i].remove();
                    $("span.mx-2")[i].remove();
                    removedAtLeastOne = true;

                    // Reset/Update The Loop
                    i = 1;    // Loop Will Increment After This
                    n_items = $(".path-link").length;
                }
                
                // Add ellipsis to indicate there are things in between
                if (removedAtLeastOne) {
                    let ellipsis = document.createElement("span");
                    ellipsis.textContent = "...";
                    $(ellipsis).click(handlerFunction);
                    let slash = document.createElement("span");
                    slash.className = "mx-2";
                    slash.textContent = "/";
                    $(".info-path span.mx-2")[1].after(ellipsis, slash);
                }
            }
        }
    }
}
// -------------------------------------------------------