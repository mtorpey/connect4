var express = require('express');
var app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const SERVER_PORT = 3000;

// Serve all pages from "content"
app.use(express.static('content/'));

// Create sockets with new clients
io.on('connection', (socket) => {
    console.log('a user connected');

    // Listen: client sends a move
    socket.on('updated_model', (model) => {
        console.log('updated model from client:');
        console.log(model);
        setTimeout(function() {
            io.emit("updated_model", model);
            //socket.broadcast.emit("server announce", "You are the others");
        }, 0);
    });

    // Client disconnects
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// listen for connections
http.listen(SERVER_PORT, () => {
    console.log(`Listening on localhost:${SERVER_PORT}`)
});
