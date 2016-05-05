init = function() {
    $.getJSON("playlist.json", function(json) {
        console.log(json); // this will show the info it in firebug console
    });
}

init();