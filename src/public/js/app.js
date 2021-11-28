const messageList = document.querySelector('ul');
const nickForm = document.querySelector('#nickname');
const messageForm = document.querySelector('#message');
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

socket.addEventListener('open', () => {
  console.log('Connected to Server 😜');
});

socket.addEventListener('message', (message) => {
  const li = document.createElement('li');
  li.innerText = message.data;
  messageList.append(li);
});

socket.addEventListener('close', () => {
  console.log('Disconnected from Server 😂');
});

// setTimeout(() => {
//   socket.send('Hello from the Client!');
// }, 1000);

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector('input');
  socket.send(makeMessage('message', input.value));
  const li = document.createElement('li');
  li.innerText = `You: ${input.value}`;
  messageList.append(li);
  input.value = '';
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector('input');
  socket.send(makeMessage('nickname', input.value));
  if (window.cookieStore) {
    window.cookieStore.set('nickname', input.value);
  } else {
    window.noomNickName = input.value;
  }
  this.style.display = 'none';
}

messageForm.addEventListener('submit', handleSubmit);
nickForm.addEventListener('submit', handleNickSubmit);
