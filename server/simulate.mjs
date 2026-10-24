import { io } from 'socket.io-client';

// Configuration
const SERVER_URL = 'http://localhost:4000';
const USER1 = { username: 'alice', email: 'alice@example.com' };
const USER2 = { username: 'bob', email: 'bob@example.com' };

// Cookie jar for automatic cookie sending
const cookieJar = {};

async function apiGet(path) {
  const url = `${SERVER_URL}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
  });
  return res;
}

async function apiPost(path, body) {
  const url = `${SERVER_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return res;
}

async function signup(user) {
  const res = await apiPost('/api/auth/signup', {
    username: user.username,
    email: user.email,
    password: 'password123',
    avatarColor: user === USER1 ? '#6366f1' : '#f97316',
  });
  const data = await res.json();
  console.log(`${user.username} signup:`, data);
  return data;
}

async function login(user) {
  const res = await apiPost('/api/auth/login', {
    email: user.email,
    password: 'password123',
  });
  const data = await res.json();
  console.log(`${user.username} login:`, data);
  return data;
}

async function main() {
  console.log('=== Multi-user Chat Simulation ===\n');

  // Sign up both users
  await signup(USER1);
  await signup(USER2);
  console.log('');

  // Login both users - this will set the auth cookie
  await login(USER1);
  await login(USER2);
  console.log('');

  // Connect socket.io for user1 - with automatic cookie handling (withCredentials)
  const socket1 = io(SERVER_URL, {
    withCredentials: true,
  });

  const socket2 = io(SERVER_URL, {
    withCredentials: true,
  });

  // Wait for connections
  await new Promise(r => setTimeout(r, 1000));

  console.log('Both users connected via Socket.IO\n');

  // Join the room in both sockets
  socket1.emit('join_room', 'general');
  socket2.emit('join_room', 'general');
  await new Promise(r => setTimeout(r, 500));
  console.log('Both users joined room General\n');

  // User1 sends a message
  console.log('Alice sends: "Hello Bob!"');
  socket1.emit('send_message', { roomId: 'general', text: 'Hello Bob!' });

  await new Promise(r => setTimeout(r, 1000));

  // User2 receives message (we can check by listening but for simulation we just wait)
  console.log('Bob should receive the message...\n');

  // User2 types
  console.log('Bob is typing...');
  socket2.emit('typing', { roomId: 'general', isTyping: true });
  await new Promise(r => setTimeout(r, 500));
  socket2.emit('typing', { roomId: 'general', isTyping: false });

  await new Promise(r => setTimeout(r, 1000));

  // User1 leaves the room
  console.log('Alice leaves the room...');
  socket1.emit('leave_room', 'general');
  await new Promise(r => setTimeout(r, 500));

  // User2 leaves too
  console.log('Bob leaves the room...');
  socket2.emit('leave_room', 'general');
  await new Promise(r => setTimeout(r, 500));

  console.log('\n=== Simulation Complete ===\n');

  // Cleanup
  socket1.close();
  socket2.close();
}

main().catch(err => {
  console.error('Simulation error:', err);
  process.exit(1);
});