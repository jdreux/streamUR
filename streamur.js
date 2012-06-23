var express = require('express');

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

app.get('/:segment', function(req, res, next){
	var segments = req.params.segment.split('.');
	
	res.end(JSON.stringify(segments));
});
