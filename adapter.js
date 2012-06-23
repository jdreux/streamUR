var fs = require("fs");
var http = require("http");
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

JavascriptAdapter.add("stream1","stream1.js");
JavascriptAdapter.add("stream2","stream2.js");
JavascriptAdapter.add("jquery","jquery-1.7.2.js");

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

    var post_data = querystring.stringify({
      track: this.options["track"]
    });

    var twitter_options = {
      host: "stream.twitter.com",
      port: "80",
      method: "POST",
      path: "/1/statuses/filter.json",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': post_data.length,
        'Authorization': auth
      }
    };

    var treq = http.request(twitter_options, function(tres) {
      tres.type = "twitter";
      callback(tres);
    });
    treq.write(post_data);

  }
}

TwitterAdapter.add = function(name, options) {
  streams[name] = new TwitterAdapter(name,options);
}

TwitterAdapter.add("streamur",{username: "streamur",password: "streamur1", track:"test"});

exports.JavascriptAdapter = JavascriptAdapter;
exports.TwitterAdapter = TwitterAdapter;
