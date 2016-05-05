init = function() {
    // scope var
    var playlist;
    var tracks;
    var displayedPlaylist;
    var player;
    var currentTrack = 0;

    // Get playlist data
    $.getJSON("playlist.json", function(json) {
        playlists = JSON.parse(json);
        // playlists = [{
        //     "volume": "1",
        //     "title": "Norther Tales",
        //     "intro": "And yet the Evening listens. He who saddens At thought of idleness cannot be idle And he’s awake who thinks himself asleep.",
        //     "dates": "2016.May.4",
        //     "tracks": [
        //         {"name":"Radical Face - Gray Skies", "path":"./audio/001/01-Gray_Skies.mp3", "length":"00:43"},
        //         {"name":"Carved In Stone - Die Gärten der Feen", "path":"./audio/001/02-Die_Gaerten_Der_Feen.mp3", "length":"03:03"},
        //         {"name":"Adaro - Es Ist Ein Schnee Gefallen", "path":"./audio/001/03-Es_ist_ein_Schnee_gefallen.mp3", "length":"03:59"},
        //         {"name":"Agnes Obel - Riverside", "path":"./audio/001/04-Riverside.mp3", "length":"03:51"},
        //         {"name":"Mono - Burial At Sea", "path":"./audio/001/05-Burial_at_the_sea.mp3", "length":"10:40"},
        //     ]
        // }];

        playlist = playlists[0];
        tracks = playlist.tracks;
    });

    // Attach audio source
    currentTrack = 0;
    player = $("<audio></audio>").attr({
        'src':tracks[currentTrack].path,
        'volume':0.5,
    }).appendTo("footer")[0];

    // Render title, volume, intro, tracks
    $('.title').text(playlist.title);
    $('.volume').text('vol. ' + playlist.volume);
    $('.intro').text(playlist.intro);
    displayedPlaylist = $('ol.playlist');
    $.each(tracks, function(i)
    {
        var li = $('<li/>').text(tracks[i].name).appendTo(displayedPlaylist);
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
}

function playTrack(trackNumber, tracks, displayedPlaylist, player){
    displayedTrack = displayedPlaylist.find('li').eq(trackNumber);
    displayedTrack.addClass('playing').siblings().removeClass('playing');
    player.src = tracks[trackNumber].path;
    player.load();
    player.play();
}


init();