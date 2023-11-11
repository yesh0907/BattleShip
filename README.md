# ECS 511U (Fall 2023) Individual Project by Yesh Chandiramani
> Play a version of Battleship that I made using an Arduino as the game controller

## Instructions
#### Before running the game:
1. the correct serial interface for the Arduino is selected by changing the `ARDUINO_PATH` variable on line 7 in `server/src/index.ts` to the Arduino’s USB interface on your computer
2. the Arduino is running the controller program
3. all the dependencies for the webapp and server are installed by running npm install in their respective folders
#### Running the game:
1. connect the Arduino to the computer
2. start the server by using the terminal to navigate to the server’s directory and running the npm start
3. start the webapp using another terminal window, navigate to the webapp directory, and run npm run dev
4. in your browser navigate to http://localhost:5173
#### Playing the game:
Once the game is loaded (step 4 of running the game) and connected to the server and Arduino, the Arduino will play a game starting tone and blink the LED 3 times. After the LED finishes blinking, you may use the joystick on the Arduino board to move the selector on the screen up, down, left, and right and the button on the Arduino board to select the cell you would like to fire upon. If your shot is a hit, the cell will turn green, otherwise, it will turn red. Once you have sunk a ship, the Arduino will play a sound and blink the LED twice indicating you have successfully sunk a ship. There are three ships and once they are all sunk, the Arduino will play a sound indicating that you have won the game! You always have the option to restart the game by using the computer and clicking on the restart game button on the screen.

### Testing Conducted
- tested the webapp’s game using the mouse and keyboard controls
- set up a basic circuit with an LED connected to pin 9 and made it turn on when the serial interface reads a message from the server, the Node.js program
- set up an Arduino program to read the value of the joystick and print it to the serial monitor to identify the appropriate thresholds for the left, right, up, and down movements
- set up the Arduino to send the appropriate actions (left, right, up, down, and fire) to the server through the serial interface and print the received actions out to the server’s console
- only move the selector of the game based on the actions received from the server through the WebSocket server
- played the full game using the Arduino as the game controller 20 times to identify bugs and shortcomings

### Shortcomings
- firing a shot at a cell that has already been fired at and then quickly moving the joystick to another cell will trigger the new cell to be marked
    - this happens because the Arduino controller program processes the button state before joystick movement and emits the first event that it registers
- when the controller is blinking the LED or playing a sound through the piezo speaker, it doesn’t emit actions from the Arduino controller to the server even though the joystick may be moving or the button is being pressed
    - the Arduino must wait for the instruction of blinking the LED or playing sound through the piezo to complete before executing the next instruction
