var $loginMsg = $('.loginMsg'),
  $login = $('.login'),
  $signupMsg = $('.signupMsg'),
  $signup = $('.signup'),
  $frontbox = $('.frontbox');

$('#switch1').on('click', function() {
  resetFields();
  $loginMsg.toggleClass("visibility");
  $frontbox.addClass("moving");
  $signupMsg.toggleClass("visibility");

  $signup.toggleClass('hide');
  $login.toggleClass('hide');
})

$('#switch2').on('click', function() {
  resetFields();
  $loginMsg.toggleClass("visibility");
  $frontbox.removeClass("moving");
  $signupMsg.toggleClass("visibility");

  $signup.toggleClass('hide');
  $login.toggleClass('hide');
})

var $login_email = $("#email"),
   $login_pass = $("#password"),
   $signup_username = $("#s_username"),
   $signup_email = $("#s_email"),
   $signup_pass = $("#s_password"),
   $login_btn = $("#login_button"),
   $signup_btn = $("#signup_button"),
   $msg_placeholder = $("#msg_placeholder");

$login_btn.click(function() {
  isChecked = check_fields_login($login_email.val(), $login_pass.val());
  if(isChecked){
    resetFields();
    data = {email:$login_email.val(), password:$login_pass.val()};
    login_post(data);
  }
});

$signup_btn.click(function() {
  isChecked = check_fields_signup($signup_username.val(), $signup_email.val(), $signup_pass.val());
  if(isChecked){
    resetFields();
    data = {username:$signup_username.val(), email:$signup_email.val(), password:$signup_pass.val()};
    signup_post(data);
  }
});

$login_email.on('input',function(e) {
  resetFields();
});

$login_pass.on('input',function(e) {
  resetFields();
});

$signup_username.on('input',function(e) {
  resetFields();
});

$signup_email.on('input',function(e) {
  resetFields();
});

$signup_pass.on('input',function(e) {
  resetFields();
});

function login_post(data) {
    $.post( "/login_data", JSON.stringify(data))
        .done(function( data ) {
                location.href = '/dashboard';
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            if($jqXHR.status == 404) {
                console.log( errorThrown + ": " + JSON.parse($jqXHR.responseText).message );
                $msg_placeholder.text(JSON.parse($jqXHR.responseText).message).css('color', 'red').css('font-size', '12px');
            }
        });
};

function signup_post(data) {
    $.post( "/signup_data", JSON.stringify(data))
        .done(function( data ) {
            location.href = '/dashboard';
        })
        .fail(function($jqXHR, textStatus, errorThrown){
            if($jqXHR.status == 404) {
                console.log( errorThrown + ": " + JSON.parse($jqXHR.responseText).message );
                $msg_placeholder.text(JSON.parse($jqXHR.responseText).message).css('color', 'red').css('font-size', '12px');
            }
        });
};

function check_fields_login(email, pass){
    isChecked = true;
    if(pass === "")  {
        $login_pass.css('border', '1px solid red');
        $login_pass.focus();
        isChecked = false;
    }
    if(email === "")  {
        $login_email.css('border', '1px solid red');
        $login_email.focus();
        isChecked = false;
    }
    if(!isChecked){
        $msg_placeholder.text("Please add the missing fields!").css('color', 'red');
    }
    return isChecked;
}

function check_fields_signup(username, email, pass){
    isChecked = true;
    if(username === "")  {
        $signup_username.css('border', '1px solid red');
        $signup_username.focus();
        isChecked = false;
    }

    if(pass === "")  {
        $signup_pass.css('border', '1px solid red');
        $signup_pass.focus();
        isChecked = false;
    }
    if(email === "")  {
        $signup_email.css('border', '1px solid red');
        $signup_email.focus();
        isChecked = false;
    }
    if(!isChecked){
        $msg_placeholder.text("Please add the missing fields!").css('color', 'red');
    }
    return isChecked;
}

function resetFields(){
  $msg_placeholder.text("")
  $login_pass.css('border', '0px');
  $login_email.css('border', '0px');
  $signup_username.css('border', '0px');
  $signup_pass.css('border', '0px');
  $signup_email.css('border', '0px');
}

//setTimeout(function(){
//  $('#switch1').click()
//},1000)
//
//setTimeout(function(){
//  $('#switch2').click()
//},3000)