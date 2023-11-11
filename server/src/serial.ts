import { SerialPort, ReadlineParser } from "serialport";
import { ArduinoActions, GameActions, ServerActions } from "./actions";
import { Socket } from "socket.io";

// Handles all serial communication with the Arduino
export class SerialComm {
    public port: SerialPort;

    private parser: ReadlineParser;
    private socket: Socket | null = null;
    private sendingToGame: boolean = false;

    constructor(path: string) {
        // Open Serial Port communication with Arduino
        this.port = new SerialPort(
            {
                path,
                baudRate: 9600,
            },
            (err) => {
                if (err) {
                    return console.log("Error: ", err.message);
                }
            }
        );
        // Parse the data from the Arduino based on the newline character
        this.parser = new ReadlineParser();
        // Pipe the serial port data to the parser
        this.port.pipe(this.parser);

        // Execute code once serial communication is opened
        this.port.on("open", () => {
            console.log("Serial Port to Arduino Opened");

            // Execute code when data is received from the Arduino
            this.parser.on("data", (data: string) => {
                // Debug log statement from arduino
                if (data.substring(0, 1) === "#") {
                    console.log("Arduino Debug:", data.substring(1).trim());
                    return;
                }
                // Convert the data sent into a number that corresponds to an action from the arduino
                const action = parseInt(data) as ArduinoActions;
                switch (action as ArduinoActions) {
                    case ArduinoActions.READY:
                        console.log("Arduino is ready");
                        this.sendToArduino(ServerActions.CONNECTED);
                        break;
                    case ArduinoActions.LEFT:
                        this.sendToGame(GameActions.LEFT);
                        break;
                    case ArduinoActions.RIGHT:
                        this.sendToGame(GameActions.RIGHT);
                        break;
                    case ArduinoActions.UP:
                        this.sendToGame(GameActions.UP);
                        break;
                    case ArduinoActions.DOWN:
                        this.sendToGame(GameActions.DOWN);
                        break;
                    case ArduinoActions.FIRE:
                        this.sendToGame(GameActions.FIRE);
                        break;
                    case ArduinoActions.RESET_GAME:
                        this.sendToGame(GameActions.RESET_GAME);
                        break;
                    case ArduinoActions.UNKNOWN_ACTION_RECEVIED:
                        console.log("Arduino received unknown action");
                        break;
                    default:
                        console.log(
                            "Unknown action received from arduino:",
                            action
                        );
                        break;
                }
            });
        });
    }

    // Send data to the Arduino through the serial port
    public sendToArduino(data: ServerActions) {
        this.port.write(data.toString(), (err) => {
            if (err) {
                return console.log("Error on write: ", err.message);
            }
        });
    }

    // Send data to the webapp through socket.io
    public sendToGame(data: GameActions) {
        if (this.socket) {
            if (!this.sendingToGame) {
                this.sendingToGame = true;
                this.socket.emit(data.toString());
                setTimeout(() => {
                    this.sendingToGame = false;
                }, 250);
            }
        } else {
            console.log("ERROR: Socket not set");
        }
    }

    // Set the socket for WebSocket communication with the webapp
    public setSocket(socket: Socket) {
        this.socket = socket;
        // Tell Arduino that server is connected to webapp and is ready for game
        this.sendToArduino(ServerActions.READY_FOR_GAME);
    }
}
