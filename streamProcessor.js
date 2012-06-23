// 

var processorList = {};

function StreamProcessor(inType, outType, processFunction) {
  this.inputType = inType;
  this.outputTye = outType;
  this.name = 'unknown';
  
  this.validate = function(type) {
    return type === this.inputType;
  };

  this.run = function(stream) {
    if (stream.type !== this.inputType) {
      throw new Exception("mismatched types in " + this.name);
    }
    return processFunction(stream);
  };
}

StreamProcessor.prototype = {
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
  run: function(stream1, stream2) {
  }
}
processorList['cat'] = cat;

createProcessor('js', 'js', 'min', function(stream) {
});

createProcessor('js', 'js', 'nocache', function(stream) {
});

createProcessor('js', 'js', 'gzip', function(stream) {
});
