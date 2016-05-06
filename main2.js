var platformDetector = {
    hasTouch: function() { return "ontouchstart" in document.documentElement; },
    isMobile: function() {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
}

var audioPlayer = {
    // scope var
    playlist: undefined,
    tracks: undefined,
    displayedPlaylist: undefined,
    player: undefined,
    currentTrack: undefined,

    playTrack: function(trackNumber, tracks, displayedPlaylist, player){
        if(_this.currentTrack !== trackNumber) {
            player.src = tracks[trackNumber].path;
            player.load();
            _this.currentTrack = trackNumber;
        }

        player.play();
    },

    init: function() {
        // LOCAL DEBUG ONLY
        $.getJSON = function(str, callback) {
            callback();
        }

        // Get playlist data
        _this = this;
        $.getJSON("playlist.json", function(playlists) {
            playlists = 
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

            _this.playlist = playlists[0];
            _this.tracks = _this.playlist.tracks;

            // Attach audio source
            _this.currentTrack = 0;
            _this.player = $("<audio></audio>").attr({
                'src':_this.tracks[_this.currentTrack].path,
                'volume':1,
                'controls':platformDetector.isMobile(),
            }).appendTo("footer")[0];

            // Render title, volume, intro, tracks
            $('.title').text(_this.playlist.title);
            $('.volume').text('vol. ' + _this.playlist.volume);
            $('.intro').text(_this.playlist.intro);
            _this.displayedPlaylist = $('ol.tracks');
            $.each(_this.tracks, function(i)
            {
                var li = $('<li/>').text(_this.tracks[i].artist + ' · ' + _this.tracks[i].name).appendTo(_this.displayedPlaylist);
                li.click(function(e){
                    e.preventDefault();
                    _this.playTrack(i, _this.tracks, _this.displayedPlaylist, _this.player);
                });

                if (!platformDetector.hasTouch())
                    li.addClass('no-touch');
            });

            // Autoplay next track
            _this.player.addEventListener('ended',function(e){
                var nextTrackNumber = (_this.currentTrack + 1) % _this.tracks.length;   
                _this.playTrack(nextTrackNumber, _this.tracks, _this.displayedPlaylist, _this.player);
            });

            // On play
            _this.player.addEventListener('play',function(e){
                var displayedTrack = _this.displayedPlaylist.find('li').eq(_this.currentTrack);
                displayedTrack.addClass('playing').siblings().removeClass('playing');
                $('.audio-control').removeClass('paused');
            });

            // On pause
            _this.player.addEventListener('pause',function(e){
                $('.audio-control').addClass('paused');
            });

            // Use animate icon and auto start only on desktop clients
            if (platformDetector.isMobile()) {
                $('.audio-control-container').remove();
            } else {
                // Attach play/pause to icon
                $('.audio-control').click(function() {
                    if (!_this.player.paused) {
                        _this.player.pause();
                    } else {
                        _this.playTrack(_this.currentTrack, _this.tracks, _this.displayedPlaylist, _this.player);
                    }
                });

                // Start playing when first visit tracks page
                _this.playTrack(_this.currentTrack, _this.tracks, _this.displayedPlaylist, _this.player);
            }
        })
    }
}

audioPlayer.init();