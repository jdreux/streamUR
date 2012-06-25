var express = require('express'),
	processSegments = require('./controller'),
	JavascriptAdapter = require('./StreamAdapter').JavascriptAdapter,
	TwitterAdapter = require('./StreamAdapter').TwitterAdapter;
	
var app = express.createServer();

console.log('Adding sample streams');

JavascriptAdapter.add("stream1","../assets/stream_files/stream1.js");
JavascriptAdapter.add("stream2","../assets/stream_files/stream2.js");
JavascriptAdapter.add("jquery","../assets/stream_files/jquery-1.7.2.js");
JavascriptAdapter.add("twitterImg","../assets/stream_files/twitterImg.js");
JavascriptAdapter.add("interface","../web/public/interface_operations.js");
JavascriptAdapter.add("twitterTest","../assets/stream_files/twitterTest.js");

TwitterAdapter.add("streamur",{username: "streamur",password: "streamur1", follow:"streamur"});
TwitterAdapter.add("imgur",{username: "streamur",password: "streamur1", follow:"imgur"});
TwitterAdapter.add("twitpics",{username: "streamur",password: "streamur1", track:"imgur"});

app.listen(8000);

console.log("StreamUR listening on port 8000.");

app.get('/:segment', function(req, res, next){
	var requested = req.params.segment;
	var segments = req.params.segment.split('.');
	var stream = processSegments(segments,
		//onSuccess
		function(stream){
			if(stream.headers){
				for(var i in stream.headers){
					res.setHeader(i, stream.headers[i]);
				}
			}
			stream.resume();
			stream.pipe(res);
		},
		//onError
		function(error){
			console.error("Received error: "+error);
			res.statusCode = 500;
			res.end("Received error: "+error);
			return;
		},
		function onNotFound(){
			next();
		}
	);
});
