// Some interface tools so that the HTML isn't cluttered.

function getStreams() {
    $.get("/streams",function(data){
	    $('.streamButton').before(buildStreams(data));
	} )
	.error( function() { alert("No streams found!"); } ); 
    $('.streamButton').prepend('<p>Where streams go.</p>');
    return false;
}

function getProcessors() {
    $.get("/processors",function(data){
	    $('.processorButton').before(data);
	} )
	.error(function() { alert("No processors found!"); }
    );
    $('.processorButton').prepend('<p>Where processors go.</p>');
    return false;
}

function sendForm() {
    // Still needs to be written!
    // I need to know what format is desired.
}

function buildStreams(data){
    var streamTypes = jQuery.parseJSON(data);
    var streamList = '<div class="streamList"><br />';
    for ( var i in streamTypes ) {
	streamList = streamList + '<div class="'+streamTypes[i].type+'"><a href=""
    class="button" onclick="return
    selectStream('+JSON.stringify(streamTypes[i])+')">'+streamTypes[i].name+'</a></div><br
    />';
    }
    streamList = streamList+'</div>';
    return streamList;
}

function selectStream(selType){
    var selectedType = jQuery.parseJSON(selType);
    $('.streamList').before('<div
    class="selectedStream">'+selectedType.name+' <input
    name="streamName" required></div>');
    $('.streamList').remove();
    return false;
}
    

function buildProcessors(data){
    var processorTypes = jQuery.parseJSON(data);
    var processorList = '<div class="processorList"><br />';
    for ( var i in processorTypes ) {
	processorList = processorList + '<div
    class="'+processorTypes[i].type+'"><a href=""
    class="button" onclick="return
    selectProcessor('+JSON.stringify(processorTypes[i])+')">'+processorTypes[i].name+'</a></div><br
    />';
    }
    processorList = processorList+'</div>';
    return processorList;
}

function selectProcessor(selType){
    var selectedType = jQuery.parseJSON(selType);
    $('.processorList').before('<div
    class="selectedProcessor">'+selectedType.name+'</div>');
    $('.processorList').remove();
    return false;
}