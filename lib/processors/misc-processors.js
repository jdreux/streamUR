//TWITTER PROCESSORS
//listImage
createProcessor('listImage',
function(callback, context, stream) {
    var out = new BufferedStream();
    stream.resume();
    var entity = "";
    stream.on('data',
    function(chunk) {
        entity += chunk;
        while (entity.indexOf('\n') > -1) {
            var tweet = JSON.parse(entity.substring(0, entity.indexOf('\n'))).entities;
            out.write(addTweet(tweet));
            stream.emit('end');
        }
    });
    stream.on('end',
    function() {
        out.end();
    });
    callback(out);
});

//listImages
createProcessor('listImages',
function(callback, context, stream) {
    var out = new BufferedStream();
    stream.resume();
    var entity = "";
    setTimeout(function() {
        stream.emit('end');
    },
    10000);
    stream.on('data',
    function(chunk) {
        entity += chunk;
        while (entity.indexOf('\n') > -1) {
            var tweet = JSON.parse(entity.substring(0, entity.indexOf('\n'))).entities;
            out.write(addTweet(tweet));
            entity = entity.substring(entity.indexOf('\n') + 1, entity.length);
        }
    });

    stream.on('end',
    function() {
        out.end();
    });

    callback(out);
});

function addTweet(tweet) {
    var imgur = /imgur/i;
    var img = '<div>';
    if (tweet.urls) {
        for (var i = 0; i < tweet.urls.length; i++) {
            var url = tweet.urls[i].expanded_url;
            if (imgur.test(url)) {
                if (!/\....$/.test(url)) {
                    var hash = /\/([^\/]*$)/;
                    var res = hash.exec(url);
                    url = "http://i.imgur.com/" + res[1] + ".png";
                }
                img += '<img  src="' + url + '">';
                img += "</div><div>";
            }
        }
    }
    img += "</div>";
    return img;
}
