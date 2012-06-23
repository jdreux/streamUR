// Some interface tools so that the HTML isn't cluttered.
var streams;


$(function(){
	getStreams();
//	getProcessors();
});

function getStreams() {
    $.get("/streams",function(data){
		streams = data;
		var html = buildStreams(data);
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

function buildStreams(data){
    var streamTypes = data;
    var streamList = '<div class="streamList"><br />';
    for ( var i in streamTypes ) {
	streamList = streamList + '<div class="'+streamTypes[i].type+'"><a href="#" class="button" onclick="return selectStream('+
		i+')">'+streamTypes[i].name+'</a></div><br/>';
    }
    streamList = streamList+'</div>';
    return streamList;
}

function selectStream(i){
	var stream = streams[i];
    var html = '<h2>'+stream.name+'</h2>';
	html += '<p>Type: '+stream.type+'</p>';
	html += '<p>Filename: '+stream.filename+'</p>';
	$('#mainView').html(html);
	
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
	var html = '<div class="newStreamForm"><form id="newStream" enctype="multipart/form-data" method="post" target="/streams" onSubmit="return sendForm()">';
	html += '<p>Name: <input type="text" name="name" /></p>';
	html += '<p>Type:</p>';
	html += '<p><input type="radio" name="type" value="js" /> js</p>';
//	html += '<p><input type="radio" name="type" value="image" /> Image</p>';
	html += '<p><input type="radio" name="type" value="twitter" /> Twitter</p>';
//	html += '<p><input type="submit" value="Next" /></p>';
	html += '</form>';
	html += '<div class="sendButton"><a href="" class="button next" onclick="return sendForm()">streamUR</a></div></div>';
	
	$('#mainView').html(html);
	return false;
}

function sendForm() {
    console.log("Sending form");
    var selected = $('input:radio[name=type]:checked').val();
    if ( selected == "js" ) {
	$('.newStreamForm').after('<form><p>Select file: <input type="file" name="inputFile" size="40" /></p> <p><input type="submit" value="Go!" /></p></form>');
    }
    if ( selected == "twitter" ) {
	$('.newStreamForm').after('<form><p>Track: <input type="text" name="trackWords" /></p> <p>Follow: <input type="text" name="followUser" /></p><p><input type="submit" value="Go!" /></p></form>');
    }


    return false;

}

