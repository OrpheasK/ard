//Project documentation: https://www.notion.so/Midterm-Project-41dad00bbb4643a4a792ac415b368ea7
//Contains various parts of code found in https://github.com/ITPNYU/physcomp/tree/main/Labs
// variable to hold an instance of the p5.webserial library:
const serial = new p5.WebSerial();

// HTML button object:
let portButton;
let inData;                   // for incoming serial data
let outByte = 0;              // for outgoing data
let xPos = 0;  
let loopf = 0;
let timst, clip;
let clips = ['treat', 'scare1'];
let otherPerson = 1;

function setup() {
  createCanvas(400, 300);          // make the canvas
  background(0x08, 0x16, 0x40);
  // check to see if serial is available:
  if (!navigator.serial) {
    alert("WebSerial is not supported in this browser. Try Chrome or MS Edge.");
  }
  // if serial is available, add connect/disconnect listeners:
  navigator.serial.addEventListener("connect", portConnect);
  navigator.serial.addEventListener("disconnect", portDisconnect);
  // check for any ports that are available:
  serial.getPorts();
  // if there's no port chosen, choose one:
  serial.on("noport", makePortButton);
  // open whatever port is available:
  serial.on("portavailable", openPort);
  // handle serial errors:
  serial.on("requesterror", portError);
  // handle any incoming serial data:
  serial.on("data", serialEvent);
  serial.on("close", makePortButton);
  
  vid = createVideo('https://i.imgur.com/6tOVz5E.mp4');
  vid.loop()
  vid.volume(0);
  vid.size(500, 500);
  
  
}
 
function draw() {
  //loop normal part of video
  if ((vid.time()>0.59) && (vid.time()<1.01)) {
    vid.time(0);
  }
  //skip to treat/scare if motion is detected
  if ((inData<50) && loopf==0){
    if (otherPerson){//skip to clip only if first hand leaves, new hand approcahes
      clip = random(clips);
      if (clip=='treat'){
        vid.time(1.5);
        loopf=1;
        timst=millis(); 
      }else if (clip=='scare1'){
        vid.time(5);
        loopf=1;
        timst=millis(); 
      } 
    } 
  }else if (loopf==1){//play only the scare part by skipping to beggining if more time than its duration passes
    if ((clip=='treat') && (millis()-timst>2900)){
      loopf=0;
      vid.time(0);
      otherPerson=0;
    }else if ((clip=='scare1') && (millis()-timst>2000)){
      loopf=0;
      vid.time(0);
      otherPerson=0
    }
  }

  if (inData>150){
    otherPerson=1;
  }
  
  graphData(inData);
}

// if there's no port selected, 
// make a port select button appear:
function makePortButton() {
  // create and position a port chooser button:
  portButton = createButton("choose port");
  portButton.position(10, 10);
  // give the port button a mousepressed handler:
  portButton.mousePressed(choosePort);
}
 
// make the port selector window appear:
function choosePort() {
  if (portButton) portButton.show();
  serial.requestPort();
}
 
// open the selected port, and make the port 
// button invisible:
function openPort() {
  // wait for the serial.open promise to return,
  // then call the initiateSerial function
  serial.open().then(initiateSerial);
 
  // once the port opens, let the user know:
  function initiateSerial() {
    console.log("port open");
  }
  // hide the port button once a port is chosen:
  if (portButton) portButton.hide();
}
 
// pop up an alert if there's a port error:
function portError(err) {
  alert("Serial port error: " + err);
}
// read any incoming data as a string
// (assumes a newline at the end of it):
function serialEvent() {
  // read a string from the serial port:
  var inString = serial.readLine();
  // check to see that there's actually a string there:
  if (inString) {
  // convert it to a number:
  inData = Number(inString);
  }
}
 
// try to connect if a new serial port 
// gets added (i.e. plugged in via USB):
function portConnect() {
  console.log("port connected");
  serial.getPorts();
}
 
// if a port is disconnected:
function portDisconnect() {
  serial.close();
  console.log("port disconnected");
}
 
function closePort() {
  serial.close();
}

function graphData(newData) {
  // map the range of the input to the window height:
  var yPos = map(newData, 0, 255, 0, height);
  // draw the line in a pretty color:
  stroke(0xA8, 0xD9, 0xA7);
  line(xPos, height, xPos, height - yPos);
  // at the edge of the screen, go back to the beginning:
  if (xPos >= width) {
    xPos = 0;
    // clear the screen by resetting the background:
    background(0x08, 0x16, 0x40);
  } else {
    // increment the horizontal position for the next reading:
    xPos++;
  }
}
