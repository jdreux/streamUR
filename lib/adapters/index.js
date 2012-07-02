var	StreamAdapter = require('./StreamAdapter'),
	fs = require ('fs'),
	FileAdapter = StreamAdapter.FileAdapter,
//	TwitterAdapter = require('./StreamAdapter').TwitterAdapter,
	HTTPAdapter = StreamAdapter.HTTPAdapter;
	HTTPSAdapter = StreamAdapter.HTTPSAdapter;

module.exports = {
	streams : StreamAdapter.streams,
	registerStream: function(name, argument){
		if(typeof argument !== "string"){
			throw "Unsupported stream: "+argument;
		}

		if(argument.indexOf('https')==0){
			//HTTPS stream
			HTTPSAdapter.add(name, argument);
			return true;
		} else if(argument.indexOf('http')==0){
			//HTTP stream
			HTTPAdapter.add(name, argument);
			return true;
		} else {
			try {
				var stats = fs.statSync(argument);
				
			    // Query the entry
			    if (stats.isFile()) {
			        //File stream
					FileAdapter.add(name, argument);
					return true;
			    } else {
					throw "Unsupported stream: "+argument;
				}
			} catch (e) {
				console.error(e);
			    throw "Unsupported stream: "+argument;
			}
		}
	}
}