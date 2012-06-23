var stream = require('stream')
  , fs = require('fs')
  , util = require('util');


var OurStream = function (limit) {
  if (typeof limit === 'undefined') {
    limit = Infinity;
  }
  this.limit = limit;
  this.size = 0;
  this.chunks = [];
  this.writable = true;
  this.readable = true;
}

util.inherits(OurStream, stream.Stream);