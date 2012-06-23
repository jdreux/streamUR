// Define processor objects

var processorList = [];

function StreamProcessor(inType, outType, processFunction) {
  this.inputType = inType;
  this.outputTye = outType;
  
  this.run = function(args

}

StreamProcessor.prototype = {
}

function createProcessor(inType, outType, fun, name) {
  var proc = new StreamProcessor(inType, outType, fun);
  exports[name] = proc;
  processorList.append(name);
}

exports.listProcessors = function() {
  return processorList;
}

exports.StreamProcessor = StreamProcesso
