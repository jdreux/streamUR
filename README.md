StreamUR
========

A very capable asset manager for [node](http://nodejs.org). But also a lot more.

## Installation

    $ npm install streamur

## Asset Manager

It is intuitive to use streamur as a powerful asset (javascript & css) manager, easily allowing to minify and gzip resources. 

Use the `streamur.stream` method to create new streams that map to your resources.

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

That is great for managing your assets but there is more StreamUR can do for you. For instance the jslint processors runs the JSLINT tool on the javscript code and presents the results: 

	/assets/myscript.jslint.json

But JSON is not very nice to read. To get a nicer view of the results, you can use the `prettyjslint` processor that returns HTML: 

	/assets/myscript.prettyjslint.html

There are other useful processors that can be used, see the full list below.

## Streams

Register streams by calling the `streamur.stream(name, locator)` method. 

`name` is that descriptor used for that stream and must be alphanumeric.

`locator` is the path at which this stream can be found. It may be an absolute file path or a URL.

Example:

```js
streamur.stream("jquery", "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.js");
streamur.stream("myscript", __dirname+"/public/js/myscript.js");
```

## Processors

There are a number of processors that apply to different types of streams, and more are in development, stay tuned!

### General Purpose Processors

#### dot (.)
The concatination processor. It groups streams together and chains them to the next processor.

### Javascript Processors

#### min
Minifies javascript code using [uglifyjs](https://github.com/mishoo/UglifyJS/).

#### mini
Minifies css code using [clean-css](https://github.com/GoalSmashers/clean-css).

#### gzip
Gzips the stream and sets the proper header on the response. Uses [gzip](https://github.com/indutny/node.gzip).

#### jslint
Runs [JSLINT](http://www.jslint.com/) on the stream and returns the result as raw JSON.

#### prettyjslint
Runs [JSLINT](http://www.jslint.com/) on the stream and formats the results in HTML format.

#### highlight
Highlights Javascript code in the stream using [highlight](https://github.com/andris9/highlight). Returns HTML

### Header Processors

#### nocache
Sets No-cache headers on the response, telling the client that the resource should not be cached.

#### html
Sets the response's content type as HTML.

#### js
Sets the response's content type as Javascript.

#### json
Sets the response's content type as JSON.

#### css
Sets the response's content type as CSS.

## Aliases

Aliases are useful to shorten the names of resources (such as when many streams are concatenated together). 

There are three different ways to create an alias:

a. Using `streamur.alias(name, expression)`. Example:

```js
streamur.alias('scripts', 'jquery.underscore.myscript1.myscrip2.min');
```

You can then request `scripts.gzip.js` which would yield an identical result as `jquery.underscore.myscript1.myscrip2.min.gzip.js`.

b. Using `streamur.alias(name, function)`. Example:

```js
streamur.alias('scripts', function(alias){
	alias.stream("jquery", __dirname+"/public/js/jquery-1.7.2.js");
	alias.stream("myscript", __dirname+"/public/js/myscript.js");	
});
```
Request `scripts` would be identical to `jquery.myscript`, and the `myscript` and `jquery` streams are also created.

c. Using `streamur.aliasDirectory(name, path)`, where `path` is the name of the folder containing all the files to be created as streams and made part of the alias. Example:

```js
streamur.aliasDirectory('global', __dirname+"/assets/global")
```

In this case, all files in the directory will be made streams. The name of each stream will be the file name, only keeping alphanumeric characters. In some rare cases, this may result in stream name collision.

**The streams will be concatenated in their alphabetical order in the directory. Therefore, this method is not recommended for grouping javascript files that have interdependencies.**


## Caching

StreamUR caches the result of each script access. This is important especially as some processors are CPU intensive and take a long time to complete (e.g. `min`). If you use StreamUR in production, it is recommended that each resource is accessed at least once after server startup to populate the cache.

StreamUR will invalidate the cache if it detects that any of the underlying streams have been modified. This is useful during development, so that the server does not need to be restarted after each update.

*__Warning:__ Cache invalidation relies on Node's `fs.watch` method which is currently [not available on all platforms](http://nodejs.org/api/fs.html#fs_fs_watch_filename_options_listener).*

## License

Source code is licenced under [The MIT License](https://github.com/jdreux/streamUR/blob/master/LICENSE).

## Contributors

This project was initially developped for the  Summer Blast-off Hackathon, Saturday, June 23, 2012.

[git-summary](http://github.com/visionmedia/git-extras):

	project  : streamUR
	repo age : 13 days ago
	active   : 9 days
	commits  : 188
	files    : 26
	authors  : 
	  106	Julien Dreux            56.4%
	   37	Thomas Getgood          19.7%
	   32	Stephen R. Hamilton     17.0%
	   12	ben-zen                 6.4%
	    1	jdreux                  0.5%


