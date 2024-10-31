// include the library
#include <ArduinoBLE.h>

BLEService buttonService("dc52d0c5-efb0-4d41-a779-98f0422da984"); // create service

// create button characteristic and allow remote device to get notifications
BLEByteCharacteristic buttonCharacteristic("eac014e7-91ff-47f1-95d6-966433f5a181", BLERead | BLENotify);

const int buttonPin = 2; // set buttonPin to digital pin 2

int lastButtonState = LOW; // store the last button state
int lastValue = 0; // store the last generated random value
bool isFirstNumber = true; // flag to check if it’s the first generated number

void setup() {
  // use this if you require debugging
  Serial.begin(9600);

  pinMode(buttonPin, INPUT); // use button pin as an input

  // begin initialization
  if (!BLE.begin()) {
    Serial.println("starting BLE failed!");
    while (1);
  }

  // set the local name peripheral advertises
  BLE.setLocalName("Button");
  // set the UUID for the service this peripheral advertises:
  BLE.setAdvertisedService(buttonService);

  // add the characteristic to the service
  buttonService.addCharacteristic(buttonCharacteristic);

  // add the service
  BLE.addService(buttonService);

  // initialize a value to send
  buttonCharacteristic.writeValue(0);

  // start advertising
  BLE.advertise();

  Serial.println("Bluetooth device active, waiting for connections...");
}

void loop() {
  // poll for BLE events
  BLE.poll();

  // read the current button pin state
  int buttonState = digitalRead(buttonPin);

  // check for a button press (LOW to HIGH transition)
  if (buttonState == HIGH && lastButtonState == LOW) {
    // Generate a new random value between 1 and 7
    do {
      lastValue = random(1, 8); // random number from 1 to 7
    } while (isFirstNumber && lastValue == 7); // ensure first number is not 7

    // Update the flag after the first number is set
    isFirstNumber = false;

    // update the characteristic with the new random value
    buttonCharacteristic.writeValue(lastValue);
    Serial.println("New random value: " + String(lastValue));
  }

  // save the current state as the last state for the next iteration
  lastButtonState = buttonState;

  delay(50); // small delay for button debounce
}
