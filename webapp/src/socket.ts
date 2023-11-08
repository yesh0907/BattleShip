import { io } from "socket.io-client";
import { GameStateEvents } from "./actions";

const URL = 'http://localhost:4000';

export const socket = io(URL);

export const sendEventToServer = (name: GameStateEvents) => {
    socket.emit(name.toString());
}