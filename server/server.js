import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connect } from 'http2';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';
import groupRouter from './routes/groupRoutes.js';

//Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

//Initialize Socket.IO server
export const io = new Server(server, {
  cors: { origin: "*" }
});

export const userSocketMap = {};// Map to keep track of connected users and their sockets
//Socket.IO connection handling
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId; // Get user ID from the connection query
  console.log("User connected:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id; // Map user ID to socket ID
  }

  //Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {// Handle user disconnection
    console.log("User Disconnected:", userId);
    delete userSocketMap[userId]; // Remove user from the map on disconnect
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit updated online users
  })
});

// Middleware
app.use(express.json({ limit: '4mb' }));
app.use(cors());

// Routes setup
app.use("/api/status", (req, res) => res.send("Server is running"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter); // Import and use message routes
app.use('/api/group', groupRouter);

//connect to the database
await connectDB();

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

//Export server for vercel
export default server;
