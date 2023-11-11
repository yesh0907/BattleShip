/***
 * IMPORTANT: THE ENUMS BELOW MUST BE KEPT IN SYNC WITH THE FILE IN THE SERVER
 */
// Actions sent from the ardunio to the server
enum ArduinoActions {
  READY,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  FIRE,
  RESET_GAME,
  UNKNOWN_ACTION_RECEVIED,
};

// Actions sent from the server to the arduino
enum ServerActions {
  CONNECTED,
  READY_FOR_GAME,
  SUNK,
  WIN,
};

// Placeholder value to represent no action
#define NO_ACTION -1

const int ledPin = 9;
const int speakerPin = 10;
const int joystickXPin = A0;
const int joystickYPin = A1;
const int fireBtnPin = 2;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(speakerPin, OUTPUT);
  pinMode(joystickXPin, INPUT);
  pinMode(joystickYPin, INPUT);
  pinMode(fireBtnPin, INPUT);

  // Enable serial communication with server
  Serial.begin(9600);
  // Read serial communication every 10 ms
  Serial.setTimeout(10);
  // Tell server that the arduino is ready to communicate
  sendToServer(READY);
}

void loop() {
  // Receive events from the server and process them accordingly
  processGameInput();
  // Send game controller actions to the server
  gameControllerLoop();
  // delay for stability of loop actions
  delay(1);
}

/**
 * Loop that reads the state of game controller sensors
 * and sends relevant actions to the server
 */
void gameControllerLoop() {
  int joystickX = analogRead(joystickXPin);
  int joystickY = analogRead(joystickYPin);
  int fireBtnState = digitalRead(fireBtnPin);

  // Determine which action to send to the server
  ArduinoActions currAction = NO_ACTION;
  if (fireBtnState == LOW) {
    currAction = FIRE;
    // Blink to indicate that the fire button was pressed
    quickBlink(1);
  } else if (joystickX <= 250) {
    currAction = LEFT;
  } else if (joystickX >= 750) {
    currAction = RIGHT;
  } else if (joystickY <= 250) {
    currAction = UP;
  } else if (joystickY >= 750) {
    currAction = DOWN;
  }

  // Send action to server if it is not NO_ACTION
  if (currAction != NO_ACTION) {
    sendToServer(currAction);
  }
}

/**
 * Loop that reads the state of the serial communication
 * and processes the data accordingly
 */
void processGameInput() {
  // Check if there is data available to read
  if (Serial.available()) {
    // Read the data sent from the server
    ServerActions data = Serial.parseInt();
    // Process the data accordingly
    switch (data) {
      // Blink the LED to indicate that the arduino is connected to the server
      case CONNECTED:
        blink(1);
        break;
      // Play the readyForGame tone on the speaker and blink the LED 3 times to indicate
      // that the arduino controller received the READY_FOR_GAME event from the server
      case READY_FOR_GAME:
        readyForGameSound();
        blink(3);
        break;
      // Play the sunk tone on the speaker and blink the LED 2
      // times to indicate that a boat has been sunk
      case SUNK:
        sunkSound();
        quickBlink(2);
        break;
      // Play the win tone on the speaker and blink the LED 3
      // times to indicate the player has won the game
      case WIN:
        winSound();
        blink(3);
        break;
      default:
        // Tell server that the event recevied was not recognized
        sendToServer(UNKNOWN_ACTION_RECEVIED);
        break;
    }
  }
}

/**
 * Helper function to quickly (50 ms) blink the LED a certain number of times
 * used for fire button press and SUNK event
 */
void quickBlink(int nbOfTimes) {
  for (int i = 0; i < nbOfTimes; i++) {
    digitalWrite(ledPin, HIGH);
    delay(50);
    digitalWrite(ledPin, LOW);
  }
}

/**
 * Helper function to blink (1 sec) the LED a certain number of times
 * used for CONNECTED, READY_FOR_GAME and WIN events
 */
void blink(int nbOfTimes) {
  for (int i = 0; i < nbOfTimes; i++) {
    digitalWrite(ledPin, HIGH);
    delay(1000);
    digitalWrite(ledPin, LOW);
    delay(1000);
  }
}

// Helper function to send an action to the server from the arduino
void sendToServer(ArduinoActions action) {
  Serial.println(action);
}

// Helper function to play the readyForGame tone on the speaker
void readyForGameSound() {
  char notes[] = "cadefC";
  for (int i = 0; i < 6; i++) {
    playNote(notes[i], 800);
    delay(400);
  }
}

// Helper function to play the sunk tone on the speaker
void sunkSound() {
  char notes[] = "CgCgC";
  for (int i = 0; i < 4; i++) {
    playNote(notes[i], 200);
    delay(100);
  }
}

// Helper function to play the win tone on the speaker
void winSound() {
  char notes[] = "bgffca";
  for (int i = 0; i < 6; i++) {
    playNote(notes[i], 800);
    delay(400);
  }
}

// Helper function to play a note on the speaker
void playNote(char note, int duration) {
  char names[] = { 'c', 'd', 'e', 'f', 'g', 'a', 'b', 'C' };
  int tones[] = { 1915, 1700, 1519, 1432, 1275, 1136, 1014, 956 };
  // play the tone corresponding to the note name
  for (int i = 0; i < 8; i++) {
    if (names[i] == note) {
      tone(speakerPin, tones[i], duration);
    }
  }
}
