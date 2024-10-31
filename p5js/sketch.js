//Phil Olarte. Interface Net Design. FALL 2024. NYU/

//Thx Scott Fitzgerald for BLE code. https://github.com/IDMNYU/Net-Devices/blob/main/BLE-button-to-p5/p5/sketch.js
// Music. https://youtu.be/Cyq48u25bmk?si=5CFcNLiYBEnMxMMB

const serviceUuid = "dc52d0c5-efb0-4d41-a779-98f0422da984";
let myCharacteristic;
let latestData = "Push the button then pass along.";
let myBLE;
let welcomeScreen = true;
let angle = 0;
let teeterDirection = 1; //add motion
let connectButton; 
let loading = false; //for loading indicator
let previousData = null; //for tracking BLE values
let firstRead = true; //block first read from being a scare

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
  createCanvas(windowWidth, windowHeight);
  // Create a p5ble class
  myBLE = new p5ble();

  textSize(20);
  textAlign(CENTER, CENTER);

  // Create the 'Connect' button, for welcome screen 
  connectButton = createButton('Connect');
  connectButton.position(width / 2 - 50, height / 2 + 50);
  connectButton.mousePressed(startConnection);

  // Start playing the welcome sound on loop
  welcomeSound.loop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  connectButton.position(width / 2 - 50, height / 2 + 50);
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
  
  // Start playing the musicBoxSound immediately after connecting
  if (!musicBoxSound.isPlaying()) {
    musicBoxSound.loop();
  }
  
  // Read the characteristic value continuously
  myBLE.read(myCharacteristic, gotValue);
}

// A function that will be called once got values
function gotValue(error, value) {
  if (error) {
    console.log('error: ', error);
    return;
  }
  
  // Skip the first read to avoid getting a random initial value
  if (firstRead) {
    firstRead = false;
    previousData = value; // Initialize previousData to the first value
    console.log("Initial read skipped, value:", value);
    myBLE.read(myCharacteristic, gotValue); // Start continuous reading
    return;
  }

  // Only update if the new value is different from the previous value - FOR PERFORMANCE
  if (value !== previousData) {
    console.log('value: ', value);
    latestData = value;
    previousData = value; // Update previous data to current

    // MUSIC CONTROLLER - based on var latestData
    if (latestData === 7) {
      if (musicBoxSound.isPlaying()) {
        musicBoxSound.stop(); 
      }
      if (!screamSound.isPlaying()) {
        screamSound.play(); 
      }
    } else {
      if (!musicBoxSound.isPlaying()) {
        musicBoxSound.loop(); 
      }
      screamSound.stop();
    }
  }

  // After getting a value, call p5ble.read() again to get the value again
  myBLE.read(myCharacteristic, gotValue);
}

function draw() {
  background(0);

  if (welcomeScreen) {
    // Display the welcome screen
    fill(255);
    textSize(32);
    text("Welcome. Connect...if you dare.", width / 2, height / 2 - 30);

    if (loading) {
      // Display loading text and pinwheel animation
      textSize(12); 
      fill(255);
      text("Getting BLE connection...", width / 2, height / 2 + 90);

      // Draw pinwheel
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
    
    if (latestData === 7) {
      //the jump scare face
      background(0);
      push();
      fill(255, 0, 0); 
      ellipse(width / 2, height / 2, 150, 150); 
      translate(width / 2, height / 2);
      fill(0);
      triangle(-30, -30, -15, -45, -45, -50); // Left eye
      triangle(30, -30, 15, -45, 45, -50); // Right eye

      triangle(0, -10, -10, -25, 10, -25); // Nose

      // mouth
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
      textSize(26);
      text("BOO! You're out!", width / 2, height / 2+150);
      textSize(16);
      text("Push to play.", width / 2, height / 2+200);
    } else {
      // Default state with teetering jack-o-lantern
      push();
      translate(width / 2, height / 2);
      rotate(radians(angle));
      fill(255, 140, 0);
      ellipse(0, 0, 150, 150);
      fill(140, 140, 100);
      rectMode(CENTER);
      rect(0,-85,20,30,5,5,0,0);
      line(-30,-70,30,-70)

      fill(0);
      triangle(-30, -50, -15, -30, -45, -30); // Left eye
      triangle(30, -50, 15, -30, 45, -30); // Right eye

      triangle(0, -10, -10, -25, 10, -25); // Nose

      //mouth
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
      
      fill(255);
      textAlign(CENTER);
      textSize(16);
    if(latestData==="Push the button then pass along."){text('Ready?', width / 2, height / 2+120);} else{text('Push the Button', width / 2, height / 2+120);}
      textSize(26);
      text(latestData, width / 2, height / 2+150);

      // Teeter back and forth
      angle += teeterDirection * 1;
      if (angle > 30 || angle < -30) {
        teeterDirection *= -1;
      }
    }
  }
}
