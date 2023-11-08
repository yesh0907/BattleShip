import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { SerialComm } from "./serial";
import { GameStateEvents, ServerActions } from "./actions";

const app = express();
const server = createServer(app);
const io = new IOServer(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
});
const port = 4000;

const comm = new SerialComm();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

io.on('connection', (socket) => {
    console.log('connected');
    comm.setSocket(socket);

    socket.on(GameStateEvents.SUNK.toString(), () => {
        comm.sendToArduino(ServerActions.SUNK);
    });

    socket.on(GameStateEvents.WIN.toString(), () => {
      comm.sendToArduino(ServerActions.WIN);
  });
});

server.listen(port, () => {
  console.log(`HTTP Server running on port ${port}`);
});
