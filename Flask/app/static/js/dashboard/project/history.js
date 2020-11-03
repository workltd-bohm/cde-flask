
// -------------------------------------------------------

function DrawUndo(obj, data){
    data.hist_path = {};
    data.hist_path.this = obj;
    data.hist_path.back = g_project.history;

    g_HistRadius = g_HistRadius*HISTORY_ORBIT_COEF;

    data.hist_path.this.attr("transform","translate("+(-g_HistRadius*HISTORY_TEXT_PADDING)+", 0)");

    data.hist_path.object = data.hist_path.this.append("g").attr("class", "history draw");

    data.hist_path.undo = data.hist_path.object.append("foreignObject")
        .attr("x", -g_HistRadius/2)
        .attr("y", -g_HistRadius/2)
        .attr("width", g_HistRadius)
        .attr("height", g_HistRadius)

    data.hist_path.undo.append("xhtml:div")
        .attr("class", "history foregin picture")
        .append("i")
        .attr("class", "history material-icons picture")
        .style("font-size", g_HistRadius+"px")
        .html("replay")

    AddHistText(data, "Undo", fix=true);

    data.hist_path.select = data.hist_path.object.append("circle")
        .attr("class","history select")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", g_HistRadius)
        .on("mouseup",function(d){
            //SubmitUndo();
        });

}

// function SubmitUndo(data){
//     $.ajax({
//         url: "/activate_undo",
//         type: 'POST',
//         timeout: 5000,
//         success: function(data){
//             MakeSnackbar(data);
//             if(o.length > 0){
//                 CreateProject();
//             }
//         },
//         error: function($jqXHR, textStatus, errorThrown) {
//             console.log( errorThrown + ": " + $jqXHR.responseText );
//             MakeSnackbar($jqXHR.responseText);
//         }
//     });
// }

function AddUndo(data){
    if(!g_project.history){
        g_project.history = g_project.hist_path.append("g")
            .attr("class","paths")
    }

    var d = data;
    DrawUndo(g_project.history, d);
}

function HistoryCreation(data){
    g_project.hist_path = SVG.append("g")
        .attr("id","History")
        .attr("transform","translate("+(g_project.width)+","+(g_PathRadius*HISTORY_ORBIT_COEF)+")")

    //if(SESSION["history"]) // Save in session.get("project")["history"] to show button
        AddUndo(new Object);
}

function AddHistText(data, text, fix=false) {
    var newobj = data.hist_path;
    newobj.text = newobj.object.append("g")
        .attr("class", "hist_path text")
    newobj.text.append("text")
        .attr("class", "text_back")
        .attr("x",0)
        .attr("y",g_HistRadius)
        .attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        .html(text);
    newobj.text.append("text")
        .attr("class", "text_front")
        .attr("x",0)
        .attr("y",g_HistRadius)
        .attr("transform","rotate("+(fix ? 0:-g_root.deg)+")")
        .html(text);
}