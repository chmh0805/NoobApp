import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

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
const wsServer = new Server(httpServer, {
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, k) => {
    if (sids.get(k) === undefined) {
      publicRooms.push({ roomName: k, roomSize: countRoom(k) });
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on('connection', (socket) => {
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
    socket.emit('room_change', publicRooms());
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
    done(countRoom(roomName));
    socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
    wsServer.sockets.emit('room_change', publicRooms());
  });
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1);
    });
  });
  socket.on('disconnect', () => {
    wsServer.sockets.emit('room_change', publicRooms());
  });
  socket.on('exitRoom', (roomName, done) => {
    socket.to(roomName).emit('bye', socket.nickname, countRoom(roomName) - 1);
    socket.leave(roomName);
    done();
    wsServer.sockets.emit('room_change', publicRooms());
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
