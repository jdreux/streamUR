streamUR
========

A very capable asset manager for [node](http://nodejs.org). But also a lot more.



## Installation

    $ npm install streamur

## Overview


It is intuitive to use streamur as a powerful asset manager, easily allowing to minify and gzip resources. 

Example:

```js
var streamur = require('streamur');

//register a few streams:
streamur.stream("jquery", "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.js");
streamur.stream("myscript", __dirname+"/public/js/myscript.js");


app.use('/assets/', streamur);
```

You can then request:

* /assets/jquery.myscript.js, which will be the combination of both files 
* /assets/jquery.myscript.min.js, same as above but the files are minified.
* /assets/jquery.myscript.min.gzip.js, same as above, but the minified files are gziped.

Streamur revolves around two core concepts: streams (here, 'jquery' and 'myscript') that are user defined and processors (here, '.', 'min', 'gzip' and 'js') that are provided.

## Streams

Register streams by calling the *streamur.stream(name, locator)* method. 

*name* is descriptor used for that stream and can only contain [a-z0-9].

*locator* is the path at which this stream can be found. It can be an absolute file path or a URL.

## Processors

There are a number of processors that apply to different types of streams, and more are in development, stay tuned!

### .
'.' is the concatination

## License

Source code is licenced under [The MIT License](https://github.com/jdreux/streamUR/blob/master/LICENSE)

## Contributors

This project was initially developped for the  Summer Blast-off Hackathon, Saturday, June 23, 2012. 