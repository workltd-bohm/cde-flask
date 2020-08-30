
$("div.pero > .cover.back").click(function(d){
    $(this).parent().hide();
});

$("div.pero > .content > .zatvori").click(function(d){
    $(this).parent().parent().hide();
});

function PopupOpen(run=null){
    var form = $("div.pero > .content > .form");

    $('div.pero > .cover.front').hide(); 
    $("div.pero").show();

    if(run) run(form);
}

function PopupClose(){
    $('div.pero > .cover.front').hide(); 
    $("div.pero").hide();
}

function LoadStart(){
    var load = $('div.pero > .cover.front');
    load.show();
}

function LoadStop(){
    var load = $('div.pero > .cover.front');
    load.hide();
}

function CheckAval(data){
    var ok = true;
    for(var i = 0; i < data.length; i++)
        if(! data[i].checkValidity()) {
            data[i].reportValidity();
            ok = false;
        }
    return ok;
}

function FormSubmit(job, args=null, stay=false, func=null, fill=false){
    var form = $("div.pero > .content > .form");

    if(!CheckAval(form)) return; 
    if (!args) args = form.serializeArray()[0];
    console.log(args);

    LoadStart();
    $.ajax({
        url: job,
        type: 'POST',
        data: JSON.stringify(args),
        //dataType: "json",
        processData: false,
        contentType: false,
        timeout: 5000,
        success: function(data){
            if(!stay) location.reload();
            LoadStop();
            console.log(data);
            if(fill) $("div.content > .form").html(data);
            else PopupClose();
            if(func) func();
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            PopupClose();
        }
    });
}
