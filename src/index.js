const express = require('express');
const http = require('http');
const { initWebSockets } = require('./socket')

const PORT = process.env.PORT || 3001;

const app = express();
app.get('/', (req, res) => res.json({ message: 'ok' }));

const server = http.createServer(app);

initWebSockets(server);

server.listen(PORT, () => console.log(`Server Running on port: ${PORT}`));