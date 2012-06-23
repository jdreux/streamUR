// Some interface tools so that the HTML isn't cluttered.

$(function(){
	getStreams();
//	getProcessors();
});

function getStreams() {
    $.get("/streams",function(data){
		var html = buildStreams(data);
		console.log(html);
	    $('.streamButton').before(html);
	} )
	.error( function() { alert("No streams found!"); } ); 
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
    var streamTypes = data;
    var streamList = '<div class="streamList"><br />';
    for ( var i in streamTypes ) {
	streamList = streamList + '<div class="'+streamTypes[i].type+'"><a href="" class="button" onclick="return selectStream('+
		JSON.stringify(streamTypes[i])+')">'+streamTypes[i].name+'</a></div><br/>';
    }
    streamList = streamList+'</div>';
    return streamList;
}

function selectStream(selType){
    var selectedType = jQuery.parseJSON(selType);
    var html = '<div class="selectedStream">'+selectedType.name+' <input name="streamName" required></div>';
    $('.streamList').before(html);
    $('.streamList').remove();
    return false;
}
    

function buildProcessors(data){
    var processorTypes = jQuery.parseJSON(data);
    var processorList = '<div class="processorList"><br />';
    for ( var i in processorTypes ) {
	processorList = processorList + '<div class="'+processorTypes[i].type+'"><a href="" class="button" onclick="return selectProcessor('
		+JSON.stringify(processorTypes[i])+')">'+processorTypes[i].name+'</a></div><br/>';
    }
    processorList = processorList+'</div>';
    return processorList;
}

function selectProcessor(selType){
    var selectedType = jQuery.parseJSON(selType);
    $('.processorList').before('<div class="selectedProcessor">'+selectedType.name+'</div>');
    $('.processorList').remove();
    return false;
}

function addStream(){
	var html = '<form>';
	html += '<input type="text" />';
	$('#mainView').html(html);
	return false;
}