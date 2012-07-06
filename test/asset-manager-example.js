var express = require('express'),
	streamur = require('../');

var app = express.createServer();
//register a few streams:
console.log("registering streams: ");

console.log("jquery");
streamur.stream("jquery", "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.js");

console.log("myscript");
streamur.stream("myscript", __dirname+"/assets/myscript.js");

app.use('/assets/', streamur());

app.listen(8000);
console.log("asset-manager-example is running on port 8000");