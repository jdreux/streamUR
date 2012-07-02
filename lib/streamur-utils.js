var ejs = require('ejs'),
	fs = require('fs');

module.exports = utils = {};


utils.streamToString = function(buffer, callback){
	
	var result = '';
	buffer.resume();
	buffer.on('data', function(chunk){
		result += chunk;
	});
	
	buffer.on('end', function(){
		callback(result);
	})
}

utils.renderTemplate = function(path, view, callback){
	view.filename = path;
	view.cache = true;
	fs.readFile(path, 'utf8', function(err, data){
		if(err) throw err;
		callback(ejs.render(data, view));
	});
}