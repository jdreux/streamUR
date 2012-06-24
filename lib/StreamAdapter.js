var fs = require("fs");
var https = require("https");
var querystring = require('querystring');
var util = require("util");
var twitter = require("twitter");
var streamurtwt = new twitter({
  consumer_key: "7NpTkV3TGiQpWFJYAYRsg",
  consumer_secret: 'GHv3exIasVzfXeY1jW8Gl9F1r2M6Tzf9rFiIl8aYTK8',
  access_token_key: '616344256-CGwdvTVW9COdWqSBklGdZiF7ABMVGhzBMlDfNul2',
  access_token_secret: 'UQBRlxXepVo6aFHIj6jYhlS842wzOFiop57ZdJSpi1s'
});

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
	var me = this;
    this._name = name;
    this._username = options["username"];
    this._password = options["password"];
    this.options = options;
	
	if(this.options["follow"]) {
		console.log("Retrieving user id for "+this.options["follow"]);
		streamurtwt.showUser(this.options["follow"], function(user_info){
			me.userId = user_info["id"];
			console.log(me.options["follow"]+" : "+me.userId);
		});
	}
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
    console.info(post_data);
    treq.write(post_data);
  },

  _generate_filter_options: function(options) {
    parsed = {};
    if( options["track"]){
      parsed["track"] = options["track"];
    }

    if( options["follow"]){
      console.info(options["follow"]);
      parsed["follow"] = this.userId;
    }
    return parsed;
  }

}

TwitterAdapter.add = function(name, options) {
  streams[name] = new TwitterAdapter(name,options);
}

function HTTPAdapter(name) {
  this.init(name)
}

HTTPAdapter.prototype = {
	type: 'http',
	init: function(url){
		this.url = url;
	},
	
	openStream: function(callback) {
		
	}
}


HTTPAdapter.add = function(name, url){
	streams[name] = new HTTPAdapter(name,options);
}


exports.JavascriptAdapter = JavascriptAdapter;
exports.TwitterAdapter = TwitterAdapter;
