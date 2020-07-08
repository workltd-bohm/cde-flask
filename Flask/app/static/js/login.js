var $loginMsg = $('.loginMsg'),
  $login = $('.login'),
  $signupMsg = $('.signupMsg'),
  $signup = $('.signup'),
  $frontbox = $('.frontbox');

$('#switch1').on('click', function() {
  $loginMsg.toggleClass("visibility");
  $frontbox.addClass("moving");
  $signupMsg.toggleClass("visibility");

  $signup.toggleClass('hide');
  $login.toggleClass('hide');
})

$('#switch2').on('click', function() {
  $loginMsg.toggleClass("visibility");
  $frontbox.removeClass("moving");
  $signupMsg.toggleClass("visibility");

  $signup.toggleClass('hide');
  $login.toggleClass('hide');
})

var $login_email = $("#email"),
   $login_pass = $("#password"),
   $sign_in_fullname = $("#s_fullname"),
   $sign_in_email = $("#s_email"),
   $sign_in_pass = $("#s_password");

$login.click(function() {
  console.log($login_email.val());
  console.log($login_pass.val());
  data = {email:$login_email.val(), password:$login_pass.val()};
  console.log(data);
  login_post(data);
});

$signup.click(function() {
  console.log($sign_in_fullname.val());
  console.log($sign_in_email.val());
  console.log($sign_in_pass.val());
  data = {fullname:$sign_in_fullname.val(), email:$sign_in_email.val(), password:$sign_in_pass.val()};
  console.log(data);
  sign_in_post(data);
});

function login_post(data){
    $.post( "/login_data", JSON.stringify(data))
        .done(function( data ) {
            console.log( "Data Loaded: " + data );
        });
};

function sign_in_post(data){
    $.post( "/sign_in_data", JSON.stringify(data))
        .done(function( data ) {
            console.log( "Data Loaded: " + data );
        });
};

//setTimeout(function(){
//  $('#switch1').click()
//},1000)
//
//setTimeout(function(){
//  $('#switch2').click()
//},3000)