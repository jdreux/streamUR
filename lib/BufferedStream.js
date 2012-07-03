var stream = require('stream')
  , fs = require('fs')
  , util = require('util');

module.exports = BufferedStream = function () {
  this.writable = true;
  this.readable = true;
}

util.inherits(BufferedStream, stream.Stream);

if (!stream.Stream.prototype.pause) {
  BufferedStream.prototype.pause = function() {
    this.emit('pause');
  };
}

if (!stream.Stream.prototype.resume) {
  BufferedStream.prototype.resume = function() {
    this.emit('resume');
  };
}

BufferedStream.prototype.write = function (chunk) {
    this.emit('data', chunk);
    return;
}

BufferedStream.prototype.end = function () {
    this.emit('end');
}

