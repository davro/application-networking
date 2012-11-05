$(document).ready(function() {

	$("#fabricator").dialog({ position: [0, 300]
		, minWidth: 360
		, resizable: 0
	}); 
	$("#fabricatorTabs").tabs();
});

$(document).ready(function(){

	window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
	window.URL = window.webkitURL || window.URL;


	var App;
	App = {};
	//App.socket = io.connect('http://nodejs.adhar.net:4000');
	//App.socket = io.connect('http://192.168.0.58:4000');
	App.socket = io.connect('http://localhost:4000');

	// init
	App.container = document.getElementById('container');
	App.jqueryContainer = $('#container');

	//drop image socket
	App.socket.on('dropImg', function(data){

		var imgURL = data.src;
		if(window.BlobBuilder && window.atob){
			//create a blob image url
			var parts = data.src.match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);
			var binStr = window.atob(parts[3]);
			//convert to binary in ArrayBuffer
			var buf = new ArrayBuffer(binStr.length);
			var view = new Uint8Array(buf);
			for(var i = 0; i < view.length; i++)
				view[i] = binStr.charCodeAt(i);
			var builder = new BlobBuilder();
			builder.append(buf);
			imgURL = window.URL.createObjectURL(builder.getBlob(parts[1]));
		}

		$('<img/>')
		.attr('src',imgURL)
		.attr('id',data.id)
		.attr('title',data.name)
		.attr('alt',data.name)
		.css({
			'height' : data.h+'px',
			'width' : data.w+'px', 
			'top' : data.y+'px',
			'left' : data.x+'px',
			'z-index' : data.zindex
		})
		.appendTo(App.jqueryContainer)
		.draggable({
			'containment':'parent',
			'start' : function(event,ui){
				App.imageZindex($(this).attr('id'));
				App.socket.emit('zindexImgSocket', {
					id: $(this).attr('id')
				});	
			},
			'drag' : function(event,ui){
				App.socket.emit('moveImgSocket', {
					id: $(this).attr('id'),
					x: ui.position.left,
					y: ui.position.top
				});	
			},
			'stop' : function(event,ui){
				App.socket.emit('moveImgSocket', {
					id: $(this).attr('id'),
					x: ui.position.left,
					y: ui.position.top
				});	
			}
		})
		.click(function(){
			App.imageZindex($(this).attr('id'));
			App.socket.emit('zindexImgSocket', {
				id: $(this).attr('id')
			});	
		});
		return;
	});
	App.socket.on('moveImg', function(data){
		$('#'+data.id).css({
			'top' : data.y+'px',
			'left' : data.x+'px'
		});
		return;
	});
	App.socket.on('zindexImg', function(data){
		App.imageZindex(data.id);
		return;
	});

	App.imageZindex = function(id){
		var zindexOther = 0;
		var zindexOwn = parseInt($('#'+id).css('z-index'));
		$('#'+id).siblings().each(function(){
			if(parseInt($(this).css('z-index')) > zindexOther){
				zindexOther = parseInt($(this).css('z-index'));
			}
		});
		if(zindexOther >= zindexOwn){
			$('#'+id).css('z-index', (zindexOther+1))
		}
	};

	// image drop event binding
	App.container.addEventListener('dragover', function (e){
		e.preventDefault();
	}, false);
	App.container.addEventListener('dragenter', function (e){
		e.preventDefault();
	}, false);
	App.container.addEventListener('drop', function(e){
		e.preventDefault();
		var x,y;
		x = (e.offsetX > -1) ? e.offsetX : e.layerX;
		y = (e.offsetY > -1) ? e.offsetY : e.layerY;

		var files = e.dataTransfer.files;

		if (!files || !window.FileReader){
			alert('Image drop & drop is not supported in this browser. \nUse Chrome, Firefox or IE 10+');
			return;
		}

		if (files.length > 0) {
			var file = files[0];
			if (file.type.indexOf('image') != -1){
				var name = "";
				if(file.name && file.name.length > 0){
					name = file.name;
				}
				var reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = function (e){
					var img = new Image();
					img.src = e.target.result;
					img.onload = function(){

						// width and height of an image
						var w = img.width;
						var h = img.height;
						var wNew = w;
						var hNew = h;

						if((w > (App.jqueryContainer.width()/2)) || (h > (App.jqueryContainer.height()/2))){
							var ratio = Math.min(((App.jqueryContainer.width()/2)/w), ((App.jqueryContainer.height()/2)/h));
							wNew = w * ratio;
							hNew = h * ratio;
						}


						// position of the image
						x = x-(wNew/2);
						y = y-(hNew/2);
						if(x < 0) x = 0;
						else if(x > (App.jqueryContainer.width()-wNew)) x = App.jqueryContainer.width()-wNew;
						if(y < 0) y = 0;
						else if(y > (App.jqueryContainer.height()-hNew)) y = App.jqueryContainer.height()-hNew;

						//writing the imsage on the div
						var d = new Date();
						var imgId = hex_md5(d.getTime().toString());
						var zindex = 0;
						App.jqueryContainer.find('img').each(function(){
							if(parseInt($(this).css('z-index')) > zindex){
								zindex = parseInt($(this).css('z-index'));
							}
						});

						var imgURL = img.src;
						if(window.BlobBuilder && window.atob){
							//create a blob image url
							var parts = img.src.match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);
							var binStr = window.atob(parts[3]);
							//convert to binary in ArrayBuffer
							var buf = new ArrayBuffer(binStr.length);
							var view = new Uint8Array(buf);
							for(var i = 0; i < view.length; i++)
								view[i] = binStr.charCodeAt(i);
							var builder = new BlobBuilder();
							builder.append(buf);
							imgURL = window.URL.createObjectURL(builder.getBlob(parts[1]));
						}				

						$('<img/>')
						.attr('src',imgURL)
						.attr('id',imgId)
						.attr('title',name)
						.attr('alt',name)
						.css({
							'height' : hNew+'px',
							'width' : wNew+'px', 
							'top' : y+'px',
							'left' : x+'px',
							'z-index' : (zindex+1)
						})
						.appendTo(App.jqueryContainer)
						.draggable({
							'containment' : 'parent',
							'start' : function(event,ui){
								App.imageZindex($(this).attr('id'));
								App.socket.emit('zindexImgSocket', {
									id: $(this).attr('id')
								});	
							},
							'drag' : function(event,ui){
								App.socket.emit('moveImgSocket', {
									id: $(this).attr('id'),
									x: ui.position.left,
									y: ui.position.top
								});	
							},
							'stop' : function(event,ui){
								App.socket.emit('moveImgSocket', {
									id: $(this).attr('id'),
									x: ui.position.left,
									y: ui.position.top
								});	
							}
						})
						.click(function(){
							App.imageZindex($(this).attr('id'));
							App.socket.emit('zindexImgSocket', {
								id: $(this).attr('id')
							});	
						});

						App.socket.emit('dropImgSocket', {
							src: img.src,
							id: imgId,
							name: name,
							zindex: (zindex+1),
							x: x,
							y: y,
							h: hNew,
							w: wNew
						});	


					};
				};
			}
		}
	}, false);

	// create key combination to drag the images to the hard disk
	$(document).bind('keydown keyup',function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if (code == 16){
			if(e.type === "keydown" ){
				App.jqueryContainer.find('img').draggable('disable');
			}
			else if(e.type === "keyup" ){
				App.jqueryContainer.find('img').draggable('enable');
			}
		}
	});
	App.jqueryContainer.bind('mousedown',function(){
		App.jqueryContainer.find('img').draggable('enable');
	});

	//fix ESC keypress issue
	$(document).keypress(function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if (code == 27){
			e.preventDefault();
		}
	});

});

