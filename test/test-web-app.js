var express = require('express'),
	streamur = require('../');

var app = express.createServer();

app.use('/assets/', streamur());
	
console.log('Adding sample streams');

console.log("adding jquery");
streamur.stream("jquery", __dirname+"/assets/stream_files/jquery-1.7.2.js");
console.log("Adding hightlightstyle");
streamur.stream('highlightstyle', 'https://raw.github.com/andris9/highlight/master/lib/vendor/highlight.js/styles/sunburst.css');

console.log("Adding lesstest")
streamur.stream('lesstest', __dirname+"/assets/stream_files/lesstest.css");

console.log("registering alias");
streamur.alias('jq', function(alias){
	alias.stream("myscript", __dirname+"/assets/myscript.js");
	alias.stream("jquery2", __dirname+"/assets/stream_files/jquery-1.7.2.js");
});


app.listen(8000);
console.log("StreamUR test listening on port 8000.");

//JavascriptAdapter.add("stream1","../assets/stream_files/stream1.js");
//JavascriptAdapter.add("stream2","../assets/stream_files/stream2.js");

//JavascriptAdapter.add("twitterImg","../assets/stream_files/twitterImg.js");
//JavascriptAdapter.add("twitterTest","../assets/stream_files/twitterTest.js");

//HTTPSAdapter.add('lexitlogin', );
//TwitterAdapter.add("streamur",{username: "streamur",password: "streamur1", follow:"streamur"});
//TwitterAdapter.add("imgur",{username: "streamur",password: "streamur1", follow:"imgur"});
//TwitterAdapter.add("twitpics",{username: "streamur",password: "streamur1", track:"imgur"});