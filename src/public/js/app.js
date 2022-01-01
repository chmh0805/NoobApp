const socket = io();

const welcomeDiv = document.getElementById('welcome-div');
const resetNicknameBtn = document.getElementById('resetNicknameBtn');
const enterRoomForm = welcomeDiv.querySelector('form');
const nickNameDiv = document.getElementById('nickname-div');
const nickNameForm = nickNameDiv.querySelector('form');
const room = document.getElementById('room-div');
const exitRoomBtn = document.getElementById('exitRoomBtn');

let roomName;

function addMessage(msg) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = msg;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#msg input');
  const value = input.value;
  socket.emit('new_message', roomName, input.value, () => {
    addMessage(`You: ${value}`);
  });
  input.value = '';
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#name input');
  const value = input.value;
  socket.emit('nickname', value);
  input.value = '';
}

function handleExitRoomSubmit(event) {
  event.preventDefault();
  room.querySelector('ul').innerHTML = '';
  room.hidden = true;
  socket.emit('exitRoom', roomName, showRoomList);
}

function handleResetNicknameSubmit(event) {
  event.preventDefault();
  welcomeDiv.hidden = true;
  nickNameDiv.hidden = false;
  socket.emit('resetNickname', showWelcome);
}

function setNickNameSpan(nickname) {
  const nickname_span = document.querySelector('#nickname-span');
  if (nickname !== undefined) {
    nickname_span.innerText = `Nickname: ${nickname}`;
  } else {
    nickname_span.innerText = '';
  }
}

function showWelcome() {
  setNickNameSpan(undefined);
  resetNicknameBtn.hidden = true;
}

function showRoomList() {
  nickNameDiv.hidden = true;
  exitRoomBtn.hidden = true;
  welcomeDiv.hidden = false;
  resetNicknameBtn.hidden = false;
  resetNicknameBtn.addEventListener('click', handleResetNicknameSubmit);
}

function showRoom(roomCount) {
  resetNicknameBtn.hidden = true;
  welcomeDiv.hidden = true;
  room.hidden = false;
  const roomName_h3 = room.querySelector('h3');
  roomName_h3.innerText = `Room ${roomName} (${roomCount})`;
  const msgForm = room.querySelector('#msg');
  msgForm.addEventListener('submit', handleMessageSubmit);
  exitRoomBtn.hidden = false;
  exitRoomBtn.addEventListener('click', handleExitRoomSubmit);
}

nickNameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = nickNameForm.querySelector('input');
  nickname = input.value;
  socket.emit('nickname', nickname, setNickNameSpan);
  showRoomList();
  input.value = '';
});

enterRoomForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = enterRoomForm.querySelector('input');
  roomName = input.value;
  socket.emit('enter_room', roomName, showRoom);
  input.value = '';
});

socket.on('welcome', (user, newCount) => {
  const roomName_h3 = room.querySelector('h3');
  roomName_h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} Entered!`);
});

socket.on('bye', (user, newCount) => {
  const roomName_h3 = room.querySelector('h3');
  roomName_h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} left ㅠㅠ`);
});

socket.on('new_message', addMessage);

socket.on('room_change', (rooms) => {
  const roomList = welcomeDiv.querySelector('ul');
  roomList.innerHTML = '';
  if (rooms.length === 0) {
    return; // do nothing if rooms not exist.
  }
  rooms.forEach((roomObject) => {
    const li = document.createElement('li');
    li.innerText = `${roomObject.roomName} (${roomObject.roomSize}) `;
    roomList.append(li);
  });
});
