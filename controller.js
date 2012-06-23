var adapter = require('./adapter'),
	streams = adapter.streams,
	streamProcessor = require('./streamProcessor'),
	processors = streamProcessor.processorList,
	validateType = streamProcessor.validateType

module.exports = function processSegments(segments, onSuccess, onError){
	
	var chain = [];
	var cp = 0;
	var type = undefined;
	var resultStream;
	
	//Construct event chain.
	for(var i=0; i<segments.length; i++){
		
		var seg = segments[i];
		console.log("Processing segment "+seg);
		var element = {};
		
		
		if(streams[seg]){
			console.log("Matched stream");
			var stream = streams[seg];
			type = stream.type;
			if(resultStream){
				resultStream = processors.cat.run(resultStream, stream);
			} else {
				resultStream = stream;
			}			
		} else if(processors[seg]){
			console.log("Matched processor");
			var proc = processors[seg];
			if(proc.inputType != type){
				onError("Processor "+seg+" expects type "+proc.inputType+" but "+type+" was received");
				return;
			}
			type = proc.outputType;
			resultStream = proc.run(resultStream);
		} else {
			onError("Could not resolve: "+seg);
			return;
		}
	}
	
	return resultStream;
}