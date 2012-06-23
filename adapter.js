var fs = require("fs");

var streams = exports.streams = {};

function JavascriptAdapter(name) {
  this.init(name);
}

JavascriptAdapter.prototype = {
  type: "js",
  
  init: function(name) {
    this._fileName = name;
  },

  openStream: function() {
    stream = fs.createReadStream(this._fileName); 
	stream.type = this.type;
	stream.pause();
    return stream;
  }
}

JavascriptAdapter.add = function(name, filename) {
  streams[name] = new JavascriptAdapter(filename);
}

JavascriptAdapter.add("stream1","stream1.js");
JavascriptAdapter.add("stream2","stream2.js");
JavascriptAdapter.add("jquery","jquery-1.7.2.js");

exports.JavascriptAdapter = JavascriptAdapter;
