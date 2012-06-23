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
	app.use(function(req, res, next){
		//404 handler.
		res.statusCode = 404;
		res.end("Not found");
	});
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.listen(8000);

console.log("StreamUR listening on port 8000.");

app.get('/streams', function(req, res, next){
	
	var streams = require('./adapter').streams;
	var streamResponse = [];
	for(var i in streams){
		var st = {
			name: i,
      		type: streams[i].type,
			
		}
		
		if(st.type == 'js'){
			st.filename= streams[i]._fileName;
		}
		
		
		streamResponse.push(st);
	}
	
	res.setHeader("Content-Type","application/json");
	res.end(JSON.stringify(streamResponse));
});

app.put('/streams', function(req, res, next){
	if(!req.body){
		throw "Missing body";
	}
})

app.get('/:segment', function(req, res, next){
	
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
