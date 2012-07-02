var url = require('url'),
	adapters = require('./adapters'),
	streams = adapters.streams,
	processors = require('./processors').processors,
	cache = {};
	


module.exports = function(){
	return function(req, res, next){
		//Get the requested URL, less the starting '/'
		var requested = url.parse(req.url).pathname.substring(1);
		if(cache[requested]){
			var entry = cache[requested];
			if(entry.headers){
				for(var i in entry.headers){
					res.setHeader(i, entry.headers[i]);
				}
			}
			res.end(entry.val);
			return;
		}
		
		var segments = requested.split('.');
		var stream = processSegments(segments,
			//onSuccess
			function(stream, context){
				
				if(context.headers){
					for(var i in context.headers){
						res.setHeader(i, context.headers[i]);
					}
				}
				
				if(context.cacheable === true){
					
					cache[requested] = {
						val: new Buffer(0)
					};
					
					cache[requested].headers = context.headers;
					
					stream.on('data', function(chunk){
						if(Buffer.isBuffer(chunk)){
							cache[requested].val = Buffer.concat([cache[requested].val, chunk]);
						} else {
							cache[requested].val = Buffer.concat([cache[requested].val, new Buffer(chunk)]);
						}
						
					});
				}
				
				stream.resume();
				stream.pipe(res);
			},
			//onError
			function(error){
				next(error);
			},
			function onNotFound(){
				next();
			}
		);
	};
}

module.exports.registerStream = adapters.registerStream;
//module.exports.registerAlias = 


function processSegments(segments, onSuccess, onError, onNotFound){
	var nexts = [];
	var resultStream = null;
	var context = {
		headers: {},
		cacheable: false
	}
	
	//Construct event chain look ahead.
	for(var i=0; i<segments.length; i++){
		nexts[i]= getProcessSegment(segments[i], i+1, onSuccess, onError, onNotFound, resultStream, nexts, context);
	}
	
	//Build the chain
	nexts[0]();
}

function getProcessSegment(seg, nextIndex, onSuccess, onError, onNotFound, nexts, context){
	return function(){
		var next;
		if(nextIndex>nexts.length-1){
			next = function(){ 
//						console.log("Processing chain built."); 
						onSuccess(resultStream, context);
					};
		} else {
			next = nexts[nextIndex];
		}
//		console.log("Processing segment "+seg);	

		if(streams[seg]){
//			console.log("Matched stream");
			streams[seg].init( function(stream){
				if(resultStream){
//					console.log("concating "+seg);
					processors.cat.init(function(st){
						if(!st){
							onError("Cat returned unll stream");
							return;
						}	
						next();
						}, context, resultStream, stream);
					
				} else {
//					console.log("initial stream: "+seg);
					resultStream = stream;
					if(!resultStream){
						onError(seg+" returned null stream");
						return;
					}
				}
				next()
			}, context);	
		} else if(processors[seg]){
//			console.log("Matched processor");
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
//			console.log("Could not resolve: "+seg);
			onNotFound();
			return;
		}
	}
	
}