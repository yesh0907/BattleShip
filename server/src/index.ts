import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { SerialComm } from "./serial";
import { GameStateEvents, ServerActions } from "./actions";

// Port path name for Arduino connected by USB to your computer
const ARDUINO_PORT = "/dev/tty.usbmodem14401";

// Create a new express app instance and socket.io server
const app = express();
const server = createServer(app);
const io = new IOServer(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
});
const port = 4000;

// Initialize the serial communication with the Arduino
const comm = new SerialComm(ARDUINO_PORT);

// Basic route to serve the index HTML file (for health check purposes)
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Socket.io event handlers
io.on('connection', (socket) => {
    console.log('connected');
    // Set the socket for the serial communication
    comm.setSocket(socket);

    // Listen for the SUNK event sent from the webapp and send the SUNK event to the Arduino
    socket.on(GameStateEvents.SUNK.toString(), () => {
        comm.sendToArduino(ServerActions.SUNK);
    });

    // Listen for the WIN event sent from the webapp and send the WIN event to the Arduino
    socket.on(GameStateEvents.WIN.toString(), () => {
      comm.sendToArduino(ServerActions.WIN);
  });
});

// Start the HTTP and WebSocket server on port 4000
server.listen(port, () => {
  console.log(`HTTP Server running on port ${port}`);
});
