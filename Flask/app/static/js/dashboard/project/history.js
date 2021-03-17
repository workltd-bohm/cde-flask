g_TypeUndo = {
    name: "Undo",
    icon: "replay",
    link: SubmitUndo,
};

g_TypeRecycle = {
    name: "Recycle",
    icon: "delete",
    link: function(d) {},
};

// -------------------------------------------------------

function DrawHistory(obj, data, type) {
    data.hist_path = {};
    data.hist_path.this = obj;
    data.hist_path.back = g_project.history;

    g_HistRadius = g_HistRadius * HISTORY_ORBIT_COEF;

    data.hist_path.this.attr("transform", "translate(" + (-g_HistRadius * HISTORY_TEXT_PADDING) + ", 0)");

    data.hist_path.object = data.hist_path.this.append("g").attr("class", "history draw");

    data.hist_path.undo = data.hist_path.object.append("foreignObject")
        .attr("x", -g_HistRadius / 2)
        .attr("y", -g_HistRadius / 2)
        .attr("width", g_HistRadius)
        .attr("height", g_HistRadius)

    data.hist_path.undo.append("xhtml:div")
        .attr("class", "history foregin picture")
        .append("i")
        .attr("class", "history material-icons picture")
        .style("font-size", g_HistRadius + "px")
        .html(type.icon)

    AddHistText(data, type.name, fix = true);

    data.hist_path.select = data.hist_path.object.append("circle")
        .attr("class", "history select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_HistRadius)
        .on("mouseup", function(d) {
            type.link(data);
        });

}

function SubmitUndo(data) {
    $.ajax({
        url: "/activate_undo",
        type: 'POST',
        timeout: 5000,
        success: function(data) {
            MakeSnackbar(data);
            CheckSession(); //GetProject();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            if ($jqXHR.status == 401) {
                // location.reload();
            }
        }
    });
}

function AddHistText(data, text, fix = false) {
    var newobj = data.hist_path;
    newobj.text = newobj.object.append("g")
        .attr("class", "hist_path text")
    newobj.text.append("text")
        .attr("class", "text_back")
        .attr("x", 0)
        .attr("y", g_HistRadius)
        .attr("transform", "rotate(" + (fix ? 0 : -g_root.deg) + ")")
        .html(text);
    newobj.text.append("text")
        .attr("class", "text_front")
        .attr("x", 0)
        .attr("y", g_HistRadius)
        .attr("transform", "rotate(" + (fix ? 0 : -g_root.deg) + ")")
        .html(text);
}

function AddUndo(data) {
    if (!g_project.history) {
        g_project.history = g_project.hist_path.append("g")
            .attr("class", "paths")
    }

    var d = data;
    DrawHistory(g_project.history, d, g_TypeUndo);
}

function AddRecycle(data) {
    if (!g_project.history) {
        g_project.history = g_project.hist_path.append("g")
            .attr("class", "paths")
    }

    var d = data;
    DrawHistory(g_project.history, d, g_TypeRecycle);
}

function HistoryCreation() {
    g_project.hist_path = SVG.append("g")
        .attr("id", "History")
        .attr("transform", "translate(" + (g_project.width) + "," + (g_PathRadius * HISTORY_ORBIT_COEF) + ")")

    if (SESSION["undo"])
        AddUndo(new Object);
}