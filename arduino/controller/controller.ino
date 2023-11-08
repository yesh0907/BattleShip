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

#define NO_ACTION -1

const int ledPin = 9;
const int speakerPin = 10;
const int joystickXPin = A0;
const int joystickYPin = A1;
const int fireBtnPin = 2;

ArduinoActions prevAction = NO_ACTION;

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
  processGameInput();
  gameControllerLoop();
  // delay for stability of loop actions
  delay(1);
}

void gameControllerLoop() {
  // Sending output
  int joystickX = analogRead(joystickXPin);
  int joystickY = analogRead(joystickYPin);
  int fireBtnState = digitalRead(fireBtnPin);

  ArduinoActions currAction = NO_ACTION;
  if (fireBtnState == LOW) {
    currAction = FIRE;
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

  if (currAction != NO_ACTION) {
    sendToServer(currAction);
  }
  prevAction = currAction;
}

void processGameInput() {
  if (Serial.available()) {
    // Process input
    ServerActions data = Serial.parseInt();
    switch (data) {
      case CONNECTED:
        blink(1);
        break;
      case READY_FOR_GAME:
        readyForGameSound();
        blink(3);
        break;
      case SUNK:
        sunkSound();
        quickBlink(2);
        break;
      case WIN:
        winSound();
        blink(3);
        break;
      default:
        Serial.println(String("#") + data);
        sendToServer(UNKNOWN_ACTION_RECEVIED);
        break;
    }
  }
}

void quickBlink(int nbOfTimes) {
  for (int i = 0; i < nbOfTimes; i++) {
    digitalWrite(ledPin, HIGH);
    delay(50);
    digitalWrite(ledPin, LOW);
  }
}

void blink(int nbOfTimes) {
  for (int i = 0; i < nbOfTimes; i++) {
    digitalWrite(ledPin, HIGH);
    delay(1000);
    digitalWrite(ledPin, LOW);
    delay(1000);
  }
}

void sendToServer(ArduinoActions action) {
  Serial.println(action);
}

void readyForGameSound() {
  char notes[] = "cadefC";
  for (int i = 0; i < 6; i++) {
    playNote(notes[i], 800);
    delay(400);
  }
}

void sunkSound() {
  char notes[] = "CgCgC";
  for (int i = 0; i < 4; i++) {
    playNote(notes[i], 200);
    delay(100);
  }
}

void winSound() {
  char notes[] = "bgffca";
  for (int i = 0; i < 6; i++) {
    playNote(notes[i], 800);
    delay(400);
  }
}

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
