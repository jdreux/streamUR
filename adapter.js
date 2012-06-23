var fs = require("fs");
var https = require("https");
var querystring = require('querystring');

var streams = exports.streams = {};

function JavascriptAdapter(name) {
  this.init(name);
}

JavascriptAdapter.prototype = {
  type: "js",
  
  init: function(name) {
    this._fileName = name;
  },

  openStream: function(callback) {
    stream = fs.createReadStream(this._fileName); 
    stream.type = this.type;
    stream.pause();
    callback(stream);
  }
}

JavascriptAdapter.add = function(name, filename) {
  streams[name] = new JavascriptAdapter(filename);
}

function TwitterAdapter(name, options) {
  this.init(name,options)
}

TwitterAdapter.prototype = {
  type: "twitter",

  init: function(name,options) {
    this._name = name;
    this._username = options["username"];
    this._password = options["password"];
    this.options = options;
  },

  openStream: function(callback) {
    var auth = "Basic " + new Buffer(this._username + ':' + this._password).toString("base64");

    var post_data = querystring.stringify(this._generate_filter_options(this.options));

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

    var treq = https.request(twitter_options, function(tres) {
      tres.type = "twitter";
      callback(tres);
    });
    treq.write(post_data);

  },

  _generate_filter_options: function(options) {
    parsed = {};
	if( options["track"]){
		parsed["track"] = options["track"];
	}
	
	if( options["follow"]){
		parsed["follow"] = options["follow"];
	}
    return parsed;
  }
}

TwitterAdapter.add = function(name, options) {
  streams[name] = new TwitterAdapter(name,options);
}

exports.JavascriptAdapter = JavascriptAdapter;
exports.TwitterAdapter = TwitterAdapter;
