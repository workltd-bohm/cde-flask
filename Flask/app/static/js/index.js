document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {
        direction: 'top'
    });
});
//
//document.addEventListener('DOMContentLoaded', function() {
//    var elems = document.querySelectorAll('select');
//    var instances = M.FormSelect.init(elems, options);
//  });

// Or with jQuery

//  $(document).ready(function(){
//    $('.fixed-action-btn').floatingActionButton();
//  });
window.onbeforeunload = function() {
    history.pushState(SESSION, null, '');
}

window.onload = function() {
    // console.log(history);
    // console.log('a')
    if (typeof history.pushState === "function") {
        // console.log('here0.0');
        console.log(SESSION);
        //        SESSION['project'] = null;
        // history.pushState(SESSION, null, null);
        window.onpopstate = function() {
            //            history.pushState('newjibberish', null, '');
            // console.log('here');
            // console.log(history);
            //            console.log(history.state);
            //            console.log(SESSION);
            SESSION = history.state;
                //            console.log(SESSION);

            // this function is the one that should be uncommented
            SendProjectBackButton();
            // Handle the back (or forward) buttons here
            // Will NOT handle refresh, use onbeforeunload for this.
        };
    } else {
        console.log('here2');
        var ignoreHashChange = true;
        window.onhashchange = function() {
            if (!ignoreHashChange) {
                ignoreHashChange = true;
                window.location.hash = Math.random();
                // Detect and redirect change here
                // Works in older FF and IE9
                // * it does mess with your hash symbol (anchor?) pound sign
                // delimiter on the end of the URL
            } else {
                ignoreHashChange = false;
            }
        };
    }
}