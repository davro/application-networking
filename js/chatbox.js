$(document).ready(function(){

    var App;
    App = {};
	//App.socket = io.connect('http://nodejs.adhar.net:4000');
//    App.socket = io.connect('http://192.168.0.58:4000');
    App.socket = io.connect('http://localhost:4000');
	
	//localstorage
	App.writeToStorage = function(name, value) {
		if(typeof(Storage) !== "undefined"){
			localStorage[name] = value;
		}
    };
	App.readFromStorage = function(name) {
		if(typeof(Storage) !== "undefined"){
			if(localStorage[name] != undefined){
				return localStorage[name];
			}else{
				return '';
			}
		}
		return '';
    };
	
	//escape
	App.escapeHTML = function(str) {
		 return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

	}

	App.unescapeHTML = function(str) {
		return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, '\'');
	}
	
    // control values
    App.colorString = '#333333';
	if(App.readFromStorage('colorString') !== '') App.colorString = App.readFromStorage('colorString');
    $('#color').val(App.colorString);
    App.fillColorString = 'rgba(0,0,0,0)';
	if(App.readFromStorage('fillColorString') !== '') App.fillColorString = App.readFromStorage('fillColorString');
	if(App.fillColorString === 'rgba(0,0,0,0)'){
		$('#fillcolor').val('');
	}else{
		$('#fillcolor').val(App.fillColorString);
	}
    App.lineWidth = 3;
	if(App.readFromStorage('lineWidth') !== '') App.lineWidth = parseInt(App.readFromStorage('lineWidth'));
    $('#linewidth').val(App.lineWidth);
    App.eraserWidth = 10;
	if(App.readFromStorage('eraserWidth') !== '') App.eraserWidth = parseInt(App.readFromStorage('eraserWidth'));
    $('#eraserwidth').val(App.eraserWidth);
    App.tool = 'pencil';
	if(App.readFromStorage('tool') !== '') App.tool = App.readFromStorage('tool');
    $('#tool').val(App.tool);
    App.chatName = '';
	if(App.readFromStorage('chatName') !== '') App.chatName = App.readFromStorage('chatName');
    $('#chat-name').val(App.chatName);
	if(App.readFromStorage('chatHistory') !== ''){
		$('#chatbox ul').html(App.readFromStorage('chatHistory'));
		$('#chat-inner').scrollTop($('#chat-inner').height());
	}
	
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
    App.socket.on('sendChat', function(data){
        $('#chatbox ul').append(data.text);
		$('#chat-inner').scrollTop($('#chat-inner').height());
		App.writeToStorage('chatHistory',$('#chatbox ul').html());
        return;
    });
	
	$('#chat-name').change(function(){
		App.chatName = $(this).val();
		App.writeToStorage('chatName',App.chatName);
	});	
	
	//chat functions
	$('#chat-button').click(function(){
		
		var name = App.escapeHTML($.trim($('#chat-name').val()));
		if(name == ''){
			alert('Please enter a chat name first!');
		}else{
			if(App.escapeHTML($.trim($('#chat-input').val())) != ''){
				var text = '<li><strong>'+name+': </strong>';
				text += App.escapeHTML($('#chat-input').val());
				text += '</li>';

				$('#chat-input').val('');
				$('#chatbox ul').append(text);
				App.writeToStorage('chatHistory',$('#chatbox ul').html());
				$('#chat-inner').scrollTop($('#chat-inner').height());

				App.socket.emit('sendChatSocket', {
					text: text
				});	
			}
		}
	});
	$('#chat-input').keyup(function(e){
		code = (e.keyCode ? e.keyCode : e.which);
		if (code == 13){
			$('#chat-button').click();
		}
	});
    
	
	//fix ESC keypress issue
	$(document).keypress(function(e){
		code = (e.keyCode ? e.keyCode : e.which);
		if (code == 27){
			e.preventDefault();
		}
	});

});

