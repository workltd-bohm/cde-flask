$( document ).ready(function(){
    $.get( "/get_project", function( data ) {
        if(data){
            DashboardCreate([data.root_ic]);
            PathCreation([data.root_ic]);
        }
    });
});

