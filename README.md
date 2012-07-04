StreamUR
========

A very capable asset manager for [node](http://nodejs.org). But also a lot more.

## Installation

    $ npm install streamur

## Asset Manager

It is intuitive to use streamur as a powerful asset manager, easily allowing to minify and gzip resources. 

Example:

```js
var streamur = require('streamur');

//register a few streams:
streamur.stream("jquery", "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.js");
streamur.stream("myscript", __dirname+"/public/js/myscript.js");

app.use('/assets/', streamur());
```

You can then request:

* /assets/jquery.myscript.js, which will be the combination of both files 
* /assets/jquery.myscript.min.js, same as above but the files are minified.
* /assets/jquery.myscript.min.gzip.js, same as above, but the minified files are gziped.

StreamUR revolves around two core concepts: streams ('jquery' and 'myscript') that are user defined and processors ('.', 'min', 'gzip' and 'js') that are provided.


## Other uses

That's great for managing your assets but there is more StreamUR can do for you. For instance the jslint processors runs the JSLINT tool on the javscript code and presents the results: 

	/assets/myscript.jslint.json

Makes it easy for you to check how well your code is doing!

But JSON is not very nice to read. To get a nicer view of the results, you can use the *prettyjslint* processor that returns HTML: 

	/assets/myscript.prettyjslint.html

There are other useful processors that can be used, see the full list below.

## Streams

Register streams by calling the *streamur.stream(name, locator)* method. 

*name* is descriptor used for that stream and can only contain [a-z0-9].

*locator* is the path at which this stream can be found. It may be an absolute file path or a URL.

Example:

```js
streamur.stream("jquery", "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.js");
streamur.stream("myscript", __dirname+"/public/js/myscript.js");
```

## Processors

There are a number of processors that apply to different types of streams, and more are in development, stay tuned!

### dot (.)
The concatination processor for streams. It groups streams together and chains them to the next processor.

### min
Minifies javascript code using [uglifyjs](https://github.com/mishoo/UglifyJS/).

### gzip
Gzips files and sets the proper header on the response. Uses [gzip](https://github.com/indutny/node.gzip).

### jslint
Runs [JSLINT](http://www.jslint.com/) on the stream and returns the result as raw JSON.

### prettyjslint
Runs [JSLINT](http://www.jslint.com/) on the stream and formats the results in HTML format.

### highlight
Highlights Javascript code in the stream using [highlight](https://github.com/andris9/highlight). Returns HTML

### nocache
Sets No-cache headers on the response, telling the client that the resource should not be cached.

### html
Sets the response's content type as HTML.

### js
Sets the response's content type as Javascript.

### json
Sets the response's content type as JSON.

### css
Sets the response's content type as CSS.

## Aliases

Aliases are useful to shorten the names of ressources (such as when many streams are concatinated together). To create an alias, use *streamur.alias(name, alias)*.

Example:
```js
streamur.alias('scripts', 'jquery.underscore.myscript1.myscrip2.min');
```

You can then request *scripts.gzip.js* which would yield an identical result as *jquery.underscore.myscript1.myscrip2.min.gzip.js*.

## Caching

StreamUR caches the result of each script access. This is important especially as some processors are CPU intensive and take a long time to complete (e.g. min). If you use StreamUR in production, it is recommended that each resource is accessed at least once after server startup to populate the cache.

## License

Source code is licenced under [The MIT License](https://github.com/jdreux/streamUR/blob/master/LICENSE).

## Contributors

This project was initially developped for the  Summer Blast-off Hackathon, Saturday, June 23, 2012.

[git-summary](http://github.com/visionmedia/git-extras):

	project  : streamUR
	repo age : 10 days ago
	active   : 6 days
	commits  : 166
	files    : 25
	authors  : 
	   84	Julien Dreux            50.6%
	   37	Thomas Getgood          22.3%
	   32	Stephen R. Hamilton     19.3%
	   12	ben-zen                 7.2%
	    1	jdreux                  0.6%