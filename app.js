// ==================== App ====================
IV = (function() {
    function init() {
        IV.Constants.init();
        IV.View.init();
        IV.Router.init();
    }

    return {
        init: init
    }
}.call({}));

// ==================== Constants ====================
IV.Constants = (function() {
    var Classes = {
	    animateCSSClass: "animate",
        playerOverlayContainer: "player-overlay-container",
        hidden: "hidden",
        active: "active"
    }

    var IDs = {
        launch: "launch",
        showMenu: "show-menu",
        hideMenu: "hide-menu",
        dropdown: "dropdown"
    }

    var Routes = {
        landing: "landing",
        player: "player"
    }

    var animateStepLength = 750;

    function init() {
    }

    return {
        init: init,
        get Classes() { return Classes; },
        get IDs() { return IDs; },
        get animateStepLength() { return animateStepLength; },
        get Routes() { return Routes; }
    }
}.call({}));

// ==================== Router ====================
IV.Router = (function() {
    function init() {
        window.onload = onEnterLandingView;
        window.onhashchange =  onHashChange;

        window.onbeforeunload = function (e) {
            console.log('d!');
        };

        onHashChange();
    }

    function onHashChange() {
        switch (location.hash) {
            case '#player':
                onExitLandingView();
                onEnterPlayerView();
                break;
            case '#landing':
            case '':
                onExitPlayerView();
                onEnterLandingView();
                break;
        }
    }

    function onEnterLandingView() {
        IV.View.animateLandingPage();
    }

    function onExitLandingView() {
        IV.View.animateLandingPageReset();
    }

    function onEnterPlayerView() {

    }

    function onExitPlayerView() {
        IV.View.hideMenu();
    }

    function navigateToPlayerView() {
        window.location.hash = IV.Constants.Routes.player;
    }

    function navigateToLandingView() {
        window.location.hash = IV.Constants.Routes.landing;
    }

    return {
        init: init,
        navigateToPlayerView: navigateToPlayerView
    };
}.call({}));

// ==================== View ====================
IV.View = (function() {
    var Buttons = {};
    var Menus = {};
    var animateTimers = [];

    function init() {
        fetchElements();
        bindInteractions();
     }

    function fetchElements() {
        Buttons.launch = document.getElementById(IV.Constants.IDs.launch);
        Buttons.showMenu = document.getElementById(IV.Constants.IDs.showMenu);
        Buttons.hideMenu = document.getElementById(IV.Constants.IDs.hideMenu);
        Menus.dropdown = document.getElementById(IV.Constants.IDs.dropdown);
    }

    function bindInteractions() {
        Buttons.launch.onclick = IV.Router.navigateToPlayerView;
        Buttons.showMenu.onclick = showMenu;
        Buttons.hideMenu.onclick = hideMenu;
    }

    function showMenu() {
        Menus.dropdown.classList.add(IV.Constants.Classes.active);
        Buttons.showMenu.classList.add(IV.Constants.Classes.hidden);
    }

    function hideMenu() {
        Menus.dropdown.classList.remove(IV.Constants.Classes.active);
        Buttons.showMenu.classList.remove(IV.Constants.Classes.hidden);
    }

    function animateLandingPage() {
        recursiveAnimate(1, 4);
    }

    function animateLandingPageReset() {
        for(var i = 0, l = animateTimers.length; i < l; i++) {
            animateTimers[i]();
        }
        animateTimers = [];
    }

    function recursiveAnimate(delay, depth) {
        (function() {    
            var timer = setTimeout(function() {
                var element = document.getElementsByClassName("animate-onload-" + delay);
                for(var i = 0, l = element.length; i < l; i++) {
                    element[i].classList.add(IV.Constants.Classes.animateCSSClass);
                }

                if (delay < depth)
                    recursiveAnimate(delay + 1, depth);

            }, IV.Constants.animateStepLength);

            var destroyCallback = function() {
                clearTimeout(timer);
                var element = document.getElementsByClassName("animate-onload-" + delay);
                for(var i = 0, l = element.length; i < l; i++) {
                    element[i].classList.remove(IV.Constants.Classes.animateCSSClass);
                }
            }
            animateTimers.push(destroyCallback);            
        })();
    }

    return {
        init: init,
        animateLandingPage: animateLandingPage,
        animateLandingPageReset: animateLandingPageReset,
        hideMenu: hideMenu
    };
}.call({}));


// ==================== Bootstrap ====================
IV.init();