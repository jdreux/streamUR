var adapter = require('./adapter'),
	streams = adapter.streams,
	streamProcessor = require('./streamProcessor'),
	processors = streamProcessor.listProcessors,
	validateType = streamProcessor.validateType

var onError,
	onNotFound,
	onSuccess,
	nexts,
	resultStream;

module.exports = function processSegments(segments, _onSuccess, _onError, _onNotFound){
	nexts = [];
	onError = _onError;
	onNotFound = _onNotFound;
	onSuccess = _onSuccess;
	resultStream = null;
	
	//Construct event chain.
	for(var i=0; i<segments.length; i++){
		var seg = segments[i];
		nexts[i]= getProcessSegment(seg, i+1);
	}
	
	//Let's go!
	nexts[0]();
	
}

function getProcessSegment(seg, nextIndex){
	
	
	return function(){
		var next;
		if(nextIndex>nexts.length-1){
			next = function(){ 
						console.log("Processing chain done"); 
						onSuccess(resultStream)
					};
		} else {
			next = nexts[nextIndex];
		}
		console.log("Processing segment "+seg);	

		if(streams[seg]){
			console.log("Matched stream");
			streams[seg].openStream( function(stream){
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
				next()
			});	
		} else if(processors[seg]){
			console.log("Matched processor");
			var proc = processors[seg];
			resultStream = proc.init(resultStream);
			if(!resultStream){
				onError(seg+" returned null stream");
			}
			next();
		} else {
			console.log("Could not resolve: "+seg);
			onNotFound();
			return;
		}
	}
	
}