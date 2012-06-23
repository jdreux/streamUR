var fs = require("fs");

var streams = exports.streams = {};

function JavascriptAdapter(name) {
  this.init(name);
}

JavascriptAdapter.prototype = {
  type: "javascript",
  
  init: function(name) {
    this._fileName = name;
  },

  openStream: function() {
    stream = fs.createReadStream(this.name); 
    return stream;
  }
}

JavascriptAdapter.add = function(name, filename) {
  streams[name] = new JavascriptAdapter(filename);
}

JavascriptAdapter.add("stream1","stream1.js");
JavascriptAdapter.add("stream2","stream2.js");

exports.JavascriptAdapter = JavascriptAdapter;
