
$( document ).ready(function(){
    $("div.pero > .cover.back").click(function(d){
        $(this).parent().hide();
    });

    $("div.pero > .content > .zatvori").click(function(d){
        $(this).parent().parent().hide();
    });
});

function LoadStart(){
    var load = $('div.pero > .cover.front');
    load.show();
}

function LoadStop(){
    var load = $('div.pero > .cover.front');
    load.hide();
}

function GetForm(){
    return $("div.pero > .content > .form");
}

function PopupOpen(run=null, data=null){
    var form = GetForm();

    LoadStop(); 
    $(form).empty();
    $("div.pero").show();

    if(run) run(form, data);
}

function PopupClose(){
    LoadStop(); 
    $("div.pero").hide();
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

function FormClose(){
    PopupClose();
}

function FormSubmit(job, args=null, stay=false, func=null, fill=false){
    var form = GetForm();

    if(!CheckAval(form)) return; 
    var d = {parent_id: '', ic_id:''};
    form.serializeArray().map(function(x){d[x.name] = x.value;}); 
    if (!args) args = JSON.stringify(d);
    // console.log(args);

    LoadStart();
    $.ajax({
        url: job,
        type: 'POST',
        data: args,
        //dataType: "json",
        processData: false,
        contentType: false,
        timeout: 5000,
        success: function(data){
            if(!stay) location.reload();
            //console.log(data);
            if(fill) $("div.content > .form").html(data);
            else PopupClose();

            SESSION["position"] = {parent_id: d["parent_id"], ic_id: d["ic_id"]};

            if(func) func();
            LoadStop();
            MakeSnackbar(data);
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log( errorThrown + ": " + $jqXHR.responseText );
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
        }
    });
}

function MakeSnackbar(data){
    $("#snackbar").html(data);
    $("#snackbar").show();
    setTimeout(function(){ $("#snackbar").hide(); }, 3000);
}