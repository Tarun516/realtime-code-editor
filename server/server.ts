import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';

enum ACTIONS{
    JOIN = "join",
    JOINED = 'joined',
    DISCONNECTED = 'disconnected',
    CODE_CHANGE = 'code-change',
    SYNC_CODE = 'sync-code',
    LEAVE = 'leave'
}


// Define interfaces
interface UserSocketMap {
  [key: string]: string;
}

interface Client {
  socketId: string;
  username: string;
}

// Create Express app
const app = express();

// Enable CORS
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST'],
  },
});

app.use(express.static(path.join(__dirname, '../dist')));

// Serve the frontend for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Map to store username by socket ID
const userSocketMap: UserSocketMap = {};

// Get all connected clients in a room
function getAllConnectedClients(roomId: string): Client[] {
  // Convert Set to Array
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

// Socket connection events
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // JOIN event handler
  socket.on(ACTIONS.JOIN, ({ roomId, username }: { roomId: string, username: string }) => {
    // Map username to socket ID
    userSocketMap[socket.id] = username;
    
    // Join the room
    socket.join(roomId);
    
    // Get all clients in the room
    const clients = getAllConnectedClients(roomId);
    
    // Notify everyone about the new join
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  // CODE_CHANGE event handler
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }: { roomId: string, code: string }) => {
    // Broadcast code changes to everyone in the room except sender
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // SYNC_CODE event handler
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }: { socketId: string, code: string }) => {
    // Send code to specific client (usually a new joiner)
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Handle disconnection
  socket.on('disconnecting', () => {
    // Get all rooms the socket is in
    const rooms = [...socket.rooms];
    
    // For each room, notify members about disconnection
    rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          username: userSocketMap[socket.id],
        });
      }
    });
    
    // Clean up the user map
    delete userSocketMap[socket.id];
    
    // Leave all rooms
    socket.leave('');
  });
});

// Set port and start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));