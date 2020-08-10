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