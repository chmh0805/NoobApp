import { doesNotMatch } from 'assert';
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';

const app = express();

// View Engine Setting
app.set('view engine', 'pug');

// View, Static route Setting
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));

// Rendering
app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const handleListen = () => {
  console.log('Waiting Clients...');
};

const httpServer = http.createServer(app); // Create Http Server With Express.js
const wsServer = SocketIO(httpServer);

wsServer.on('connection', (socket) => {
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on('nickname', (nickname, done) => {
    socket['nickname'] = nickname;
    done(nickname);
  });
  socket.on('resetNickname', (done) => {
    socket['nickname'] = undefined;
    done();
  });
  socket.on('enter_room', (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit('welcome', socket.nickname);
  });
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit('bye', socket.nickname);
    });
  });
  socket.on('exitRoom', (roomName, done) => {
    socket.to(roomName).emit('bye', socket.nickname);
    socket.leave(roomName);
    done();
  });
  socket.on('new_message', (roomName, message, done) => {
    socket.to(roomName).emit('new_message', `${socket.nickname}: ${message}`);
    done();
  });
  socket.on('nickname', (nickname) => {
    socket['nickname'] = nickname;
  });
});

httpServer.listen(3000, handleListen);
