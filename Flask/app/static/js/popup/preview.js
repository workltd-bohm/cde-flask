$( document ).ready(function(){
    $("div.preview > .cover.back").click(function(d){
        $(this).parent().hide();
    });

    $("div.preview > .content > .zatvori").click(function(d){
        $(this).parent().parent().hide();
    });
});

function LoadStartPreview(){
    var load = $('div.preview > .cover.front');
    load.show();
}

function LoadStopPreview(){
    var load = $('div.preview > .cover.front');
    load.hide();
}

function GetFormPreview(){
    return $("div.preview > .content > .preview-placeholder");
}

function PreviewOpen(run=null, data=null, file=null){
    var form = GetFormPreview();

    LoadStopPreview();
    $(form).empty();
    $("div.preview").show();
//    $("div.content").height('auto');

    if(run) run(form, data, file);
}

function PreviewClose(){
    LoadStopPreview();
    $("div.preview").hide();
    ClearActivity();
}