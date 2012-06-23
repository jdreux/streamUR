var express = require('express'),
	processSegments = require('./controller'),
	_ = require('underscore'),
	events = require("events"),
	formidable = require('formidable'),
	util = require("util"),
	JavascriptAdapter = require('./adapter').JavascriptAdapter,
	TwitterAdapter = require('./adapter').TwitterAdapter;
	
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

console.log('Adding sample streams');

JavascriptAdapter.add("stream1","files/stream1.js");
JavascriptAdapter.add("stream2","files/stream2.js");
JavascriptAdapter.add("jquery","files/jquery-1.7.2.js");
JavascriptAdapter.add("twitimg","files/twitimg.js");

TwitterAdapter.add("streamur",{username: "streamur",password: "streamur1", follow:"imgur"});

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
	
	var form = new formidable.IncomingForm();
	
	form.on('fileBegin', function(name, file){
		file.path = 'file/'+file.name;
	});	
	
	form.parse(req, function(err, fields, files) {
		if(!fields || !fields.name || !fields.type){
			res.end("Missing name or type");
			return;
		}
		
		var type = fields.type;
		
		if(type == 'js'){
			if(!files || files.length !=1){
				res.end("Missing stream file");
				return;
			} else {
				JavascriptAdapter.add(fields.name, files.path);
				res.redirect('/');
				return;
			}
			
		} else if(type =='twitter'){
			var params = {username: "streamur",password: "streamur1"};
			
			if(fields.follow){
				params.follow = fields.follow;
			}
			
			if(fields.track){
				params.track = fields.track;
			}
			
			TwitterAdapter.add("streamur", params);
			res.redirect('/');
			return;
		} else {
			res.end("Unsupported type: "+newSt.type);
		}
		
      
    });
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