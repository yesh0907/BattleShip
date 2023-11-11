import { io } from "socket.io-client";
import { GameStateEvents } from "./actions";

// Socket.io server URL
const URL = 'http://localhost:4000';

// Create socket instance and export it to be used in other files
export const socket = io(URL);

// Helper function to send events to the server
export const sendEventToServer = (name: GameStateEvents) => {
    socket.emit(name.toString());
}