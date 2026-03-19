# PulseChat Backend

## Setup

1. Install dependencies:
   npm install

2. Make sure MongoDB is running on your machine.
   Download from: https://www.mongodb.com/try/download/community

3. Open the .env file and update if needed:
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/pulsechat
   JWT_SECRET=your_super_secret_key_change_this_in_production
   CLIENT_URL=http://localhost:5173

4. Start the backend:
   npm run dev

Server runs on http://localhost:5000

## API Endpoints

POST   /api/auth/register        Register new user
POST   /api/auth/login           Login
GET    /api/auth/me              Get current user (requires token)

GET    /api/users                Get all users (requires token)

GET    /api/messages/:userId     Get conversation (requires token)
PATCH  /api/messages/read/:id    Mark messages as read (requires token)

## Socket Events

Client → Server:
  message:send     { receiverId, text }
  typing:start     { receiverId }
  typing:stop      { receiverId }
  message:read     { messageId, senderId }

Server → Client:
  message:sent     confirmed message with _id
  message:receive  incoming message
  typing:start     { senderId }
  typing:stop      { senderId }
  users:online     [userId, userId, ...]
  message:read     { messageId }
