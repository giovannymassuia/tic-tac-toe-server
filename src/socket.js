const socketIO = require('socket.io');

let io;

const playersTimeout = [];
const availablePlayers = [];
const playersInGame = [];

exports.initWebSockets = (server) => {

    io = socketIO(server);

    io.on('connection', (socket) => {
        
        const timeout = setTimeout(() => {
            socket.disconnect();
        }, 30000);
        
        playerConnected(socket.id, timeout);

        socket.on('disconnect', () => {
            playerDisconnected(socket.id);
        })
    
        socket.on('move', data => {
            move(socket.id, data);
        });
    });

}

const playerConnected = (id, timeout) => {
    availablePlayers.push(id);

    playersTimeout.push({id, timeout})

    console.log('availablePlayers');
    console.log(availablePlayers);

    checkMatches();
}

const playerDisconnected = id => {

    const gameInProgress = playersInGame.findIndex(item => item[0] === id || item[1] === id);

    if(gameInProgress !== -1) {
        const [ deletedGame ] = playersInGame.splice(gameInProgress, 1);

        const [p1, p2] = deletedGame;
        let playerAvailable;

        if(p1 !== id) playerAvailable = p1;
        if(p2 !== id) playerAvailable = p2;
        
        availablePlayers.push(playerAvailable);
        io.to(playerAvailable).emit('gameReseted', { message: 'The other player left.' });
    }

    console.log('playerDisconnected');
    console.log(availablePlayers);
    console.log(playersInGame);
    console.log('playerDisconnected-----');

    checkMatches();
}

const checkMatches = () => {
    while(availablePlayers.length > 1) {
        const playerX = availablePlayers.shift();
        const playerO = availablePlayers.shift();

        playersInGame.push([playerX, playerO]);

        io.to(playerX).emit('playerMatched', { player: 'x', otherPlayer: 'o'});
        io.to(playerO).emit('playerMatched', { player: 'o', otherPlayer: 'x'});
    }

    console.log('checkMatches');
    console.log(availablePlayers);
    console.log(playersInGame);
    console.log('checkMatches-----');
}

const move = (id, data) => {
    const [p1, p2] = playersInGame.find(item => item[0] === id || item[1] === id);

    let otherPlayer;

    if(p1 !== id) otherPlayer = p1;
    if(p2 !== id) otherPlayer = p2;

    io.to(otherPlayer).emit('updateFields', data);

    const playerTime = playersTimeout.findIndex(item => item.id === id);
    clearTimeout(playersTimeout[playerTime.timeout]);
    playersTimeout.splice(playertime, 1);

    const timeout = setTimeout(() => {
        socket.disconnect();
    }, 30000);
    playersTimeout.push({id, timeout});
}

/*
io.on('connect', function(socket) {
    // irá notificar apenas o usuário
    socket.emit('hello', 'world'); 

    // irá notificar todos, inclusive você
    io.emit('novo usuario', 'NOME_USUARIO entrou na sala!');

    // irá notificar todos, exceto você
    socket.broadcast.emit('hello', 'novo usuário conectado');
});
*/