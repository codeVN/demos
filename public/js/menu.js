'use strict';

define(function (require, exports, module) {
    var tool = require( './modules/tool' );
    var requester = require( './modules/requester' );

    var cashe = tool.cashe();
    var id = tool.getID();

    var cookie = tool.cookieToObject( document.cookie );

    function addLoading () {
        $( 'body' ).append('<div id="loading"><div class="outer"></div><div class="inner"></div></div>');
    }
    function rmLoading () {
        $( '#loading' ).remove();
    }

    function getDemos (callback) {

        var history = cashe.get('history');

        if( history ){
            callback(history);
        }else{

            requester.menu.getList().success(function (list) {
                cashe.set('history', list);
                callback(list);
            });

        }
    }

    function appendChildDemos (list) {
        var ul = document.createElement('ul');

        for( var i = 0; i < list.length; i++ ){
            var classActive = ( list[i]._id === id ? 'on' : '' );
            var str = '<li><a href="/'+ list[i].type +'/'+ list[i]._id +'" class="'+ classActive +'">'+ list[i]._id +'.'+ list[i].type +'</a></li>';
            $( ul ).append( str );
        }
        $( '#history' ).html('');
        $( '#history' ).append( ul );
    }

    function getUserInfo (callback) {

        var userInfo = cashe.get( 'userInfo' );

        if( userInfo ){
            callback( userInfo );
        }else{

            requester.menu.getUserInfo().success(function (userInfo) {
                cashe.set( 'userInfo', userInfo );
                callback(userInfo);
            });

        }
    }

    function getUserInfoInit (userInfo) {
        userInfo.avatar && $( '#avatar' ).attr( 'src', userInfo.avatar );
        $( '#login_before' ).addClass('none');
        $( '#login_after' ).removeClass('none');
        cashe.rm('history');
        getDemos( appendChildDemos );
    }

    function login () {

        var regexpMail = tool.regexp().mail;
        var mail = $( '#mail' ).val();
        var password = $( '#password' ).val();

        if( regexpMail.test( mail ) && password ){

            requester.menu.login( mail, password ).success(function (userInfo) {

                getUserInfoInit(userInfo);
                toastr.success( '登陆成功' );

            }).error(function (msg) {
                toastr.error( msg.responseText );
            });
        }

        if( !regexpMail.test( mail ) ) $( '#mail' ).addClass('redBorder');
        if( !password ) $( '#password' ).addClass('redBorder');
    }

    function register () {
        var mail = $( '#register_mail' ).val();
        var password = $( '#register_password' ).val();
        addLoading();
        
        if( tool.regexp().mail.test( mail ) ){

            requester.menu.register( mail, password ).success(function () {

                rmLoading();
                toLogin();
                toastr.success( '我们已经成功向您的邮箱发送了一封激活邮件，请点击邮件中的链接完成注册！' );

            }).error(function (msg) {
                rmLoading();
                toastr.error( msg.responseText );
            });
        }else{
            rmLoading();
            $( '#register_mail' ).addClass('redBorder');
        }
    }

    function retrieve () {
        var mail = $( '#retrieve_mail' ).val();
        addLoading();

        if( tool.regexp().mail.test( mail ) ){

            requester.menu.retrieve( mail ).success(function () {

                rmLoading();
                toastr.success( '您的密码已经发送到您的邮箱里，请注意查收' );
                toLogin();

            }).error(function () {

                rmLoading();
                toastr.error( '找回密码时，发生了错误请稍后在试' );

            });

        }else{

            rmLoading();
            $( '#retrieve_mail' ).addClass('redBorder');

        }
    }

    function changePw () {
        var newPw = $( '#change_pw' ).val();

        requester.menu.changepw( newPw ).success(function () {

            goHome();
            $( '#change_pw' ).val('');
            toastr.success( '密码修改成功' );

        }).error(function () {
            toastr.success( '修改失败' );
        });
    }

    function signOut () {

        requester.menu.signout().success(function(){

            toastr.success( '您已经退出' );
            $( '#login_after' ).addClass('none');
            $( '#login_before' ).removeClass('none');
            
        });

    }

    function transform (name) {
        $( '#retrieve' ).get(0).className = 'none';
        $( '#register' ).get(0).className = 'none';
        $( '#login' ).get(0).className = 'none';
        $( '#' + name ).get(0).className = 'animated flipInY';
    }
    function toRegister () {
        transform( 'register' );
    }
    function toLogin () {
        transform( 'login' );
    }
    function toRetrieve () {
        transform( 'retrieve' );
    }
    function toChangePw () {
        $( '#login_after_btn' ).get(0).className = 'animated zoomOutDown';
        setTimeout(function () {
            $( '#changePw' ).get(0).className = 'animated bounceInDown';
        },1000);
    }
    function goHome () {
        $( '#changePw' ).get(0).className = 'animated bounceOutUp';
        setTimeout(function () {
            $( '#login_after_btn' ).get(0).className = 'animated zoomInUp';
        },500);
    }

    function toClose () {
        if ($( '#login' ).get(0)) $( '#login' ).get(0).className = '';
        if ($( '#register' ).get(0)) $( '#register' ).get(0).className = 'none';
        if($( '#retrieve' ).get(0)) $( '#retrieve' ).get(0).className = 'none';
        $('#login_after_btn').get(0).className = '';
        $('#changePw').get(0).className = 'none';
    }

    function toggleMenu () {
        var menu = $( '#menu' ).get( 0 );
        var menuShow = function(){
            $( '#menu' ).addClass( 'fadeinleft' );
            $( '#menu' ).removeClass( 'none' );
            getDemos( appendChildDemos );
        };
        var menuHide = function(){
            $('#menu').get(0).className = 'fadeoutleft';
            toClose();
            setTimeout(function(){
                $( '#menu' ).get(0).className = 'none';
            },700);
        };

        if (menu.className.indexOf( 'none' ) === -1) {
            menuHide();
        }else{
            menuShow();
        }
    }

    function rmRedBorder () {
        $(this).removeClass( 'redBorder' );
    }

    if( cookie && cookie.login_session ){
        getUserInfo( getUserInfoInit );
    }

    $( '#btn_menu' ).click( toggleMenu );

    $( '#mail' ).blur( rmRedBorder );
    $( '#password' ).blur( rmRedBorder );
    $( '#register_mail' ).blur( rmRedBorder );
    $( '#retrieve_mail' ).blur( rmRedBorder );

    $( '.register_link' ).click( toRegister );
    $( '.login_link' ).click( toLogin );
    $( '.retrieve_link' ).click( toRetrieve );
    $( '#change_link' ).click( toChangePw );
    $( '.backHome' ).click( goHome );


    $( '#btn_login' ).click( login );
    $( '#btn_register' ).click( register );
    $( '#btn_retrieve' ).click( retrieve );
    $( '#btn_changePw' ).click( changePw );
    $( '#btn_signOut' ).click( signOut );

    $( window ).keydown(function(event){
        //Show Menu
        if( event.keyCode === 77 && ( event.ctrlKey === true || event.metaKey === true ) ){
            toggleMenu();
            return false;
        }
    })

    exports.toggleMenu = toggleMenu;
    exports.getDemos = getDemos;
    exports.appendChildDemos = appendChildDemos;
    exports.cashe = cashe;
});