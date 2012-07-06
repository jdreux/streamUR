var url = require('url'),
	EventEmitter = require('events').EventEmitter,
	adapters = require('./adapters'),
	streams = adapters.streams,
	processors = require('./processors').processors,
	fs = require('fs'),
	cache = {},
	aliases = {};

module.exports = streamur = function(){
	return function(req, res, next){
		//Get the requested URL, less the starting '/'
		var requested = url.parse(req.url).pathname.substring(1);
		if(requested.length == 0){
			if(next){next()};
			return;
		}
		
		if(cache[requested]){
			var entry = cache[requested];
			var headers = entry.context.headers;
			if(headers){
				for(var i in headers){
					res.setHeader(i, headers[i]);
				}
			}
			entry.context.on('change', function(){
				//Invalidate the cache in case of changes to the backing streams.
				delete cache[requested];
			});
			res.end(entry.val);
			return;
		}
		
		var segments = resolve(requested.split('.'));
		var stream = processSegments(segments,
			//onSuccess
			function(stream, context){
				
				var headersSent = false;
				
				if(context.cacheable === true){
					
					cache[requested] = {
						val: new Buffer(0),
						context: context
					};
					
					stream.on('data', function(chunk){
						if(Buffer.isBuffer(chunk)){
							cache[requested].val = Buffer.concat([cache[requested].val, chunk]);
						} else {
							cache[requested].val = Buffer.concat([cache[requested].val, new Buffer(chunk)]);
						}
						
					});
				}
				stream.on('data', function(chunk){
					if(!headersSent){
						//wait for first write to flush the headers as most exceptions will happen at this point.
						if(context.headers){
							for(var i in context.headers){
								res.setHeader(i, context.headers[i]);
							}
						}
						headersSent = true;
					}
					res.write(chunk);
				});
				
				stream.on('end', function(){
					if(!headersSent){
						if(context.headers){
							for(var i in context.headers){
								res.setHeader(i, context.headers[i]);
							}
						}
						headersSent = true;
					}
					res.end();
				})
				
				stream.resume();
			//	stream.pipe(res);
			},
			//onError
			function(error){
				if(cache[requested]){
					delete cache[requested];
				}
				
				if(next)
					next(error);
			},
			function onNotFound(){
				if(cache[requested]){
					delete cache[requested];
				}
				
				if(next)
					next();
			}
		);
	};
};

streamur.stream = function(name, url){
	if(streams[name]){
		throw "Stream with name "+name+" is already registered.";
	} else {
		adapters.registerStream.apply(adapters, arguments);
	}
};

streamur.alias = function(name, alias){
	
	if(typeof alias === 'string'){
		
		if(aliases[name]){
			throw "Alias with name "+name+" already exists";
		}
		
		if(streams[name] || processors[name]){
			throw name+" cannot be used as an alias: it is already a stream or a processor.";
		}
		var segs = alias.split('.');
		for(var i=0; i<segs.length; i++){
			if(!streams[segs[i]] && !processors[segs[i]] && !aliases[segs[i]]){
				throw "Segment "+segs[i]+" part of alias "+alias+" is not a valid stream, processor or alias.";
			}
		}
		aliases[name]=alias;
	} else if(typeof alias === 'function'){
		var aliasString;
		var ref = {
			stream: function(name, path){
				streamur.stream(name, path);
				if(!aliasString){
					aliasString = name;
				} else {
					aliasString += '.'+name
				}
			}
		};
		alias(ref);
		streamur.alias(name, aliasString);
	} else {
		throw alias+" is not a valid alias";
	}
};

streamur.aliasDirectory = function(name, path){
	var alias;
	var list = fs.readdirSync(path);
	list.forEach(function(fileName){
		var file = path+'/'+fileName;
		if(fs.statSync(file).isFile()){
			var alphaName = fileName.replace(/[^a-z0-9]/gi,'');
			streamur.stream(alphaName, file);
			if(!alias){
				alias = alphaName;
			} else {
				alias += '.'+alphaName;
			}
		}
	});
	streamur.alias(name, alias);
};

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
	
	var context = new EventEmitter();
	
	context.headers = {};
	context.cacheable = true;

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
			streams[seg].init( function(stream, err){
				if(err){
					onError(err);
				}
				if(params.resultStream){
					processors.cat.init(function(st, err){
						if(!st){
							onError("Cat returned null stream");
							return;
						}
						if(err){
							onError(err);
							return;
						}
						params.resultStream = st;
						next();
						}, context, params.resultStream, stream);
					
				} else {
					params.resultStream = stream;
					stream.on('change')
					if(!params.resultStream){
						onError(seg+" returned null stream");
						return;
					}
					next();
				}
				
			}, context);	
		} else if(processors[seg]){
			var proc = processors[seg];
			proc.init(function(st, err){
					if(err){
						onError(err);
						return;
					}
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