// Some interface tools so that the HTML isn't cluttered.

function getStreams() {
    $.get("StreamSources",function(data){
	    $('.streamButton').prepend(data);
	} )
	.error( function() { alert("No streams found!"); } ); 
	//	.error($('.streamButton').prepend('<p>No streams
	//    found!</p>'));
    $('.streamButton').prepend('<p>Where streams go.</p>');
    return false;
}

function getProcessors() {
    $.get("Processors",function(data){
	    $('.processorButton').prepend(data);
	} )
	.error(function() { alert("No processors found!"); }
    );
    $('.processorButton').prepend('<p>Where processors go.</p>');
    return false;
}