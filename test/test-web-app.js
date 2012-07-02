var express = require('express'),
	streamur = require('../');

var app = express.createServer();

app.use('/assets/', streamur());
	
console.log('Adding sample streams');

console.log("adding jquery");
streamur.registerStream("jquery", __dirname+"/assets/stream_files/jquery-1.7.2.js");
console.log("adding interface");
streamur.registerStream("interface", __dirname+"/../web/public/interface_operations.js");
console.log("Adding lexitlogin");
streamur.registerStream("lexitlogin", 'https://justlexit.com/js/v1.3.2/modules/login.js')
console.log("Adding hightlightstyle");
streamur.registerStream('highlightstyle', 'https://raw.github.com/andris9/highlight/master/lib/vendor/highlight.js/styles/sunburst.css');
	
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