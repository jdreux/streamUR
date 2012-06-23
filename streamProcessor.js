var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify,
	BufferedStream = require('./BufferedStream'),
	gzip = require('gzip'),
	im = require('imagemagick'),
	tmp = require('tmp');

var processorList = {};

function StreamProcessor(inType, outType, processFunction) {
  this.inputType = inType;
  this.outputTye = outType;
  this.name = 'unknown';
  this.fun = processFunction; 
}

StreamProcessor.prototype = {
  validate: function(type) {
    return type === this.inputType;
  },
  init: function(stream) {
/*
    if (stream.type !== this.inputType) {
      throw "mismatched types in " + this.name;
    } */
    return this.fun(stream);
  }
}

function createProcessor(inType, outType, name, fun) {
  var proc = new StreamProcessor(inType, outType, fun);
  proc.name = name;
  processorList[name] = proc;
}

exports.listProcessors = processorList;


// Define processors.
//
var cat = {
  name : "cat",
  inputType : 'js',
  outputType : 'js',
  validate : function(type) {
    return type === cat.inputType;
  },
  init: function(stream1, stream2) {
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
	return out;
  }
}
processorList['cat'] = cat;

createProcessor('js', 'js', 'min', function(stream) {

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
  return out;
});

createProcessor('js', 'js', 'nocache', function(stream) {
  stream.headers = stream.headers || {};
  stream.headers["Cache-Control"] = "no-cache, must-revalidate";
  stream.headers["Expires"] = "Sat, 26 Jul 1997 05:00:00 GMT";
  return stream;
});

createProcessor('js', 'js', 'gzip', function(stream) {
	var out = new BufferedStream();
	var orig_code = "";
	
	stream.headers = stream.headers || {};
	stream.headers["Content-Encoding"] = "gzip";
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
	  return out;
});

createProcessor('js', 'js', 'js', function(stream) {
  stream.headers = stream.headers || {};
  stream.headers['Content-Type'] = "application/javascript";
  return stream;
});

function addTweet(tweet) {
  var imgur = /imgur/i;
  var img = '<div>';
  if (tweet.urls) {
    console.log(tweet.urls);
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

createProcessor('twitter', 'html', 'listImages', function(stream) {
  var out = new BufferedStream();

  stream.resume();
  var entity = "";
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


createProcessor('html', 'html', 'html', function(stream) {
  stream.headers = stream.headers || {};
  stream.headers['Content-Type'] = "text/html";
  return stream;
});

createProcessor('img', 'img', 'png', function(stream) {
  stream.headers = stream.headers || {};
  stream.headers['Content-Type'] = "image/png";
  return stream;
});