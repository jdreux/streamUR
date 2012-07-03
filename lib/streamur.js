var url = require('url'),
	adapters = require('./adapters'),
	streams = adapters.streams,
	processors = require('./processors').processors,
	cache = {},
	aliases = {};
	


module.exports = function(){
	return function(req, res, next){
		//Get the requested URL, less the starting '/'
		var requested = url.parse(req.url).pathname.substring(1);
		
		if(requested.length == 0){
			next();
		}
		
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
		
		var segments = resolve(requested.split('.'));
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
				stream.on('data', function(chunk){
					res.write(chunk);
				});
				
				stream.on('end', function(){
					res.end();
				})
				
				stream.resume();
			//	stream.pipe(res);
			},
			//onError
			function(error){
				next(error);
			},
			function onNotFound(){
				next();
				return;
			}
		);
	};
}

module.exports.stream = adapters.registerStream;
module.exports.alias = function(name, alias){
	if(streams[name] || processors[name]){
		throw name+" cannot be used as an alias: it is already a stream or a processor.";
	}
	aliases[name]=alias;
}

function resolve(segments){
	var result = [];
	for(var i=0; i<segments.length; i++){
		var seg = segments[i];
		if(aliases[seg]){
			result = result.concat(resolve(aliases[seg].split('.')));
		} else {
			result.push(seg);
		}
	}
	return result;
}

function processSegments(segments, onSuccess, onError, onNotFound){
	
	var params = {
		resultStream: null
	}
	
	var nexts = [];
	var context = {
		headers: {},
		cacheable: false
	}
	//Construct event chain look ahead.
	for(var i=0; i<segments.length; i++){
		nexts[i]= getProcessSegment(segments[i], i+1, onSuccess, onError, onNotFound, params, nexts, context);
	}
	//Build the chain
	nexts[0]();
}

function getProcessSegment(seg, nextIndex, onSuccess, onError, onNotFound, params, nexts, context){
	return function(){
		var next;
		if(nextIndex>nexts.length-1){
			next = function(){ 
						onSuccess(params.resultStream, context);
					};
		} else {
			next = nexts[nextIndex];
		}
		if(streams[seg]){
			streams[seg].init( function(stream){
				if(params.resultStream){
					processors.cat.init(function(st){
						if(!st){
							onError("Cat returned null stream");
							return;
						}
						params.resultStream = st;
						next();
						}, context, params.resultStream, stream);
					
				} else {
					params.resultStream = stream;
					if(!params.resultStream){
						onError(seg+" returned null stream");
						return;
					}
					next();
				}
				
			}, context);	
		} else if(processors[seg]){
			var proc = processors[seg];
			proc.init(function(st){
					params.resultStream=st; 
					if(!params.resultStream){
						onError(seg+" returned null stream");
						return;
					}
					next()
			}, context, params.resultStream);
		} else {
			onNotFound();
			return;
		}
	}
	
}