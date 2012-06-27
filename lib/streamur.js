var express = require('express'),
	processSegments = require('./controller'),
	JavascriptAdapter = require('./StreamAdapter').JavascriptAdapter,
	TwitterAdapter = require('./StreamAdapter').TwitterAdapter,
	HTTPSAdapter = require('./StreamAdapter').HTTPSAdapter;
	
var app = express.createServer();

console.log('Adding sample streams');

JavascriptAdapter.add("stream1","../assets/stream_files/stream1.js");
JavascriptAdapter.add("stream2","../assets/stream_files/stream2.js");
JavascriptAdapter.add("jquery","../assets/stream_files/jquery-1.7.2.js");
JavascriptAdapter.add("twitterImg","../assets/stream_files/twitterImg.js");
JavascriptAdapter.add("interface","../web/public/interface_operations.js");
JavascriptAdapter.add("twitterTest","../assets/stream_files/twitterTest.js");

HTTPSAdapter.add('lexitlogin', 'https://justlexit.com/js/v1.3.2/modules/login.js');
HTTPSAdapter.add('highlightstyle', 'https://raw.github.com/andris9/highlight/master/lib/vendor/highlight.js/styles/ascetic.css');

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
		function(stream, context){
			if(context.headers){
				for(var i in context.headers){
					res.setHeader(i, context.headers[i]);
				}
			}
			console.log('resume and pipe');
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
