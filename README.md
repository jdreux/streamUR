streamUR
========

A very capable asset manager for [node](http://nodejs.org). But also a lot more.



## Installation

    $ npm install streamur

## Overview

This project was initially developped for the  Summer Blast-off Hackathon, Saturday, June 23, 2012. Its purpose was to be a fully modular stream processor.Streamur revolves around two core concepts: streams that are user defined and processors that are provided. 

It is intuitive to use streamur as a powerful asset manager, easily allowing to minify and gzip resources. 

Example:

```js
var streamur = require('streamur');

//register a few streams:
streamur.stream("jquery", __dirname+"/public/js/jquery-1.7.2.js");
streamur.stream("myscript", __dirname+"/public/js/myscript.js");


app.use(streamur);
```

You can then request:

* jquery.myscript.js, which will be the combination of both files 
* jquery.myscript.min.js, same as above but the files are minified.
* jquery.myscript.min.gzip.js, same as above, but the minified files are gziped. 

