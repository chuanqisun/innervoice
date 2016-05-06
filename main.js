init = function() {
    // scope var
    var playlist;
    var tracks;
    var displayedPlaylist;
    var player;
    var currentTrack = 0;

    // LOCAL DEBUG ONLY
    $.getJSON = function(str, callback) {
        callback();
    }

    // Get playlist data
    $.getJSON("playlist.json", function(playlists) {
        playlists = 
        [{
            "volume": "1",
            "title": "Northern Whispers",
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

        playlist = playlists[0];
        tracks = playlist.tracks;

        // Attach audio source
        currentTrack = 0;
        player = $("<audio></audio>").attr({
            'src':tracks[currentTrack].path,
            'volume':1,
        }).appendTo("footer")[0];

        // Render title, volume, intro, tracks
        $('.title').text(playlist.title);
        $('.volume').text('vol. ' + playlist.volume);
        $('.intro').text(playlist.intro);
        displayedPlaylist = $('ol.playlist');
        $.each(tracks, function(i)
        {
            var li = $('<li/>').text(tracks[i].name).attr('artist', tracks[i].artist).appendTo(displayedPlaylist);
            li.click(function(e){
                e.preventDefault();
                playTrack(i, tracks, displayedPlaylist, player);
            });
        });

        // Autoplay next track
        player.addEventListener('ended',function(e){
            currentTrack = (currentTrack + 1) % tracks.length;   
            playTrack(currentTrack, tracks, displayedPlaylist, player);
        });

        // Start playing when first visit tracks page
        var onHashChange = function() {
            if (location.hash === '#tracks' && player.paused)
                playTrack(currentTrack, tracks, displayedPlaylist, player);
            $(window).off('hashchange', undefined, onHashChange);
        }
        $(window).on('hashchange', undefined, onHashChange);

        // Attach play/pause to icon
        $('.play-icon').click(function() {
            if (!player.paused) {
                player.pause();
                $('.play-icon').addClass('paused');
            } else {
                player.play();
                $('.play-icon').removeClass('paused');
            }
        });

        // Start playing
        playTrack(currentTrack, tracks, displayedPlaylist, player);
    });
}

function playTrack(trackNumber, tracks, displayedPlaylist, player){
    displayedTrack = displayedPlaylist.find('li').eq(trackNumber);
    displayedTrack.addClass('playing').siblings().removeClass('playing');
    player.src = tracks[trackNumber].path;
    player.load();
    player.play();
}


init();