$(document).ready(function() {
    $("div.preview > .cover.back").click(function(d) {
        //$(this).parent().hide();
    });

    $("div.preview > .content > .zatvori").click(function(d) {
        // $(this).parent().parent().hide();
    });
});

function LoadStartPreview() {
    var load = $('div.preview > .cover.front');
    load.show();
}

function LoadStopPreview() {
    var load = $('div.preview > .cover.front');
    load.hide();
}

function GetFormPreview() {
    return $("div.preview > .content > .preview-placeholder");
}

function PreviewOpen(run = null, data = null, file = null, open = false) {
    var form = null;
    if (open) {
        form = GetFormPreview();
        LoadStopPreview();
        $(form).empty();
        $("div.preview").show();
        //    $("div.content").height('auto');
    }
    if (run) run(form, data, file, open);
}

function ClosePreview() {
    LoadStopPreview();
    $("div.preview").hide();
    
    CloseActivity();
    $(".activity-menu").toggleClass("d-none", g_project.current_ic.overlay_type === "search");

    if (g_project.current_ic.values.back.overlay_type !== "search")
    {
        WrapOpenFile(g_project.current_ic.values.back, false);
    } 

}