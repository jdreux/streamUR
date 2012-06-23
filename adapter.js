var fs = require("fs");

export.streams = {"jquery":JavascriptAdapter("jquery.js")};

function JavascriptAdapter(name) {
  this.init(name);
}

JavascriptAdapter.prototype = {
  type: "javascript",
  
  init: function(name) {
    this._fileName = name;
  },

  openStream: function() {
    this.stream = fs.createReadStream(this.name); 
  }
  closeStream: function() {
    this.stream.destroy();
  }
}
