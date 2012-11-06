$(document).ready(function() {

	$("#fabricator").dialog({ position: [0, 300]
		, minWidth: 360
		, resizable: 0
	}); 
	$("#fabricatorTabs").tabs();
});

$(function(){
	
	
	// Check the context supports the canvas element.
	if(!('getContext' in document.createElement('canvas'))) {
		alert('Canvas support is required, what rock are you living under!');
		return false;
	}

	// URL (port set in node/application.js)
	var url = 'http://davro.net:4000';

//	console.log('URL: ' + url);

	var doc = $(document),
		win = $(window),
		canvas = $('#paper'),
		context = canvas[0].getContext('2d'),
		instructions = $('#instructions');

	// Generate timestamp based ID
	var id = Math.round($.now()*Math.random());

	// Drawing activity
	var drawing = false;
	
	// Container for holding, users and cursors
	var users = {};
	var cursors = {};
	
	// Create the io socket from the url.
	var socket = io.connect(url);

	socket.on('moving', function (data) {

		if (!(data.id in users)) {
			
			// New user has come online. create a new cursor.
			cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
		}

		// Move the mouse pointer.
		cursors[data.id].css({
			'left' : data.x,
			'top' : data.y
		});

		// User drawing?
		if(data.drawing && users[data.id]) {

			// Draw on canvas user activity.
			drawLine(users[data.id].x, users[data.id].y, data.x, data.y);
		}

		// Saving the current client state.
		users[data.id] = data;
		users[data.id].updated = $.now();
	});

	var prev = {};

	canvas.on('mousedown',function(e) {
		e.preventDefault();
		drawing = true;
		prev.x = e.pageX;
		prev.y = e.pageY;

		// Hide the instructions.
		instructions.fadeOut();
	});

	doc.bind('mouseup mouseleave',function() {
		drawing = false;
	});

	var lastEmit = $.now();

	doc.on('mousemove',function(e) {
		
		if($.now() - lastEmit > 30) {
			socket.emit('mousemove', {
				'x': e.pageX,
				'y': e.pageY,
				'drawing': drawing,
				'id': id
			});
			lastEmit = $.now();
		}

		// Draw a line for the local movement.
		if(drawing) {

			drawLine(prev.x, prev.y, e.pageX, e.pageY);

			prev.x = e.pageX;
			prev.y = e.pageY;
		}
	});

	// Remove after 10 seconds.
	setInterval(function() {
		for(user in users) {
			if($.now() - users[user].updated > 10000) {
				cursors[user].remove();
				delete users[user];
				delete cursors[user];
			}
		}

	},10000);

	function drawLine(fromx, fromy, tox, toy) {
		context.moveTo(fromx, fromy);
		context.lineTo(tox, toy);
		context.stroke();
	}

});