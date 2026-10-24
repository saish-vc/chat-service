# ChatWave — Real-Time Chat Application

A modern, real-time chat application where multiple users can join chat rooms and send messages that appear instantly for everyone without refreshing the page.

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Socket.IO
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (HTTP-only cookie by default), bcrypt password hashing
- **Validation:** express-validator on the backend; Zod on the frontend where helpful

## Features

- **Authentication:** Signup and login with email + username. JWT stored in an HTTP-only cookie (with a localStorage fallback for cross-origin deploys). Users can set a display name and avatar color.
- **Chat rooms:** Create and join public rooms. Each room has a name, description, creator, member count, and message history. The room list sidebar shows active rooms and online member counts.
- **Real-time messaging:** Socket.IO powers instant message delivery, a "user is typing…" indicator, join/leave notifications, online users in the current room, message timestamps, and auto-scroll to the newest message.
- **Message history:** Every message is stored in MongoDB. When a user joins a room, the latest 50 messages are loaded. A "Load older messages" button fetches previous messages with pagination. Each message shows the sender's username, avatar color, text, and timestamp.
- **UI/UX:** Discord/Slack-inspired 3-panel layout (rooms sidebar, messages, online members, bottom input). Dark and light mode. Fully responsive mobile. Smooth animations for new messages and typing indicators. Clean typography, rounded components, and a professional color palette.

## Folder structure

```
chatwave/
├── client/                 # React + Vite frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Avatar.jsx
│   │   │   ├── AvatarPicker.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── ChatMessageBubble.jsx
│   │   │   ├── ChatMessageList.jsx
│   │   │   ├── EventMessage.jsx
│   │   │   ├── FormField.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── OnlineMembers.jsx
│   │   │   ├── ProfilePanel.jsx
│   │   │   ├── RoomList.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── ServerSelection.jsx
│   │   │   ├── SignupForm.jsx
│   │   │   ├── SystemMessageBanner.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   └── UserStatus.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── SocketContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   ├── useMessages.js
│   │   │   ├── useOnlineUsers.js
│   │   │   ├── useRooms.js
│   │   │   └── useTyping.js
│   │   ├── pages/
│   │   │   ├── ChatPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RoomPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   └── index.js
│   │   ├── services/
│   │   │   └── socket.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                 # Node + Express + Socket.IO backend
│   ├── config/
│   │   └── index.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Message.js
│   │   ├── Room.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── messages.js
│   │   └── rooms.js
│   ├── sockets/
│   │   ├── handler.js
│   │   └── index.js
│   ├── utils/
│   │   ├── db.js
│   │   ├── error.js
│   │   └── jwt.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+ (20 LTS recommended)
- MongoDB — local instance or a managed service (Atlas, etc.)

## Local setup

### 1. Install dependencies

```bash
cd chatwave

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Environment variables

Copy `server/.env.example` to `server/.env` and fill in the values:

```bash
cp server/.env.example server/.env
```

Then edit `server/.env`:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/chatwave
JWT_SECRET=replace-with-a-strong-random-secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

- `CLIENT_URL` should match your frontend origin. The Vite dev server default is `http://localhost:5173`.
- `JWT_SECRET` should be a long random string in production.

### 3. Start MongoDB

Run a local MongoDB instance, for example:

```bash
mongod
```

Or point `MONGO_URI` at your Atlas cluster.

### 4. Run the app

From separate terminals:

```bash
# Backend (Express + Socket.IO on port 4000)
cd server
npm run dev

# Frontend (Vite dev server on port 5173)
cd client
npm run dev
```

Then open `http://localhost:5173` in your browser.

#### Running both with one command (optional)

If you prefer a single command from the repo root, use a tool like `concurrently`:

```bash
# From the chatwave root:
npm install --save-dev concurrently
npm run dev
```

with a root `package.json` like:

```json
{
  "name": "chatwave",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd server && npm run dev",
    "client": "cd client && npm run dev"
  }
}
```

## Environment reference

| Variable    | Purpose                                  | Example                              |
|-------------|------------------------------------------|--------------------------------------|
| PORT        | Backend server port                      | 4000                                 |
| MONGO_URI   | MongoDB connection string                | mongodb://127.0.0.1:27017/chatwave  |
| JWT_SECRET  | Secret used to sign JWTs                 | (strong random string)               |
| CLIENT_URL  | Frontend origin for CORS / cookie scope | http://localhost:5173               |
| NODE_ENV    | Runtime mode (development/production)   | development                          |

## API overview

### Auth

- `POST /api/auth/signup` — create account (`username`, `email`, `password`, optional `avatarColor`)
- `POST /api/auth/login` — sign in, sets an HTTP-only `token` cookie
- `GET /api/auth/me` — get the current user profile
- `PUT /api/auth/me` — update display name / avatar color / username
- `POST /api/auth/logout` — clear the auth cookie

### Rooms

