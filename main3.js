// ==================== App ====================
IV = (function() {
    function init(config) {
        IV.Constants.init(config);
        IV.Service.init(onServiceReady);
    }

    function onServiceReady() {
        IV.Model.init();
        IV.View.init();
        IV.Controller.init();
        IV.Router.init();
    }

    return {
        init: init
    }
}.call({}));

// ==================== Constants ====================
IV.Constants = (function() {
    var currentVolumnNumber;

    function init(config) {
        currentVolumnNumber = config.currentVolumnNumber;
    }

    return {
        init: init,
        get currentVolumnNumber() { return currentVolumnNumber; }
    }
}.call({}));

// ==================== Service ====================
IV.Service = (function() {
    var playlistsResponse;
    var initCallback;
    var detectTouchDeviceResult;
    var detectMobileDeviceResult;

    function init(callback) {
        initCallback = callback;
        // DEBUG uncomment to get mock JSON result
        $.getJSON = function(str, callback) {
            mockResult = 
            [{
                "volume": "1",
                "title": "The Northern Whispers",
                "dates": "2016.May.4",
                "intro": "Softly they whisper, so as not to be found by the ancient sorrows.",
                "tracks": [
                    {"artist":"Radical Face", "name":"Gray Skies", "path":"./audio/001/01-Gray_Skies.mp3", "length":"00:43"},
                    {"artist":"Carved In Stone", "name":"Die Gärten der Feen", "path":"./audio/001/02-Die_Gaerten_Der_Feen.mp3", "length":"03:03"},
                    {"artist":"Adaro", "name":"Es Ist Ein Schnee Gefallen", "path":"./audio/001/03-Es_ist_ein_Schnee_gefallen.mp3", "length":"03:59"},
                    {"artist":"Agnes Obel", "name":"Riverside", "path":"./audio/001/04-Riverside.mp3", "length":"03:51"},
                    {"artist":"Mono", "name":"Burial At Sea", "path":"./audio/001/05-Burial_at_the_sea.mp3", "length":"10:40"}
                ]
            }];
            window.setTimeout(function(){
                callback(mockResult);
            }, 1000);
        }
        // End of DEBUG

        $.getJSON("playlist.json", onDataReady);
        detectTouchDevice();
    }

    function onDataReady(data) {
        IV.Service.playlists = data;
        initCallback();
    }

    function detectTouchDevice() {
        detectTouchDeviceResult =  "ontouchstart" in document.documentElement;
    }

    function detectMobileDevice() {
         detectMobileDeviceResult = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }

    return {
        init: init,
        get playlists() { return playlistsResponse; },
        set playlists(data) { playlistsResponse = data; },
        get isTouchDevice() { return detectTouchDeviceResult; },
        get isMobileDevice() { return detectMobileDeviceResult; }
    };
}.call({}));

// ==================== Router ====================
IV.Router = (function() {
    var oneTimeAutoPlayFunc; 
    var oneTimeShowAudioControlFunc;
    var oneTimeRevealHeadphoneNavControlFunc;
    var oneTimeRevealIntroNavControlFunc;

    function init() {
        oneTimeAutoPlayFunc = _.once(IV.Controller.playTrackByTrackNumber);
        oneTimeShowAudioControlFunc = _.once(IV.View.showAudioControl);
        oneTimeRevealHeadphoneNavControlFunc = _.once(IV.View.revealHeadphoneNavControl);
        oneTimeRevealIntroNavControlFunc = _.once(IV.View.revealIntroNavControl);

        $(window).on('hashchange', onHashChange);
        onHashChange();
    }

    function onHashChange() {
        switch (location.hash) {
            case '#tracks':
                onEnterTracksView();
                break;
            case '#intro':
                onEnterIntroView();
                break;
            case '#headphone':
            case '':
                onEnterHeadphoneView();
                break;
        }
    }

    function onEnterTracksView() {
        oneTimeShowAudioControlFunc();
        oneTimeAutoPlayFunc(IV.Model.currentTrackNumber, true);
    }

    function onEnterIntroView() {
        oneTimeRevealIntroNavControlFunc();
    }

    function onEnterHeadphoneView() {
        oneTimeRevealHeadphoneNavControlFunc();
    }

    return {
        init: init
    };
}.call({}));

// ==================== Model ====================
IV.Model = (function() {
    var playlist;
    var tracks;
    var currentTrackNumber;
    var nextTrackNumber;

    function init() {
        playlist = _.find(IV.Service.playlists, {'volume': IV.Constants.currentVolumnNumber.toString()});
        tracks = playlist.tracks;
        currentTrackNumber = 0;
    }

    function setCurrentTrack(newTrackNumber) {
        currentTrackNumber = newTrackNumber;
    }

    return {
        init: init,
        setCurrentTrack: setCurrentTrack,
        get playlist() { return playlist; },
        get tracks() { return tracks; },
        get currentTrackNumber() { return currentTrackNumber; },
        get currentTrack() { return tracks[currentTrackNumber]; },
        get nextTrackNumber() { return  (currentTrackNumber + 1) % tracks.length; }
    }
}.call({}));

