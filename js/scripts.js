$(document).ready(function(){

    var App;
    App = {};
//    App.socket = io.connect('http://nodejs.adhar.net:4000');
    //App.socket = io.connect('http://192.168.0.58:4000');
    App.socket = io.connect('http://localhost:4000');
	
    // control values
    App.colorString = $('#color').val();
    App.fillColorString = 'rgba(0,0,0,0)';
    App.lineWidth = parseInt($('#linewidth').val());
    App.eraserWidth = parseInt($('#eraserwidth').val());
    App.tool = $('#tool').val();
	App.resetTools = function(){
		if(App.tool == "pencil"){
			$('#color').parent().show();
			$('#linewidth').parents('.tool').show();
			$('#fillcolor').parent().hide();
			$('#eraserwidth').parent().hide();
			$('#clearcanvas').parent().hide();
			$('#container').removeClass('eraser');
		}else if(App.tool == "rect"){
			$('#color').parent().show();
			$('#linewidth').parents('.tool').show();
			$('#fillcolor').parent().show();
			$('#eraserwidth').parent().hide();
			$('#clearcanvas').parent().hide();
			$('#container').removeClass('eraser');
		}else if(App.tool == "circle"){
			$('#color').parent().show();
			$('#linewidth').parents('.tool').show();
			$('#fillcolor').parent().show();
			$('#eraserwidth').parent().hide();
			$('#clearcanvas').parent().hide();
			$('#container').removeClass('eraser');
		}else if(App.tool == "eraser"){
			$('#color').parent().hide();
			$('#linewidth').parents('.tool').hide();
			$('#fillcolor').parent().hide();
			$('#eraserwidth').parent().show();
			$('#clearcanvas').parent().show();
			$('#container').addClass('eraser');
			$('#container').addClass('eraser'+App.eraserWidth);
		}
	};
	App.resetTools();
    $('#tool,#linewidth').msDropDown();

    // init
    App.container = document.getElementById('container');
    App.canvas = document.getElementById('drawingboard');
    App.ctx = App.canvas.getContext("2d");
    App.ctx.strokeStyle = App.colorString;
    App.ctx.fillStyle = App.fillColorString;
    App.ctx.lineWidth = App.lineWidth;
    App.ctx.lineCap = "round";
    App.tempCanvas = document.getElementById('tempCanvas');
    App.tempCtx = App.tempCanvas.getContext("2d");
    App.tempCtx.fillStyle = App.fillColorString;
    App.tempCtx.strokeStyle = App.colorString;
    App.tempCtx.lineWidth = App.lineWidth;
    App.tempCtx.lineCap = "round";
 
	
    // drawing socket
    App.socket.on('drawPencil', function(data) {
		App.ctx.save();
		App.ctx.strokeStyle = data.color;
		App.ctx.lineWidth = data.lineWidth;
        App.drawPencil(data.x, data.y, data.type);
		App.ctx.restore();
        return;
    });
    App.socket.on('drawRect', function(data){
		App.ctx.save();
		App.ctx.fillStyle = data.fillColor;
		App.ctx.strokeStyle = data.color;
		App.ctx.lineWidth = data.lineWidth;
        App.drawRect(data.xR, data.yR, data.wR, data.hR);
		App.ctx.restore();
        return;
    });
    App.socket.on('drawCircle', function(data){
		App.ctx.save();
		App.ctx.fillStyle = data.fillColor;
		App.ctx.strokeStyle = data.color;
		App.ctx.lineWidth = data.lineWidth;
        App.drawCircle(data.xC,data.yC,data.rC);
		App.ctx.restore();
        return;
    });
    App.socket.on('drawImg', function(data){
        var image = new Image();
        image.src = data.imageSrc;
        image.onload = function(){
            App.drawImg(image, data.x, data.y)
        }
        return;
    });
    App.socket.on('eraseCanvas', function(data){
        App.eraseCanvas(data.x,data.y,data.eraserWidth);
        return;
    });
    
	//clear canvas
	App.clearTemp = function() {
		App.tempCtx.clearRect(0, 0, App.tempCanvas.width, App.tempCanvas.height);
    };
	App.clearCanvas = function() {
		App.ctx.clearRect(0, 0, App.canvas.width, App.canvas.height);
    };
    
    // drawing function
    App.drawPencil = function(x, y, type){
		if(type == "start"){
			App.ctx.beginPath();
			App.ctx.moveTo(x, y);
		}else if (type == "move"){
			App.ctx.lineTo(x, y);
			App.ctx.stroke();
		}else {
			App.ctx.closePath();
		}
    };
    App.drawImg = function(image,x,y) {
        App.ctx.drawImage(image,x,y);
    };
    App.drawRect = function(x, y, w, h) {
		App.clearTemp();
		if(App.ctx.fillStyle.replace(/ /g,'') === 'rgba(0,0,0,0)'){
			App.ctx.strokeRect(x, y, w, h);
		}else{
			App.ctx.save();
			App.ctx.fillStyle = App.ctx.strokeStyle;
			App.ctx.fillRect(x, y, w, h);
			App.ctx.restore();
			App.ctx.fillRect(x+App.ctx.lineWidth, y+App.ctx.lineWidth, w-App.ctx.lineWidth*2, h-App.ctx.lineWidth*2);
		}
    };
    App.drawTempRect = function(x, y, w, h) {
		App.clearTemp();
		if(App.tempCtx.fillStyle.replace(/ /g,'') === 'rgba(0,0,0,0)'){
			App.tempCtx.strokeRect(x, y, w, h);
		}else{
			App.tempCtx.save();
			App.tempCtx.fillStyle = App.ctx.strokeStyle;
			App.tempCtx.fillRect(x, y, w, h);
			App.tempCtx.restore();
			App.tempCtx.fillRect(x+App.tempCtx.lineWidth, y+App.tempCtx.lineWidth, w-App.tempCtx.lineWidth*2, h-App.tempCtx.lineWidth*2);
		}
    };
    App.drawCircle = function(x, y, r) {
		App.clearTemp();
		if(App.ctx.fillStyle.replace(/ /g,'') === 'rgba(0,0,0,0)'){
			App.ctx.beginPath();
			App.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
			App.ctx.stroke();
			App.ctx.closePath();
		}else{
			App.ctx.save();
			App.ctx.fillStyle = App.ctx.strokeStyle;
			App.ctx.beginPath();
			App.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
			App.ctx.fill();
			App.ctx.closePath();
			App.ctx.restore();
			App.ctx.beginPath();
			App.ctx.arc(x, y, r-App.ctx.lineWidth, 0, 2 * Math.PI, false);
			App.ctx.fill();
			App.ctx.closePath();
		}
    };
    App.drawTempCircle = function(x, y, r) {
		App.clearTemp();
		if(App.tempCtx.fillStyle.replace(/ /g,'') === 'rgba(0,0,0,0)'){
			App.tempCtx.beginPath();
			App.tempCtx.arc(x, y, r, 0, 2 * Math.PI, false);
			App.tempCtx.stroke();
			App.tempCtx.closePath();
		}else{
			App.tempCtx.save();
			App.tempCtx.fillStyle = App.ctx.strokeStyle;
			App.tempCtx.beginPath();
			App.tempCtx.arc(x, y, r, 0, 2 * Math.PI, false);
			App.tempCtx.fill();
			App.tempCtx.closePath();
			App.tempCtx.restore();
			App.tempCtx.beginPath();
			App.tempCtx.arc(x, y, r-App.ctx.lineWidth, 0, 2 * Math.PI, false);
			App.tempCtx.fill();
			App.tempCtx.closePath();
		}
    };
    App.eraseCanvas = function(x, y, w) {
		App.ctx.clearRect(x-w/2, y-w/2, w, w);
    };


    // function for calculate distance
    App.lineDistance = function(x1, y1, x2, y2){
        var xs = 0;
        var ys = 0;
        xs = x2 - x1;
        xs = xs * xs;
        ys = y2 - y1;
        ys = ys * ys;

        return Math.sqrt( xs + ys );
    }


    // drawing event binding
	var xR, yR, wR, hR, xC0, yC0, xC, yC, rC;
    $('#container').bind('mousedown mouseup touchstart touchend', function(e){
        
        var posCorection = parseInt($(this).css('border-top-width')) - 1;
        
        var x, y, _x, _y;
        var offset = $(this).offset();
        if(e.type === "mousedown" || e.type === "mouseup"){
            x = (e.pageX - offset.left) - posCorection;
            y = (e.pageY - offset.top) - posCorection;
        }
        else if(e.type === "touchstart"){
            x = e.originalEvent.targetTouches[0].pageX - offset.left;
            y = e.originalEvent.targetTouches[0].pageY - offset.top;
        }else if(e.type === "touchend"){
            x = e.originalEvent.changedTouches[0].pageX - offset.left;
            y = e.originalEvent.changedTouches[0].pageY - offset.top;
        }
        
        
        $('#drawing_tool input, #drawing_tool select').blur();

		if(e.type === "touchstart" || e.type === "mousedown"){
            if(App.tool === "pencil"){
                App.drawPencil(x, y, "start");
                App.socket.emit('drawPencilSocket', {
                    x: x,
                    y: y,
                    color: App.colorString,
                    lineWidth: App.lineWidth,
                    type: "start"
                });
            }
            else if(App.tool === "circle"){
                xC0 = x;
                yC0 = y;   
            }
            else if(App.tool === "eraser"){
                App.eraseCanvas(x,y,App.eraserWidth);
				App.socket.emit('eraseCanvasSocket', {
					x: x,
					y: y,
					eraserWidth: App.eraserWidth
                });
            }
			$(this).bind('mousemove touchmove', function(e){
				if(e.type === "mousemove"){
                    _x = (e.pageX - offset.left) - posCorection;
                    _y = (e.pageY - offset.top) - posCorection;
                }
                else if(e.type === "touchmove"){
                    _x = e.originalEvent.targetTouches[0].pageX - offset.left;
                    _y = e.originalEvent.targetTouches[0].pageY - offset.top;
                }
                
                if(App.tool === "pencil"){
                    App.drawPencil(_x, _y, "move");
                    App.socket.emit('drawPencilSocket', {
                        x: _x,
                        y: _y,
                        color: App.colorString,
                        lineWidth: App.lineWidth,
                        type: "move"
                    });
                }
                else if(App.tool === "rect"){
                    xR = Math.min(_x, x);
                    yR = Math.min(_y, y);
                    wR = Math.abs(_x - x);
                    hR = Math.abs(_y - y);
					App.drawTempRect(xR, yR, wR, hR);
                }
                else if(App.tool === "circle"){
                    xC = (xC0+_x)/2;
                    yC = (yC0+_y)/2;    
                    rC = App.lineDistance(xC, yC, _x, _y); 
					App.drawTempCircle(xC,yC,rC);
                }
				else if(App.tool === "eraser"){
					App.eraseCanvas(_x,_y,App.eraserWidth);
					App.socket.emit('eraseCanvasSocket', {
						x: _x,
						y: _y,
						eraserWidth: App.eraserWidth
					});
				}
                e.preventDefault();
			});
		}
		if(e.type === "touchend" || e.type === "mouseup"){
			$(this).unbind('touchmove');
			$(this).unbind('mousemove');
               
            if(App.tool === "pencil"){ 
                App.drawPencil(_x, _y, "end");
                App.socket.emit('drawPencilSocket', {
                    x: _x,
                    y: _y,
                    color: App.colorString,
                    lineWidth: App.lineWidth,
                    type: "end"
                });
            }
            else if(App.tool === "rect"){
                App.drawRect(xR, yR, wR, hR);
                App.socket.emit('drawRectSocket', {
                    xR: xR,
                    yR: yR,
                    wR: wR,
                    hR: hR,
                    color: App.colorString,
					fillColor: App.fillColorString,
                    lineWidth: App.lineWidth
                });
            }
            else if(App.tool === "circle"){
                App.drawCircle(xC,yC,rC);
                App.socket.emit('drawCircleSocket', {
                    xC: xC,
                    yC: yC,
                    rC: rC,
                    color: App.colorString,
					fillColor: App.fillColorString,
                    lineWidth: App.lineWidth
                });
            }
		}
		
		e.preventDefault();
    });

	//clear canvas button event
	$('#clearcanvas').click(function(){
		if (confirm('Are you sure you want to clear the canvas?')) {
			App.clearCanvas();
		} else {
			// Do nothing!
		}
	});

    // image drop event binding
    App.container.addEventListener('dragover', function (e){
        e.preventDefault();
    }, false);
    App.container.addEventListener('drop', function(e){
        var x,y;
        x = (e.offsetX > -1) ? e.offsetX : e.layerX;
        y = (e.offsetY > -1) ? e.offsetY : e.layerY;
        
        var files = e.dataTransfer.files;
        if (files.length > 0) {

            var file = files[0];
            if (file.type.indexOf('image') != -1){
                
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function (e){
                    var img = new Image();
                    img.src = e.target.result;
                    img.onload = function(){
                        var w = img.width;
                        var h = img.height;
                        var wNew = w;
                        var hNew = h;
						
						if((w > (App.canvas.width/2)) || (h > (App.canvas.height/2))){
							var ratio = Math.min(((App.canvas.width/2)/w), ((App.canvas.height/2)/h));
							wNew = w * ratio;
							hNew = h * ratio;
						}

						// position of the image
                        x = x-(wNew/2);
                        y = y-(hNew/2);

                        var tempImage = document.createElement("canvas");
                        var cc = tempImage.getContext("2d");
                        tempImage.width = wNew;
                        tempImage.height = hNew;
                        cc.drawImage(img, 0, 0, wNew, hNew);
                        var imageSrc = tempImage.toDataURL("image/png").toString();     

                        App.drawImg(tempImage,x,y);
                        App.socket.emit('drawImgSocket', {
                            imageSrc:  imageSrc,
                            x: x,
                            y: y
                        });

                    };
                };
            }
        }
        e.preventDefault();
    }, false);
	
	
	// bind the drawing tool changes
	$('#tool').change(function(){
		App.tool = $(this).val();
		App.resetTools();
	});
	$('#color').change(function(){
		App.colorString = $(this).val();
		$('#linewidth .line div').css('border-top-color',App.colorString);
		App.ctx.save();
		App.tempCtx.save();
		App.ctx.strokeStyle = App.colorString;
		App.tempCtx.strokeStyle = App.colorString;
	});
	$('#fillcolor').change(function(){
		if($(this).val() != ''){
			App.fillColorString = $(this).val();
		}else{
			App.fillColorString = 'rgba(0,0,0,0)';
		}
		App.ctx.save();
		App.tempCtx.save();
		App.ctx.fillStyle = App.fillColorString;
		App.tempCtx.fillStyle = App.fillColorString;
	});
	$('#linewidth').change(function(){
		App.lineWidth = parseInt($(this).val());
		App.ctx.save();
		App.tempCtx.save();
		App.ctx.lineWidth = App.lineWidth;
		App.tempCtx.lineWidth = App.lineWidth;
	});
	$('#eraserwidth').change(function(){
		App.eraserWidth = parseInt($(this).val());
		$('#container').removeClass('eraser3 eraser5 eraser10 eraser25 eraser50');
		$('#container').addClass('eraser'+App.eraserWidth);
	});
    

});