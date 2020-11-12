
$( document ).ready(function(){
    $("div.pero > .cover.back").click(function(d){
        $(this).parent().hide();
    });

    $("div.pero > .content > .zatvori").click(function(d){
        GetForm().empty();
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

function PopupOpen(run=null, data=null, file=null){
    var form = GetForm();

    LoadStop(); 
    $(form).empty();
    $("div.pero").show();

    if(run) run(form, data, file);
}

function PopupClose(){
    var form = GetForm();
    $(form).empty();
    LoadStop();
    $("div.pero").hide();
    ClearActivity();
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
    if (!args) args = d;
//    console.log(args);
//    console.log(d);

    LoadStart();
    $.ajax({
        url: job,
        type: 'POST',
        data: (args instanceof FormData)? args : JSON.stringify(args),
        //dataType: "json",
        processData: false,
        contentType: false,
        timeout: 5000,
        success: function(data){
            if(!stay) location.reload();
//            console.log(data);
            if(fill) $("div.content > .form").html(data);
            else PopupClose();
            pom = (args instanceof FormData)? d : args;
//            for (var value of args.values()) {
//               console.log(value);
//            }
            SESSION["position"] = {parent_id: pom["parent_id"], ic_id: pom["ic_id"]};
            if (job != 'select_project') SESSION["undo"] = true;
            MULTI = {};
            if(data == 'Project successfully deleted'){
                SESSION["position"] = null;
                func = SelectProject;
                }

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