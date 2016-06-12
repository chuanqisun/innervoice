// ==================== App ====================
IV = (function() {
    function init() {
        IV.Constants.init();
        IV.Service.init();

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
        active: "active",
        rightOverflowHide: "right-overflow-hide"
    }

    var IDs = {
        launch: "launch",
        showMenu: "show-menu",
        hideMenu: "hide-menu",
        dropdown: "dropdown",
        subscribe: "subscribe",
        generalMode: "general-mode",
        subscribeMode: "subscribe-mode"
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

// ==================== Service ====================
IV.Service = (function() {
    var playlists;
    var initCallback;

    function init(callback) {
        initCallback = callback
        loadPlaylists();
    }

    function loadPlaylists() {
        var xmlhttp = new XMLHttpRequest();
        var url = Config.playlistFilename;

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                playlists = JSON.parse(xmlhttp.responseText);
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }


    return {
        init: init
    };
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
    var MenuModes = {};
    var animateTimers = [];

    function init() {
        fetchElements();
        bindInteractions();
     }

    function fetchElements() {
        Buttons.launch = document.getElementById(IV.Constants.IDs.launch);
        Buttons.showMenu = document.getElementById(IV.Constants.IDs.showMenu);
        Buttons.hideMenu = document.getElementById(IV.Constants.IDs.hideMenu);
        Buttons.subscribe = document.getElementById(IV.Constants.IDs.subscribe);
        Menus.dropdown = document.getElementById(IV.Constants.IDs.dropdown);
        MenuModes.generalMode = document.getElementById(IV.Constants.IDs.generalMode);
        MenuModes.subscribeMode = document.getElementById(IV.Constants.IDs.subscribeMode);
    }

    function bindInteractions() {
        Buttons.launch.onclick = IV.Router.navigateToPlayerView;
        Buttons.showMenu.onclick = showMenu;
        Buttons.hideMenu.onclick = hideMenu;
        Buttons.subscribe.onclick = animateMenuToSubscribeMode;
    }

    function showMenu() {
        Menus.dropdown.classList.add(IV.Constants.Classes.active);
        Buttons.showMenu.classList.add(IV.Constants.Classes.hidden);
    }

    function hideMenu() {
        Menus.dropdown.classList.remove(IV.Constants.Classes.active);
        Buttons.showMenu.classList.remove(IV.Constants.Classes.hidden);
        switchMenuToMode(MenuModes.generalMode, false);
    }

    function animateMenuToSubscribeMode() {
        switchMenuToMode(MenuModes.subscribeMode)
    }

    function switchMenuToMode(targetMode, animate = true) {
        for(var menuMode in MenuModes) {
            if (targetMode !== MenuModes[menuMode])
                // hide other modes
                MenuModes[menuMode].classList.add(IV.Constants.Classes.hidden);
        }

        // show selected mode
        targetMode.classList.remove(IV.Constants.Classes.hidden);
        
        // optional animation
        if (animate) {
            targetMode.classList.add(IV.Constants.Classes.rightOverflowHide);
            targetMode.classList.add(IV.Constants.Classes.active);
        }
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


// ==================== Global Config ====================
const Config  = {
    "debug": false,
    "currentVolumnNumber": 2,
    "audioPath": "./audio/",
    "volumePathWidth": 3, // # of digits in the path
    "playlistFilename": "playlist.json"
};

// ==================== Bootstrap ====================
IV.init();