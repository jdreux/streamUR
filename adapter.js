var fs = require("fs");
var https = require("https");
var querystring = require('querystring');
var util = require("util");
var twitter = require("twitter");
var streamur = new twitter({
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
    this._name = name;
    this._username = options["username"];
    this._password = options["password"];
    this.options = options;
  },

  openStream: function(callback) {
    if (this.options["follow"] && this.options["follow"] instanceof Array) {
      this.find_names_and_call_back(this.options["follow"],[],callback)
    }
    else if(this.options["follow"]) {
      this.find_names_and_call_back([this.options["follow"]],[],callback)
    }
    else {
      openStreamfinally(callback);
    }
  },
  openStreamfinally: function(callback) {
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
      parsed["follow"] = options["follow"];
    }
    return parsed;
  },

  find_names_and_call_back: function(names,ids,callback) {
    if (names.length == 0) {
      this.options["follow"] = ids;
      this.openStreamfinally(callback);
    }
    else {
      var name = names.pop();
      var call = this.push_id_and_back.bind(this,callback,names,ids);
      streamur.showUser(name,call);
    }
  },

  push_id_and_back: function(callback,names,ids,user_info) {
    ids.push(user_info["id"]);
    this.find_names_and_call_back(names,ids,callback);
  }

}

TwitterAdapter.add = function(name, options) {
  streams[name] = new TwitterAdapter(name,options);
}

exports.JavascriptAdapter = JavascriptAdapter;
exports.TwitterAdapter = TwitterAdapter;
