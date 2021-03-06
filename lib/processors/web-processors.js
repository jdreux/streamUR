var createProcessor = require('./StreamProcessor').createProcessor,
	jsp = require("uglify-js").parser,
	pro = require("uglify-js").uglify,
	BufferedStream = require('../BufferedStream'),
	gzip = require('gzip'),
	JSLINT = require('../../support/jslint.js'),
	highlight = require('highlight').Highlight,
	streamurUtils = require('../streamur-utils'),
	ejs = require('ejs'),
	cleancss = require('clean-css'),
	less = require('less');


//JS PROCESSORS
//min
createProcessor('min', function(callback, context, stream) {

    var out = new BufferedStream();
    var orig_code = "";

    // stream.setEncoding('utf8');
    stream.resume();
    stream.on('data', function(chunk) {
        orig_code += chunk;
    });
    stream.on('end', function() {
        try{
			var ast = jsp.parse(orig_code);
	        // parse code and get the initial AST
	        ast = pro.ast_mangle(ast);
	        // get a new AST with mangled names
	        ast = pro.ast_squeeze(ast);
	        // get an AST with compression optimizations
	        var final_code = pro.gen_code(ast);
	        // compressed code here
			
		} catch(err){
			callback(null,err);
			return;
		}
		
        out.write(final_code);
        out.end();
    });
    callback(out);
});

//gzip
createProcessor('gzip', function(callback, context, stream) {
    var out = new BufferedStream();
    var orig_code = "";
    context.headers["Content-Encoding"] = "gzip";
    stream.resume();
    // stream.setEncoding('utf8');
    stream.on('data', function(chunk) {
        orig_code += chunk;
    });
    stream.on('end', function() {
        gzip(orig_code, function(err, data) {
            // By default:
            //   compression = 8
            //   encoding = utf8
            if (err) {
                callback(null, err);
				return;
            }
            out.write(data);
            out.end();
        });
    });
    callback(out);
});

//jslint
createProcessor('jslint', function(callback, context, stream) {
	var out = new BufferedStream();
    
	streamurUtils.streamToString(stream, function(source){
		out.write(JSON.stringify(JSLINT(source) ? true: JSLINT.errors, null, '\t'));
		out.end();
	});
	callback(out);
});

//prettyjslint
createProcessor('prettyjslint', function(callback, context, stream){
	var out = new BufferedStream();
	
	streamurUtils.streamToString(stream, function(source){
		var linted = JSLINT(source);
		var view = {
			result: linted,
			errors: JSLINT.errors
		};
		streamurUtils.renderTemplate(__dirname+'/assets/templates/prettylint.html', view, function(html){
			out.write(html);
			out.end();
		});
	});
	
	callback(out);
});

//highlight
createProcessor('highlight', function(callback, context, stream){
	
	var out = new BufferedStream();
	streamurUtils.streamToString(stream, function(source){
		streamurUtils.renderTemplate(__dirname+'/assets/templates/highlight.html', {highlighted: highlight(source)}, function(html, err){
			if(err){
				callback(null, err);
				return;
			}
			out.write(html);
	        out.end();
		});
	});
    callback(out);	
});

//CSS

//mini = min
createProcessor('mini', function(callback, context, stream){
	var out = new BufferedStream();
	streamurUtils.streamToString(stream, function(source){
		out.write(cleancss.process(source));
		out.end();
	});
    callback(out);
});

//less
createProcessor('less', function(callback, context, stream){
	
	var out = new BufferedStream();
	streamurUtils.streamToString(stream, function(source){
		less.render(source, function(e, css){
			if(e){
				callback(null, e);
				return;
			}
			out.write(css);
			out.end();
		});
	});
    callback(out);
	
});


//HEADER SETTERS
createProcessor('nocache', function(callback, context, stream) {
    context.headers["Cache-Control"] = "no-cache, must-revalidate";
    context.headers["Expires"] = "Sat, 26 Jul 1997 05:00:00 GMT";
    callback(stream);
});

//FILE TYPES
//html
createProcessor('html', function(callback, context, stream) {
    context.headers['Content-Type'] = "text/html";
    callback(stream);
});

//png
createProcessor('png', function(callback, context, stream) {
    context.headers['Content-Type'] = "image/png";
    callback(stream);
});

//js
createProcessor('js', function(callback, context, stream) {
    context.headers['Content-Type'] = "application/javascript";
    callback(stream);
});

//json
createProcessor('json', function(callback, context, stream) {
    context.headers['Content-Type'] = "application/json";
    callback(stream);
});

//css
createProcessor('css',
function(callback, context, stream) {
    context.headers['Content-Type'] = "text/css";
    callback(stream);
});


// gif
createProcessor('gif', function(stream) {
    context.headers['Content-Type'] = "image/gif";
    callback(stream);
});