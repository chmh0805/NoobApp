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

// EventListener When WebSocket Connected
wss.on('connection', (socket) => {
  socketList.push(socket);
  console.log(socket);
  console.log('Connected to Client 😜');

  socket.on('close', () => {
    // When Client disconnected
    console.log('Disconnected from Client 😂');
  });
  socket.send('hello !!!'); // Server -> Client send

  socket.on('message', (message) => {
    // When Server get sth from Client
    socketList.forEach((socket) => {
      socket.send(message.toString());
    });
  });
});

server.listen(3000, handleListen);
