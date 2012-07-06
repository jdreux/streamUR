var fs = require("fs");
var https = require("https");
var http = require("http");
var util = require("util");
//var twitter = require("twitter");
var url = require('url');
/*
var streamurtwt = new twitter({
    consumer_key: "7NpTkV3TGiQpWFJYAYRsg",
    consumer_secret: 'GHv3exIasVzfXeY1jW8Gl9F1r2M6Tzf9rFiIl8aYTK8',
    access_token_key: '616344256-CGwdvTVW9COdWqSBklGdZiF7ABMVGhzBMlDfNul2',
    access_token_secret: 'UQBRlxXepVo6aFHIj6jYhlS842wzOFiop57ZdJSpi1s'
});
*/
var streams = exports.streams = {};

function FileAdapter(name) {
    if (!name) {
        throw "Cannot initiate File Adapter without a file name!";
    }
    this._fileName = name;
}

FileAdapter.prototype.init = function(callback, context) {
    stream = fs.createReadStream(this._fileName);
    stream.type = this.type;
    stream.pause();
    context.cacheable = true;
	
	//Watch the file for changes
	fs.watch(this._fileName).on('change', function(){
		context.emit('change');
	});
	
    if (callback) callback(stream);
}

FileAdapter.add = function(name, filename) {
    streams[name] = new FileAdapter(filename);
}

function JavascriptAdapter(name) {
    FileAdapter.call(this, name);
}

JavascriptAdapter.prototype.type = "js";

util.inherits(JavascriptAdapter, FileAdapter);

JavascriptAdapter.add = function(name, filename) {
    streams[name] = new JavascriptAdapter(filename);
}

function HTTPAdapter(_url) {
    var parsed = url.parse(_url);
    this.options = {
        host: parsed.hostname,
        port: parsed.port,
        path: parsed.path
    };
}

HTTPAdapter.prototype.init = function(callback, context) {
	context.cacheable = true;
    http.get(this.options, function(res) {
        if (res.statusCode != 200) {
            throw "Could not initialize stream for " + url.format(this.options) + ": " + res.statusCode;
        }

        if (res.headers['Content-Type']) {
            var contentType = res.headers['Content-Type'];
            if (contentType == 'application/js' || contentType == 'application/javascript') {
                this.type = 'js';
            } else if (contentType == 'application/json') {
                this.type = 'json';
            }
        }

        res.type = this.type;
		res.pause();
		res.on('data', console.log)
        callback(res);
    });
};

HTTPAdapter.add = function(name, url) {
    streams[name] = new HTTPAdapter(url);
}

function HTTPSAdapter(_url) {
    var parsed = url.parse(_url);
    this.options = {
        host: parsed.hostname,
        port: parsed.port,
        path: parsed.path
    };
}

HTTPSAdapter.prototype.init = function(callback, context) {
	context.cacheable = true;
    https.get(this.options,
    function(res) {
        if (res.statusCode != 200) {
            throw "Could not initialize stream for " + url.format(this.options) + ": " + res.statusCode;
        }

        if (res.headers['Content-Type']) {
            var contentType = res.headers['Content-Type'];
            if (contentType == 'application/js' || contentType == 'application/javascript') {
                this.type = 'js';
            } else if (contentType == 'application/json') {
                this.type = 'json';
            }
        }

        res.type = this.type;
		res.pause();
        callback(res);
    });
};

HTTPSAdapter.add = function(name, url) {
    streams[name] = new HTTPSAdapter(url);
}


/*
function TwitterAdapter(name, options) {
    this._name = name;
    this._username = options["username"];
    this._password = options["password"];
    this.options = options;
}

TwitterAdapter.prototype.type = "twitter";
TwitterAdapter.prototype.init = function(callback, context) {
    var auth = "Basic " + new Buffer(this._username + ':' + this._password).toString("base64");
	
	var me = this;
	
    var connect = function() {
		
		var parsed = {};
	    if (me.options["track"]) {
	        parsed["track"] = me.options["track"];
	    }

	    if (me.options["follow"]) {
	        parsed["follow"] = me.userId;
	    }
		console.log(parsed);
	    var post_data = querystring.stringify(parsed);

	    var twitter_options = {
	        host: "stream.twitter.com",
	        method: "POST",
	        path: "/1/statuses/filter.json",
	        headers: {
	            'Content-Type': 'application/x-www-form-urlencoded',
	            'Content-Length': post_data.length,
	            'Authorization': auth
	        }
	    };
		
        var treq = https.request(twitter_options,
        function(tres) {
            tres.type = "twitter";
			tres.pause();
            callback(tres);
        });
        treq.write(post_data);
    }

    if (this.options["follow"]) {
        console.log("Retrieving user id for " + this.options["follow"]);
        streamurtwt.showUser(this.options["follow"],
        function(user_info) {
            me.userId = user_info["id"];
            connect();
        });
    } else {
        connect();
    }
}

TwitterAdapter.add = function(name, options) {
    streams[name] = new TwitterAdapter(name, options);
}
*/

exports.JavascriptAdapter = JavascriptAdapter;
//exports.TwitterAdapter = TwitterAdapter;
exports.HTTPAdapter = HTTPAdapter;
exports.HTTPSAdapter = HTTPSAdapter;
exports.FileAdapter = FileAdapter;