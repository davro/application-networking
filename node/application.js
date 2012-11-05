(function() {
    var io;
    io = require('socket.io').listen(4000);
    io.set('log level', 2);
    io.sockets.on('connection', function(socket) {
        socket.on('drawPencilSocket', function(data) {
            socket.broadcast.emit('drawPencil', {
                x: data.x,
                y: data.y,
                color: data.color,
                lineWidth: data.lineWidth,
                type: data.type
            });
        });
        socket.on('drawRectSocket', function(data) {
            socket.broadcast.emit('drawRect', {
                xR: data.xR,
                yR: data.yR,
                wR: data.wR,
                hR: data.hR,
                color: data.color,
                fillColor: data.fillColor,
                lineWidth: data.lineWidth
            });
        });
        socket.on('drawCircleSocket', function(data) {
            socket.broadcast.emit('drawCircle', {
                xC: data.xC,
                yC: data.yC,
                rC: data.rC,
                color: data.color,
				fillColor: data.fillColor,
                lineWidth: data.lineWidth
            });
        });
        socket.on('drawImgSocket', function(data) {
            socket.broadcast.emit('drawImg', {
                imageSrc: data.imageSrc,
                x: data.x,
                y: data.y
            });
        });
        socket.on('eraseCanvasSocket', function(data) {
            socket.broadcast.emit('eraseCanvas', {
                x: data.x,
                y: data.y,
                eraserWidth: data.eraserWidth
            });
        });
		socket.on('sendChatSocket', function(data) {
            socket.broadcast.emit('sendChat', {
                text: data.text
            });
        });
        socket.on('dropImgSocket', function(data) {
            socket.broadcast.emit('dropImg', {
                src: data.src,
                id: data.id,
				name: data.name,
                x: data.x,
                y: data.y,
                h: data.h,
                w: data.w,
				zindex: data.zindex
            });
        });
        socket.on('moveImgSocket', function(data) {
            socket.broadcast.emit('moveImg', {
                id: data.id,
                x: data.x,
                y: data.y
            });
        });
		socket.on('zindexImgSocket', function(data) {
            socket.broadcast.emit('zindexImg', {
                id: data.id
            });
        });
    });
}).call(this);


