var formidable = require('formidable'),
	util = require("util"),
	StreamAdapter = require('../lib/StreamAdapter'),
	streams = StreamAdapter.streams ,
	JavascriptAdapter = StreamAdapter.JavascriptAdapter,
	TwitterAdapter = StreamAdapter.TwitterAdapter;

module.exports = function(app){
	
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
	
	app.get('/streams', function(req, res, next){

		var streamResponse = [];
		for(var i in streams){
			var st = {
				name: i,
	      		type: streams[i].type
			}

			if(st.type == 'js'){
				st.filename= streams[i]._fileName;
			} else	if(st.type == 'twitter'){
				st.filename= streams[i]._name;
			}


			streamResponse.push(st);
		}

		res.setHeader("Content-Type","application/json");
		res.end(JSON.stringify(streamResponse));
	});

	app.post('/streams', function(req, res, next){
		console.info("Received request");
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
	        console.info("stream added");
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

				TwitterAdapter.add(fields.name, params);
				// res.redirect('/');
				return;
			} else {
				res.end("Unsupported type: "+newSt.type);
			}


	    });
	});
}