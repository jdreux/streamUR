var BufferedStream = require('../BufferedStream');

exports.processorList = processorList = {};

function StreamProcessor(name, processFunction) {
    this.name = name;
    this.init = processFunction;
}

var createProcessor = function(name, proc) {
    processorList[name] = new StreamProcessor(name, proc);
};

exports.createProcessor = createProcessor;

//Generate all processors
require('./web-processors');

//Basic processors

//cat
createProcessor('cat', function(callback, context, stream1, stream2) {
    var out = new BufferedStream();
    stream1.resume();
    stream1.on('data',function(chunk) {
        out.write(chunk);
    });
    stream1.on('end',function() {
        stream2.resume();
        stream2.on('data',function(chunk) {
            out.write(chunk);
        });

        stream2.on('end',function(chunk) {			
            out.end();
        });
    });
    callback(out);
});

//merge
createProcessor('merge', function(callback, context, stream1, stream2) {
    var out = new BufferedStream();
    stream1.resume();
    stream2.resume();
    var oneDone = false;
    stream1.on('data', function(chunk) {
        out.write(chunk);
    });
    stream2.on('data', function(chunk) {
        out.write(chunk);
    });
    stream1.on('end', function() {
        if (oneDone) {
            out.end();
        } else {
            oneDone = true;
        }
    });
    stream2.on('end', function(chunk) {
        if (oneDone) {
            out.end();
        } else {
            oneDone = true;
        }
    });
    callback(out);
});
