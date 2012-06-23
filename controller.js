var adapter = require('./adapter'),
	streams = adapter.streams,
	streamProcessor = require('./streamProcessor'),
	processors = streamProcessor.listProcessors,
	validateType = streamProcessor.validateType

module.exports = function processSegments(segments, onSuccess, onError, onNotFound){
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
			var stream = streams[seg].openStream();
			type = stream.type;
			if(resultStream){
				console.log("concating "+seg);
				resultStream = processors.cat.init(resultStream, stream);
				if(!resultStream){
					onError("Cat returned unll stream");
					return;
				}
			} else {
				console.log("initial stream: "+seg);
				resultStream = stream;
				if(!resultStream){
					onError(seg+" returned null stream");
					return;
				}
			}			
		} else if(processors[seg]){
			console.log("Matched processor");
			var proc = processors[seg];
			if(proc.inputType != type){
				onError("Processor "+seg+" expects type "+proc.inputType+" but "+type+" was received");
				return;
			}
			type = proc.outputType;
			resultStream = proc.init(resultStream);
			if(!resultStream){
				onError(seg+" returned null stream");
			}
		} else {
			console.log("Could not resolve: "+seg);
			onNotFound();
			return;
		}
	}
	
	onSuccess(resultStream);
}