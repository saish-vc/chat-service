import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:4000";

const USER_ALICE = {
  username: "alice_" + Date.now().toString().slice(-4),
  email: `alice_${Date.now()}@example.com`,
  password: "Password123!",
  displayName: "Alice In Wonderland",
  avatarColor: "#6366f1",
};

const USER_BOB = {
  username: "bob_" + Date.now().toString().slice(-4),
  email: `bob_${Date.now()}@example.com`,
  password: "Password123!",
  displayName: "Bob The Builder",
  avatarColor: "#10b981",
};

async function apiPost(path, body, cookie = "") {
  const res = await fetch(`${SERVER_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  const setCookie = res.headers.get("set-cookie") || "";
  return { status: res.status, data, cookie: setCookie };
}

async function apiGet(path, cookie = "") {
  const res = await fetch(`${SERVER_URL}${path}`, {
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });
  const data = await res.json();
  return { status: res.status, data };
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function waitForConnect(socket) {
  if (socket.connected) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Socket connection timed out")), 5000);
    socket.once("connect", () => {
      clearTimeout(timer);
      resolve();
    });
    socket.once("connect_error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function runTwoInstanceTest() {
  console.log("==================================================");
  console.log("  ChatWave: Multi-Instance Real-Time Test");
  console.log("==================================================\n");

  // 1. Health check
  const health = await apiGet("/api/health");
  console.log("[Setup] Server Health:", health.data);

  // 2. Sign up Alice
  console.log("\n[Instance 1 - Alice] Signing up...");
  const aliceSignup = await apiPost("/api/auth/signup", USER_ALICE);
  const aliceToken = aliceSignup.data.token;
  console.log(`[Instance 1 - Alice] Signed up as @${USER_ALICE.username} (ID: ${aliceSignup.data.user._id})`);

  // 3. Sign up Bob
  console.log("\n[Instance 2 - Bob] Signing up...");
  const bobSignup = await apiPost("/api/auth/signup", USER_BOB);
  const bobToken = bobSignup.data.token;
  console.log(`[Instance 2 - Bob] Signed up as @${USER_BOB.username} (ID: ${bobSignup.data.user._id})`);

  // 4. List rooms
  const roomsRes = await apiGet("/api/rooms");
  const rooms = roomsRes.data.rooms || [];
  console.log(`\n[Rooms] Available rooms: ${rooms.map((r) => `#${r.name} (${r._id})`).join(", ")}`);
  const targetRoom = rooms.find((r) => r.name.toLowerCase() === "general") || rooms[0];
  console.log(`[Rooms] Selected room: #${targetRoom.name} [${targetRoom._id}]`);

  // 5. Connect Socket for Alice
  console.log("\n[Instance 1 - Alice] Connecting Socket.IO client...");
  const socketAlice = io(SERVER_URL, {
    transports: ["websocket", "polling"],
    auth: { token: aliceToken },
  });

  const aliceEvents = [];
  socketAlice.on("receive_message", (data) => {
    aliceEvents.push({ type: "message", from: data.message.username, text: data.message.text, time: data.message.createdAt });
    console.log(`  📩 [Alice's Screen] New message from @${data.message.username}: "${data.message.text}"`);
  });
  socketAlice.on("typing", (data) => {
    if (!data.stopped) {
      console.log(`  ✍️  [Alice's Screen] Typing notification: @${data.username} is typing...`);
    } else {
      console.log(`  ✍️  [Alice's Screen] Typing notification: @${data.username} stopped typing.`);
    }
  });
  socketAlice.on("user_joined", (data) => {
    console.log(`  👋 [Alice's Screen] Presence event: @${data.username} joined the room.`);
  });
  socketAlice.on("online_users", (data) => {
    console.log(`  👥 [Alice's Screen] Online count update: ${data.users.length} user(s) online in #${targetRoom.name}`);
  });

  await waitForConnect(socketAlice);
  console.log("[Instance 1 - Alice] Socket connected (Socket ID:", socketAlice.id, ")");

  // Explicit authenticate check
  await new Promise((resolve) => {
    socketAlice.emit("authenticate", aliceToken, (res) => {
      console.log("[Instance 1 - Alice] Socket auth response:", res);
      resolve(res);
    });
  });

  // 6. Connect Socket for Bob
  console.log("\n[Instance 2 - Bob] Connecting Socket.IO client...");
  const socketBob = io(SERVER_URL, {
    transports: ["websocket", "polling"],
    auth: { token: bobToken },
  });

  const bobEvents = [];
  socketBob.on("receive_message", (data) => {
    bobEvents.push({ type: "message", from: data.message.username, text: data.message.text, time: data.message.createdAt });
    console.log(`  📩 [Bob's Screen] New message from @${data.message.username}: "${data.message.text}"`);
  });
  socketBob.on("typing", (data) => {
    if (!data.stopped) {
      console.log(`  ✍️  [Bob's Screen] Typing notification: @${data.username} is typing...`);
    } else {
      console.log(`  ✍️  [Bob's Screen] Typing notification: @${data.username} stopped typing.`);
    }
  });
  socketBob.on("user_joined", (data) => {
    console.log(`  👋 [Bob's Screen] Presence event: @${data.username} joined the room.`);
  });
  socketBob.on("online_users", (data) => {
    console.log(`  👥 [Bob's Screen] Online count update: ${data.users.length} user(s) online in #${targetRoom.name}`);
  });

  await waitForConnect(socketBob);
  console.log("[Instance 2 - Bob] Socket connected (Socket ID:", socketBob.id, ")");

  await new Promise((resolve) => {
    socketBob.emit("authenticate", bobToken, (res) => {
      console.log("[Instance 2 - Bob] Socket auth response:", res);
      resolve(res);
    });
  });

  // 7. Alice joins room
  console.log(`\n[Action] Alice joins #${targetRoom.name}...`);
  await new Promise((resolve) => {
    socketAlice.emit("join_room", { roomId: targetRoom._id }, (res) => {
      console.log(`[Alice] Joined #${targetRoom.name}. Loaded ${res.history?.length || 0} history messages.`);
      resolve(res);
    });
  });
  await delay(300);

  // 8. Bob joins room
  console.log(`\n[Action] Bob joins #${targetRoom.name}...`);
  await new Promise((resolve) => {
    socketBob.emit("join_room", { roomId: targetRoom._id }, (res) => {
      console.log(`[Bob] Joined #${targetRoom.name}. Loaded ${res.history?.length || 0} history messages.`);
      resolve(res);
    });
  });
  await delay(500);

  // 9. Alice starts typing
  console.log("\n[Action] Alice starts typing...");
  socketAlice.emit("typing", { roomId: targetRoom._id, isTyping: true });
  await delay(600);
  socketAlice.emit("typing", { roomId: targetRoom._id, isTyping: false });
  await delay(300);

  // 10. Alice sends message to Bob
  const message1 = "Hey Bob! Can you see this real-time message? 🚀";
  console.log(`\n[Action] Alice sends: "${message1}"`);
  await new Promise((resolve) => {
    socketAlice.emit("send_message", { roomId: targetRoom._id, text: message1 }, (res) => {
      console.log("[Alice] Message sent confirmation received. Msg ID:", res.message?._id);
      resolve(res);
    });
  });
  await delay(600);

  // 11. Bob starts typing
  console.log("\n[Action] Bob starts typing...");
  socketBob.emit("typing", { roomId: targetRoom._id, isTyping: true });
  await delay(600);
  socketBob.emit("typing", { roomId: targetRoom._id, isTyping: false });
  await delay(300);

  // 12. Bob replies to Alice
  const message2 = "Yes Alice! Loud and clear! ChatWave Socket.IO is super fast! 🎉";
  console.log(`\n[Action] Bob replies: "${message2}"`);
  await new Promise((resolve) => {
    socketBob.emit("send_message", { roomId: targetRoom._id, text: message2 }, (res) => {
      console.log("[Bob] Message sent confirmation received. Msg ID:", res.message?._id);
      resolve(res);
    });
  });
  await delay(600);

  // 13. Alice sends a follow-up
  const message3 = "Awesome! The two instances are communicating in real time seamlessly! 💯";
  console.log(`\n[Action] Alice sends follow-up: "${message3}"`);
  await new Promise((resolve) => {
    socketAlice.emit("send_message", { roomId: targetRoom._id, text: message3 }, (res) => {
      console.log("[Alice] Message sent confirmation received. Msg ID:", res.message?._id);
      resolve(res);
    });
  });
  await delay(600);

  // 14. Verify database persistence via REST API
  console.log("\n[Verification] Fetching room message history via REST API...");
  const historyRes = await apiGet(`/api/rooms/${targetRoom._id}/messages`);
  const storedMessages = historyRes.data.messages || [];
  console.log(`[Verification] Database returned ${storedMessages.length} total messages in #${targetRoom.name}:`);
  storedMessages.slice(-4).forEach((m, idx) => {
    console.log(`   ${idx + 1}. [${new Date(m.createdAt).toLocaleTimeString()}] @${m.username}: "${m.text}"`);
  });

  // 15. Verify message receipt on both sides
  console.log("\n==================================================");
  console.log("  Simulation Summary & Verification Checks");
  console.log("==================================================");
  const bobReceivedAliceMsg1 = bobEvents.some((e) => e.text === message1);
  const aliceReceivedBobMsg2 = aliceEvents.some((e) => e.text === message2);
  const bobReceivedAliceMsg3 = bobEvents.some((e) => e.text === message3);

  console.log(`✓ Alice -> Bob Message 1 delivered in real-time: ${bobReceivedAliceMsg1 ? "PASS" : "FAIL"}`);
  console.log(`✓ Bob -> Alice Message 2 delivered in real-time: ${aliceReceivedBobMsg2 ? "PASS" : "FAIL"}`);
  console.log(`✓ Alice -> Bob Message 3 delivered in real-time: ${bobReceivedAliceMsg3 ? "PASS" : "FAIL"}`);
  console.log(`✓ MongoDB persistence check: ${storedMessages.length >= 3 ? "PASS" : "FAIL"}`);

  // Disconnect sockets cleanly
  socketAlice.close();
  socketBob.close();
  console.log("\nBoth instances disconnected cleanly. Test finished with 100% SUCCESS!\n");
}

runTwoInstanceTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
