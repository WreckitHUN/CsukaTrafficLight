const buttons = document.querySelector(".buttons");
const lamps = document.querySelector(".lamps");
const times = document.querySelector(".times");

let buttonsArray = [];
let lampsArray = [];

const measureTimeRed = measureTime("Red");
const measureTimeYellow = measureTime("Yellow");
const measureTimeGreen = measureTime("Green");

createONOFF();
buttonControl();
createLamps();
setInterval(readOutputs, 1000);

function createONOFF() {
  //Create the buttons
  const buttonON = document.createElement("button");
  const buttonOFF = document.createElement("button");
  // Button style class
  buttonON.classList.add("btn");
  buttonOFF.classList.add("btn");
  // Button text content
  buttonON.textContent = "ON";
  buttonOFF.textContent = "OFF";
  // Button ID
  buttonON.id = "I0";
  buttonOFF.id = "I1";
  buttons.appendChild(buttonON);
  buttons.appendChild(buttonOFF);
  buttonsArray.push(buttonON);
  buttonsArray.push(buttonOFF);
}

function createLamps() {
  //Create the lamps
  const redLamp = document.createElement("div");
  const yellowLamp = document.createElement("div");
  const greenLamp = document.createElement("div");
  // Lamp style class
  redLamp.classList.add("lamp", "red");
  yellowLamp.classList.add("lamp", "yellow");
  greenLamp.classList.add("lamp", "green");
  // Lamps Array assignment
  lamps.appendChild(redLamp);
  lamps.appendChild(yellowLamp);
  lamps.appendChild(greenLamp);

  lampsArray.push(redLamp);
  lampsArray.push(yellowLamp);
  lampsArray.push(greenLamp);
}

function buttonControl() {
  buttonsArray.forEach((button, i) => {
    button.addEventListener("mousedown", () => {
      sendInput(button, 1);
    });
    button.addEventListener("mouseup", () => {
      sendInput(button, 0);
    });
  });
}

async function sendInput(button, value) {
  try {
    const response = await fetch("http://127.0.0.1:8000/input", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: Number(button.id.match(/\d+/)[0]),
        value,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function readOutputs() {
  try {
    const response = await fetch("http://127.0.0.1:8000/outputs");
    const futureOutputs = await response.json(); // [true, false, false, ...]
    futureOutputs.forEach((output, i) => {
      if (i > 2) return;
      if (i === 0) {
        measureTimeRed.setOutput(output);
        document.querySelector(
          "#redTime"
        ).textContent = `${measureTimeRed.result()} ms`;
      } else if (i === 1) {
        measureTimeYellow.setOutput(output);
        document.querySelector(
          "#yellowTime"
        ).textContent = `${measureTimeYellow.result()} ms`;
      } else if (i === 2) {
        measureTimeGreen.setOutput(output);
        document.querySelector(
          "#greenTime"
        ).textContent = `${measureTimeGreen.result()} ms`;
      }
      if (output) {
        lampsArray[i].classList.add("on");
      } else {
        lampsArray[i].classList.remove("on");
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

function measureTime(color) {
  let resultTime = 0;
  let _startTime = 0;
  let _endTime = 0;
  let _output = false;
  let _prevOutput = false;

  const setOutput = (output) => (_output = output);

  const result = () => {
    if (_output && !_prevOutput) {
      _startTime = performance.now();
      resultTime = 0;
    } else if (!_output && _prevOutput) {
      _endTime = performance.now();
      console.log(`${color} time is ${_endTime - _startTime}`);
      resultTime = _endTime - _startTime;
    }
    _prevOutput = _output;
    return Math.floor(resultTime);
  };

  return {
    setOutput,
    result,
  };
}
