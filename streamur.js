var express = require('express'),
	processSegments = require('./controller'),
	_ = require('underscore');

var app = express.createServer();

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: "keyboard cat" }));
	app.use(express.static(__dirname + '/public'));
    app.use(app.router);
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.listen(8000);

console.log("StreamUR listening on port 8000.");

app.get('/streams', function(req, res, next){
	
	var streams = require('./adapter').streams;
	var streamResponse = [];
	for(var i in streams){
		streamResponse.push({
			name: i
		});
	}
	
	res.setHeader("Content-Type","application/json");
	res.end(JSON.stringify(streamResponse));
});

app.get('/:segment', function(req, res, next){
	var segments = req.params.segment.split('.');
	
	var stream = processSegments(segments,
		//onError
		function(error){
			next(error, req, res, next);
		}
	);
	
	if(stream.headers){
		for(var i in stream.headers){
			res.setHeader(i, stream.headers[i]);
		}
	}
	
	stream.pipe(res);
});
