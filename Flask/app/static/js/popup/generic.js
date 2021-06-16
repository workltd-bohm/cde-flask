$(document).ready(function() {
    $("div.pero > .cover.back").click(function(d) {
        // $(this).parent().hide();
    });

    $("div.pero > .content > .zatvori").click(function(d) {

        if (document.getElementById('box') && uploadInProgress == true) {
            uploadInProgress = false;
            stopFunction();
            MakeSnackbar('Upload stopped');
            location.reload();
        }

        GetForm().empty();
        $(this).parent().parent().hide();


    });
});

function LoadStart() {
    var load = $('div.pero > .cover.front');
    load.show();
}

function LoadStop() {
    var load = $('div.pero > .cover.front');
    load.hide();
}

function GetForm() {
    return $("div.pero > .content > .form");
}

// Set up an empty form
function PopupOpen(run = null, data = null, file = null) {
    var form = GetForm();

    LoadStop();
    $(form).empty();
    $("div.pero").show();

    if (run) run(form, data, file);
}

function PopupClose() {
    var form = GetForm();
    $(form).empty();
    LoadStop();
    $("div.pero").hide();
    ClearActivity();
}

function PopupOnlyClose() {
    var form = GetForm();
    $(form).empty();
    LoadStop();
    $("div.pero").hide();
}

function CheckAval(data) {
    var ok = true;
    for (var i = 0; i < data.length; i++)
        if (!data[i].checkValidity()) {
            data[i].reportValidity();
            ok = false;
        }
    return ok;
}

function FormClose() {
    PopupClose();
}

function FormSubmit(job, args = null, stay = false, func = null, fill = false) {
    var form = GetForm();

    if (!CheckAval(form)) return;
    var d = { parent_id: '', ic_id: '' };
    form.serializeArray().map(function(x) { d[x.name] = x.value; });
    if (!args) args = d;

    if (job == 'create_project') {
        args.is_iso = $("#is_iso19650_checkbox").is(':checked');
    }
    LoadStart();
    $.ajax({
        url: job,
        type: 'POST',
        data: (args instanceof FormData) ? args : JSON.stringify(args),
        //dataType: "json",
        processData: false,
        contentType: false,
        timeout: 10000,
        success: function(data) {
            treeStruct = null;
            if (!stay) location.reload();
            if (fill) $("div.content > .form").html(data);
            else PopupClose();
            pom = (args instanceof FormData) ? d : args;
            //            for (var value of args.values()) {
            //            }
            SESSION["position"] = { parent_id: pom["parent_id"], ic_id: pom["ic_id"], path: pom["path"] };
            if (job != 'select_project') SESSION["undo"] = true;
            MULTI = {};
            if (data == 'Project successfully deleted') {
                func = (SESSION.section == "project") ? SelectProject : SelectTrash;
                SESSION["position"] = null;
            }

            if (job === "create_dir") {
                CreateTreeStructure();
            }

            if (func) func();
            LoadStop();
            MakeSnackbar(data);
        },
        error: function($jqXHR, textStatus, errorThrown) {
            console.log(errorThrown + ": " + $jqXHR.responseText);
            MakeSnackbar($jqXHR.responseText);
            PopupClose();
            if ($jqXHR.status == 401) {
                location.reload();
            }
        }
    });
}

function MakeSnackbar(data) {
    $("#snackbar").html(data);
    $("#snackbar").show();
    setTimeout(function() { $("#snackbar").hide(); }, 3000);
}

function TabSwap(target) {
    $(".popup-view").children().hide();
    $(".popup-box").removeClass("selected");
    $("#popup-" + target).show();
    $("#popup-" + target + "-tab").addClass("selected");
}