- `GET /api/rooms` — list public rooms with member counts
- `POST /api/rooms` — create a public room (`name`, optional `description`)
- `GET /api/rooms/:id` — room info
- `POST /api/rooms/:id/join` — join a room
- `POST /api/rooms/:id/leave` — leave a room

### Messages (REST fallback)

- `GET /api/rooms/:id/messages?limit=&before=` — paginated message history
- `POST /api/rooms/:id/messages` — send a message (the primary path is Socket.IO)

All API routes sit under `/api` and are proxied by Vite in development.

## Real-time events

### Client → Server

- `authenticate` — send the JWT after connect
- `join_room` — join a chat room
- `leave_room` — leave a chat room
- `send_message` — send a chat message
- `typing` — typing indicator (start/stop)

### Server → Client

- `receive_message` — a new message in the current room
- `user_joined` — someone joined the room
- `user_left` — someone left the room
- `typing` — someone is typing (or stopped typing)
- `online_users` — current online users in the room

On `join_room`, the server also returns the latest 50 messages as `history` in the callback.

## Pages

- `/` — landing page (public)
- `/login` — sign in
- `/signup` — sign up
- `/home` — app home after sign-in (redirects here from `/` when authenticated)
- `/room/:id` — chat room view

Unauthenticated visitors are redirected to `/login` when trying to access protected routes.

## UI conventions

- The layout uses CSS variables for theming, with Tailwind configured for a `class`-based dark mode.
- The default theme is dark on first visit (based on system preference), with a toggle in the header.
- Avatar circles use the user's chosen color and show initials.
- Messages are grouped by sender so only the first message in a streak shows the avatar.
- The message input supports sending with Enter and new lines with Shift + Enter.

## Development notes

- Tailwind is configured in the client via `tailwind.config.js` with PostCSS and Autoprefixer. The Tailwind directives live in `src/index.css`.
- Socket.IO on the client connects to the backend WebSocket endpoint; the JWT is passed on connect so socket handlers can resolve the current user.
- Message pagination uses `limit` and `before` (`_id`) query params; the backend returns messages sorted newest-first.
- Room membership is denormalized in the `Room.members` array and also reflected in the in-memory Socket.IO presence map for online counts.
- The backend ships with a `/api/health` endpoint for liveness checks.

## Deployment

### Backend (Render / Railway)

1. Push the repo to GitHub.
2. On Render or Railway, create a new Web Service from the repo.
3. Set the start command to run the server. For example: `cd server && npm install && npm start`, or configure your root `package.json` to install and start the server in one step.
4. Add environment variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `NODE_ENV=production`.
5. Use a managed MongoDB (Atlas or the platform's DB add-on) and paste the URI into `MONGO_URI`.
6. Set `CLIENT_URL` to your deployed frontend URL so CORS and cookie settings are correct.
7. Deploy. The backend will be available at the platform URL (for example `https://chatwave-api.onrender.com`).

### Frontend (Vercel)

1. Connect the repo to Vercel, or push the `client/` contents to a separate repo/frontend folder and connect that.
2. Set environment variables if needed. For example, define `VITE_API_URL` pointing at your deployed backend if you want the client to call a remote API directly instead of using the Vite proxy.
3. Deploy. Vercel builds the Vite app and serves it statically.

### CORS / cookies note

If you use HTTP-only cookies for the JWT, the frontend and backend must share an origin or be configured for cross-origin cookies (`sameSite`, `secure`, and CORS credentials). For a decoupled deployment (frontend on Vercel, backend on Render/Railway), storing the JWT in `localStorage` and sending it as a Bearer token in an `Authorization` header is the simplest cross-origin approach. Adjust the auth middleware and client socket/auth helpers accordingly.

If you keep the HTTP-only cookie approach in production, make sure:

- `NODE_ENV=production`
- `CLIENT_URL` is set to the frontend origin
- the backend serves `secure` and `sameSite=none` cookies over HTTPS

## Scripts

### Backend (`server/`)

| Command          | What it does                      |
|------------------|-----------------------------------|
| `npm run dev`    | Start with nodemon (auto-restart) |
| `npm start`      | Start with node                   |

### Frontend (`client/`)

| Command           | What it does                       |
|------------------|------------------------------------|
| `npm run dev`    | Start Vite dev server              |
| `npm run build`  | Build production bundle            |
| `npm run preview`| Preview the production build locally |

## Suggested local verification

1. Start MongoDB and the backend, then the frontend.
2. Sign up two separate accounts in two browser profiles (or incognito windows).
3. Create a room in one session and confirm it appears in the other.
4. Send a message and confirm it appears instantly for every session in the room.
5. Type in one session and confirm the "user is typing…" indicator appears in the others.
6. Join and leave rooms and confirm the online member counts and "user joined/left" notices update.
7. Join a room, scroll up, and use "Load older messages" to confirm pagination works.
8. Toggle dark/light mode and confirm the UI updates across pages.
9. Resize the browser to mobile widths and confirm the responsive layout and toggleable sidebars work.
