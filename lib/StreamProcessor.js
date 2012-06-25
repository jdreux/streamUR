var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify,
	BufferedStream = require('./BufferedStream'),
	gzip = require('gzip'),
	im = require('imagemagick'),
	JSLINT = require('../support/jslint.js'),
	tmp = require('tmp');

exports.processorList = processorList = {};

function StreamProcessor(name, processFunction) {
  this.name = name;
  this.fun = processFunction;
}

StreamProcessor.prototype = {
  init: function() {	
	return this.fun.apply(this, arguments);
  }
}

var createProcessor = function(name, proc){
	processorList[name] = new StreamProcessor(name, proc);
};

// Define processors.

//cat
createProcessor('cat', function(callback, context, stream1, stream2) {
    var out = new BufferedStream();
	stream1.resume();
	stream1.on('data', function(chunk) {
      	out.write(chunk);
    });
	stream1.on('end', function(){
		stream2.resume();
		stream2.on('data', function(chunk) {
	        out.write(chunk);
	     });
	
		stream2.on('end', function(chunk) {
			out.end();
	     });
	});
	callback(out);
});

//JS PROCESSORS

//min
createProcessor('min', function(callback, context, stream) {

  var out = new BufferedStream();
  var orig_code = "";

  // stream.setEncoding('utf8');
  stream.resume();
  stream.on('data', function(chunk) {
    orig_code += chunk;
  });
  stream.on('end', function() {
    var ast = jsp.parse(orig_code); // parse code and get the initial AST
    ast = pro.ast_mangle(ast); // get a new AST with mangled names
    ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
    var final_code = pro.gen_code(ast); // compressed code here
    out.write(final_code);
    out.end();
  });
  callback(out);
});

//gzip
createProcessor('gzip', function(callback, context, stream) {
	var out = new BufferedStream();
	var orig_code = "";
	context.headers["Content-Encoding"] = "gzip";
	stream.resume();
	// stream.setEncoding('utf8');
	stream.on('data', function(chunk) {
	    orig_code += chunk;
	});
	stream.on('end', function() {
	   	gzip(orig_code, function(err, data){
		  // By default:
		  //   compression = 8
		  //   encoding = utf8
			if(err){
				throw err;
			}
		  	out.write(data);
	    	out.end();
		});    
	});
	callback(out);
});

//jslint
createProcessor('jslint', function(callback, context, stream){
	var out = new BufferedStream();
	var source = "";
	stream.resume();
	stream.on('data', function(chunk) {
	    source += chunk;
	});
	stream.on('end', function() {
	   	out.write(JSON.stringify(JSLINT(source)?true:JSLINT.errors, null, '\t'));
    	out.end();
	});
	callback(out);
});

//TWITTER PROCESSORS

//listImage
createProcessor('listImage', function(callback, context, stream) {
  var out = new BufferedStream();
  stream.resume();
  var entity = "";
  stream.on('data', function(chunk) {
    entity += chunk;
    while (entity.indexOf('\n') > -1) {
      var tweet = JSON.parse(entity.substring(0, entity.indexOf('\n'))).entities;
      out.write(addTweet(tweet));
      entity = entity.substring(entity.indexOf('\n') + 1, entity.length);
	  stream.emit('end');
    }
  });

  stream.on('end', function() {
    out.end();
  });
  callback(out);
});

//listImages
createProcessor('listImages', function(stream) {
  var out = new BufferedStream();
  out.headers = stream.headers;
  stream.resume();
  var entity = "";
	setTimeout(function(){stream.emit('end');}, 10000);
  stream.on('data', function(chunk) {
    entity += chunk;
    while (entity.indexOf('\n') > -1) {
      var tweet = JSON.parse(entity.substring(0, entity.indexOf('\n'))).entities;
      out.write(addTweet(tweet));
      entity = entity.substring(entity.indexOf('\n') + 1, entity.length);
    }
  });

  stream.on('end', function() {
    out.end();
  });

  return out;
});

function addTweet(tweet) {
  var imgur = /imgur/i;
  var img = '<div>';
  if (tweet.urls) {
    for (var i = 0; i < tweet.urls.length; i++) {
      var url = tweet.urls[i].expanded_url;
      if (imgur.test(url)) {
        if (!/\....$/.test(url)) {
          var hash = /\/([^\/]*$)/;
          var res = hash.exec(url);
          url = "http://i.imgur.com/"+res[1] + ".png";
        }
        img += '<img  src="' + url + '">';
        img += "</div><div>";
      }
    }
  }
  img += "</div>";
  return img;
}


//HEADER SETTERS
createProcessor('nocache', function(stream) {
  stream.headers = stream.headers || {};
  stream.headers["Cache-Control"] = "no-cache, must-revalidate";
  stream.headers["Expires"] = "Sat, 26 Jul 1997 05:00:00 GMT";
  return stream;
});

//FILE TYPES

//html
createProcessor('html', function(stream) {
  stream.headers = stream.headers || {};
  stream.headers['Content-Type'] = "text/html";
  return stream;
});

//png
createProcessor('png', function(stream) {
  stream.headers = stream.headers || {};
  stream.headers['Content-Type'] = "image/png";
  return stream;
});

//js
createProcessor('js', function(stream) {
  stream.headers = stream.headers || {};
  stream.headers['Content-Type'] = "application/javascript";
  return stream;
});

// gif
createProcessor('gif', function(stream) {

});
