const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const PORT = process.env.PORT || 3001;

const app = express();
app.get('/', (req, res) => res.json({ message: 'ok' }));

const server = http.createServer(app);

const io = socketIO(server);

let playerX = {};
let playerY = {};
let fields = {};

io.on('connection', (socket) => {
    console.log('New client connected: ' + socket.id);

    if(!playerX.id) {
        playerX = {id: socket.id, type: 'x'}
    } else if(!playerY.id) {
        playerY = {id: socket.id, type: 'o'}
    } 
    
    if(playerX.id && playerY.id) {
        io.emit('playerMatched', { playerX, playerY });
    }

    console.log(playerX)
    console.log(playerY)

    socket.on('disconnect', () => {
        console.log("Client disconnected: " + socket.id);

        if(playerX.id === socket.id) {
            playerX = {};
        }

        if(playerY.id === socket.id) {
            playerY = {};
        }

        fields = {};
        socket.broadcast.emit('updateFields', fields);
    })

    socket.on('played', data => {
        console.log(data);

        fields = data;

        socket.broadcast.emit('updateFields', fields);
    });
});



const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", response);
};

server.listen(PORT, () => console.log('Server Running!'));