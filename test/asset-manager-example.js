var express = require('express'),
	streamur = require('../');

var app = express.createServer();
//register a few streams:
streamur.stream("jquery", "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.js");
streamur.stream("myscript", __dirname+"/assets/myscript.js");

app.use('/assets/', streamur());

app.listen(8000);