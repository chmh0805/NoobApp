import express from 'express';
import http from 'http';
import WebSocket from 'ws';

const app = express();

// View Engine Setting
app.set('view engine', 'pug');

// View, Static route Setting
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));

// Rendering
app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

// Listening
const handleListen = () =>
  console.log('Listening on http[ws]://localhost:3000');
// app.listen(3000, handleListen); // HTTP

const server = http.createServer(app); // Create Http Server With Express.js
const wss = new WebSocket.Server({ server }); // Create WebSocket Server With ws On Http Server

const socketList = [];

const pushToSocketList = (socket) => {
  return socketList.push(socket) - 1;
};

// EventListener When WebSocket Connected
wss.on('connection', (socket) => {
  // socket.send('hello !!!'); // Server -> Client send
  socket['nickname'] = undefined;
  socket['socketIndex'] = pushToSocketList(socket);
  console.log('Connected to Client 😜');

  socket.on('close', () => {
    // When Client disconnected
    console.log('Disconnected from Client 😂');
    socketList.splice(socket['socketIndex'], 1);
  });

  socket.on('message', (msg) => {
    // When Server get sth from Client
    const message = JSON.parse(msg);
    switch (message.type) {
      case 'message':
        socketList.forEach((_socket) => {
          if (_socket.socketIndex !== socket.socketIndex) {
            _socket.send(`${socket.nickname}: ${message.payload}`);
          }
        });
        break;
      case 'nickname':
        socket['nickname'] = message.payload;
        break;
    }
  });
});

server.listen(3000, handleListen);
