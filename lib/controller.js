var streams = require('./StreamAdapter').streams,
	processors = require('./StreamProcessor').processorList,
	util = require('util');

var onError,
	onNotFound,
	onSuccess,
	nexts,
	resultStream,
	context;

module.exports = function processSegments(segments, _onSuccess, _onError, _onNotFound){
	nexts = [];
	onError = _onError;
	onNotFound = _onNotFound;
	onSuccess = _onSuccess;
	resultStream = null;
	context = {
		headers: {},
		cacheable: false
	}
	
	//Construct event chain look ahead.
	for(var i=0; i<segments.length; i++){
		nexts[i]= getProcessSegment(segments[i], i+1);
	}
	
	//Build the chain
	nexts[0]();
}

function getProcessSegment(seg, nextIndex){
	return function(){
		var next;
		if(nextIndex>nexts.length-1){
			next = function(){ 
						console.log("Processing chain built."); 
						onSuccess(resultStream, context);
					};
		} else {
			next = nexts[nextIndex];
		}
		console.log("Processing segment "+seg);	

		if(streams[seg]){
			console.log("Matched stream");
			streams[seg].init( function(stream){
				if(resultStream){
					console.log("concating "+seg);
					processors.cat.init(function(st){
						if(!st){
							onError("Cat returned unll stream");
							return;
						}	
						next();
						}, context, resultStream, stream);
					
				} else {
					console.log("initial stream: "+seg);
					resultStream = stream;
					if(!resultStream){
						onError(seg+" returned null stream");
						return;
					}
				}
				next()
			}, context);	
		} else if(processors[seg]){
			console.log("Matched processor");
			var proc = processors[seg];
			resultStream = proc.init(function(st){
					resultStream=st; 
					if(!resultStream){
						onError(seg+" returned null stream");
						return;
					}
					next()
				}, context, resultStream);
		} else {
			console.log("Could not resolve: "+seg);
			onNotFound();
			return;
		}
	}
	
}
