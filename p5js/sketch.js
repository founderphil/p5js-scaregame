const serviceUuid = "dc52d0c5-efb0-4d41-a779-98f0422da984";
let myCharacteristic;
let latestData = 'not yet';
let myBLE;
let welcomeScreen = true;
let angle = 0;
let teeterDirection = 1;
let connectButton; // Store the connect button reference
let loading = false; // Track if we are showing the loading indicator
let previousData = null; // Track the previous value

let musicBoxSound, screamSound, welcomeSound;

function preload() {
  // Load sounds
  musicBoxSound = loadSound('musicBoxSound.mp3', 
    () => console.log("musicbox.mp3 loaded successfully"), 
    () => console.error("Failed to load musicbox.mp3")
  );
  screamSound = loadSound('screamSound.mp3');
  welcomeSound = loadSound('welcomeSound.mp3');
}

function setup() {
  createCanvas(800, 400);
  myBLE = new p5ble();

  textSize(20);
  textAlign(CENTER, CENTER);

  // Create the 'Connect' button for the welcome screen
  connectButton = createButton('Connect');
  connectButton.position(width / 2 - 50, height / 2 + 50);
  connectButton.mousePressed(startConnection);

  // Start playing the welcome sound on loop
  welcomeSound.loop();
}

function startConnection() {
  loading = true; // Start showing loading indicator
  connectToBle();
}

function connectToBle() {
  // Connect to a device by passing the service UUID
  myBLE.connect(serviceUuid, gotCharacteristics);
}

// A function that will be called once we have the characteristics
function gotCharacteristics(error, characteristics) {
  if (error) console.log('error: ', error);
  console.log('characteristics: ', characteristics);
  myCharacteristic = characteristics[0];
  
  // Fade out the welcome screen after connecting
  welcomeScreen = false;
  loading = false; // Stop showing loading indicator
  connectButton.hide(); // Hide the Connect button

  // Stop the welcome sound when leaving the welcome screen
  welcomeSound.stop();
  
  // Read the characteristic value continuously
  myBLE.read(myCharacteristic, gotValue);
}

// A function that will be called once we receive values
function gotValue(error, value) {
  if (error) {
    console.log('error: ', error);
    return;
  }

  // Only update if the new value is different from the previous value
  if (value !== previousData) {
    console.log('value: ', value);
    latestData = value;
    previousData = value; // Update previous data to current

    // Control the sounds based on latestData
    if (latestData === 7) {
      if (musicBoxSound.isPlaying()) {
        musicBoxSound.stop(); // Stop the music box sound
      }
      if (!screamSound.isPlaying()) {
        screamSound.play(); // Play the scream sound once
      }
    } else {
      if (!musicBoxSound.isPlaying()) {
        musicBoxSound.loop(); // Loop the music box sound
      }
      screamSound.stop(); // Stop the scream sound if it was playing
    }
  }

  // Continue reading the characteristic value
  myBLE.read(myCharacteristic, gotValue);
}
function draw() {
  background(0); // Set background to black

  if (welcomeScreen) {
    // Display the welcome screen
    fill(255); // Set text to white
    textSize(32);
    text("Welcome. Connect...if you dare.", width / 2, height / 2 - 30);

    if (loading) {
      // Display loading text and pinwheel animation under the "Connect" button
      textSize(12); // Smaller font size for loading message
      fill(255);
      text("Getting BLE connection...", width / 2, height / 2 + 90);

      // Draw a rotating pinwheel
      push();
      translate(width / 2, height / 2 + 130);
      rotate(radians(frameCount * 5)); // Rotate over time for pinwheel effect
      stroke(255);
      strokeWeight(4);
      line(0, -10, 0, -30);
      line(0, 10, 0, 30);
      line(-10, 0, -30, 0);
      line(10, 0, 30, 0);
      pop();
    }
  } else {
    // Main game screen
    fill(255, 140, 0); // Orange for the jack-o-lantern
    textAlign(LEFT);
    
    if (latestData === 7) {
      background(0);
      push();
      fill(255, 0, 0); 
      ellipse(width / 2, height / 2, 150, 150); 
      translate(width / 2, height / 2);
      fill(0);
      triangle(-30, -30, -15, -45, -45, -50); // Left eye
      triangle(30, -30, 15, -45, 45, -50); // Right eye

      triangle(0, -10, -10, -25, 10, -25); // Nose

      // Draw the mouth with jagged edges
      beginShape();
      vertex(-50, 0);
      vertex(-30, 50);
      vertex(-20, 30);
      vertex(-10, 50);
      vertex(0, 30);
      vertex(10, 50);
      vertex(20, 30);
      vertex(30, 50);
      vertex(50, 0);
      vertex(20,20);
      vertex(10,0);
      vertex(0,20);
      vertex(-10,0);
      vertex(-20,20);
      endShape(CLOSE);

      pop();
      
      fill(255);
      textAlign(CENTER);
      text("BOO! You're out!", width / 2, height / 2+150);
    } else {
      // Default state with teetering jack-o-lantern
      push();
      translate(width / 2, height / 2);
      rotate(radians(angle));

      // Draw pumpkin face shape
      fill(255, 140, 0);
      ellipse(0, 0, 150, 150); // Pumpkin face

      fill(0);
      triangle(-30, -50, -15, -30, -45, -30); // Left eye
      triangle(30, -50, 15, -30, 45, -30); // Right eye

      triangle(0, -10, -10, -25, 10, -25); // Nose

      // Draw the mouth with jagged edges
      beginShape();
      vertex(-50, 0);
      vertex(-30, 30);
      vertex(-20, 20);
      vertex(-10, 30);
      vertex(0, 20);
      vertex(10, 30);
      vertex(20, 20);
      vertex(30, 30);
      vertex(50, 0);
      vertex(20,10);
      vertex(10,0);
      vertex(0,10);
      vertex(-10,0);
      vertex(-20,10);
      endShape(CLOSE);

      pop();

      // Teeter back and forth
      angle += teeterDirection * 1;
      if (angle > 30 || angle < -30) {
        teeterDirection *= -1;
      }
    }
  }
}
