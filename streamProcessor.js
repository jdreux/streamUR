var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify,
	BufferedStream = require('./BufferedStream');

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

  var out = stream;
  var orig_code = "";

  stream.setEncoding('utf8');
  stream.on('data', function(chunk) {
    orig_code += chunk;
  });
  stream.on('end', function() {
    var ast = jsp.parse(orig_code); // parse code and get the initial AST
    ast = pro.ast_mangle(ast); // get a new AST with mangled names
    ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
    var final_code = pro.gen_code(ast); // compressed code here
    out.write(final_code);
    out.close();
  });
  return out;
});

createProcessor('js', 'js', 'nocache', function(stream) {

});

createProcessor('js', 'js', 'gzip', function(stream) {
});

createProcessor('js', 'js', 'js', function(stream) {
	stream.headers = {};
  stream.headers['Content-Type'] = "application/javascript";
  return stream;
});