// ==================== View ====================
IV.View = (function() {
    var $audio;
    var $audioControl;
    var $footer;
    var $title;
    var $volume;
    var $intro;
    var $tracksContainer;
    var $displayedPlaylist;
    var $currentTrack;
    var $navControl;
    var $headphoneNavControl;
    var $introNavControl;

    function init() {
        fetchTemplate();
        hydrateTemplate();
        bindInteractions();
    }

    function fetchTemplate() {
        $audio = $('<audio></audio>');
        $audioControl = $('.audio-control');
        $footer = $('footer');
        $title = $('.title');
        $volume = $('.volume');
        $intro = $('.intro');
        $tracksContainer = $('.tracks-container');
        $displayedPlaylist = $('ol.tracks');
        $navControl = $('.nav-container a');
        $headphoneNavControl = $('#headphone .nav-container a');
        $introNavControl = $('#intro .nav-container a');
    }

    function hydrateTemplate() {
        $footer.append(hydrateAudioPlayer());
        $title.text(IV.Model.playlist.title);
        $volume.text('vol. ' + IV.Model.playlist.volume);
        $intro.text(IV.Model.playlist.intro);
        $tracksContainer.prepend(hydrateDisplayedPlaylist());
    }

    function bindInteractions() {
        var $displayedPlaylistItems = $displayedPlaylist.find('li');
        enableHover($displayedPlaylistItems);
        enableHover($navControl);
        handleTracksOnClick($displayedPlaylistItems);
        handleAudioPlayerOnClick();
    }

    function hydrateAudioPlayer() {
        return $audio.attr({
            'src': IV.Model.currentTrack.path,
            'volume': 1,
            'preload': 'none'
        });
    }

    function hydrateDisplayedPlaylist() {
        _.each(IV.Model.tracks, function(track)
        {
            $('<li/>').text(track.artist + ' · ' + track.name).appendTo($displayedPlaylist);
        });

        return $displayedPlaylist;
    }

    function enableHover(selector) {
        if (!IV.Service.isTouchDevice) {
            selector.hover(
                function(){
                    $(this).addClass('hover');
                }, 
                function(){
                    $(this).removeClass('hover');
                }
            );
        }
    }

    function handleTracksOnClick(displayedPlaylistItems) {
        displayedPlaylistItems.click(function(e){
            e.preventDefault();
            IV.Controller.playTrackByTrackNumber($(e.target).index());
        })
    }

    function handleAudioPlayerOnClick() {
        $audioControl.click(function(e) {
            e.preventDefault();
            IV.Controller.togglePlay();
        });
    }

    function showAudioControl() {
        $audioControl.removeClass('hide');
    }

    function revealHeadphoneNavControl() {
        $headphoneNavControl.removeClass('invisible');
    }

    function revealIntroNavControl() {
        $introNavControl.removeClass('invisible');
    }

    function highlighCurrentTrack() {
        var $currentTrack = $displayedPlaylist.find('li').eq(IV.Model.currentTrackNumber);
        $currentTrack.addClass('playing').siblings().removeClass('playing');
    }

    function startAudioControlAnimation() {
        $audioControl.removeClass('paused');
    }

    function pauseAudioControlAnimation() {
        $audioControl.addClass('paused');
    }

    return {
        init: init,
        showAudioControl: showAudioControl,
        revealHeadphoneNavControl: revealHeadphoneNavControl,
        revealIntroNavControl: revealIntroNavControl,
        highlighCurrentTrack: highlighCurrentTrack,
        startAudioControlAnimation: startAudioControlAnimation,
        pauseAudioControlAnimation: pauseAudioControlAnimation,
        get audio() { return $audio[0]; }
    };
}.call({}));

// ==================== Controller ====================
IV.Controller = (function() {
    var audioPlayer;

    function init() {
        audioPlayer = IV.View.audio;
        handlePlayerEvents();
    }

    function handlePlayerEvents() {
        audioPlayer.addEventListener('ended',function(e){
            playTrackByTrackNumber(IV.Model.nextTrackNumber);
        });

        audioPlayer.addEventListener('play',function(e){
            IV.View.highlighCurrentTrack();
            IV.View.startAudioControlAnimation();
        });

        audioPlayer.addEventListener('pause',function(e){
            IV.View.pauseAudioControlAnimation();
        });
    }

    function playTrackByTrackNumber(trackNumber, reload) {
        if(IV.Model.currentTrackNumber !== trackNumber || reload) {
            IV.Model.setCurrentTrack(trackNumber);
            audioPlayer.src = IV.Model.currentTrack.path;
            audioPlayer.load();
        }

        audioPlayer.play();
    }

    function togglePlay() {
        if (!audioPlayer.paused) {
            audioPlayer.pause();
        } else {
            playTrackByTrackNumber(IV.Model.currentTrackNumber);
        }
    }

    return {
        init: init,
        playTrackByTrackNumber: playTrackByTrackNumber,
        togglePlay: togglePlay
    }

}.call({}));

// ==================== Config ====================
var config  = {
    currentVolumnNumber: 1
};


// ==================== Bootstrap ====================
IV.init(config);

