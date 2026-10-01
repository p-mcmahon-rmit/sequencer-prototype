/* find intro modal */
const introModal = document.getElementById("introDialog");
/* to get the backdrop working we need to open the modal with js */
introModal.showModal();
/* find modal close button and add an eventlistener */
document.getElementById("introDialogCloseButton").addEventListener("click", () => {
  introModal.close();
});
/* finally we want to initialize the synthesizer when the modal is closed */
/* because this can be through the above button, or by pressing esc, we tie it to the actual close event */
/* the referenced toneInit function is defined in toneSetup.js */
introModal.addEventListener("close", () => {
  synth.chain(Tone.Destination);
});

/* basic synth for note input */

const synth = new Tone.Synth();

/* set up list of notes */
const noteNames = [
  "c",
  "c#",
  "d",
  "d#",
  "e",
  "f",
  "f#",
  "g",
  "g#",
  "a",
  "a#",
  "b",
];

/* transport set up : will add bpm later */

let transportToggle = document.getElementById("transport-toggle");

let isPlaying = false;

transportToggle.addEventListener("click", () => {
  if(isPlaying){
    transportToggle.innerHTML = "⏵";
    Tone.Transport.pause();
  } else {
    transportToggle.innerHTML = "⏸";
    Tone.Transport.start();
  }
  isPlaying = !isPlaying;
});

/* callback loop */

const loop = new Tone.Loop((time) => {
  // triggered every eighth note.
  nextStep(time);
}, "8n").start(0);

/* array with current active steps */

let currentSequence = [];

let currentStep = 0;

/* find inputs and add eventlistener and map to sequence array */

let stepBoxes = Array.from(document.getElementsByClassName("seqStepBox"));

let stepInputs = Array.from(document.getElementsByClassName("seqStep"));

let pitchInputs = Array.from(document.getElementsByClassName("pitchInput"));

stepInputs.forEach((stepInput, index) => {

  let pitchInput = pitchInputs[index];

  let defaultNote = pitchInput.querySelector(".pitchValue").innerHTML;

  currentSequence.push({
    stepIndex : index,
    note: defaultNote,
    active: stepInput.checked,
    inputElement: stepInput,
    boxElement: stepBoxes[index],
    reset: index === stepInputs.length-1 ? true : stepInputs[index+1].indeterminate
  });

  stepInput.addEventListener("click", () => {
    if(stepInput.readOnly) {
      stepInput.checked = stepInput.readOnly = false;
      currentSequence[index].active = false;
      if (index !== 0) {
        currentSequence[index-1].reset = false;
      }
    } else if(!stepInput.checked) {
      stepInput.readOnly = stepInput.indeterminate = true;
      currentSequence[index].active = false;
      // change label
      //stepInput.parentElement.lastElementChild.innerText = "off";
      if (index !== 0) {
        currentSequence[index-1].reset = true;
        // change label
        //stepInput.parentElement.lastElementChild.innerText = "reset";
      }
      currentSequence[index].active = false;
    } else {
      currentSequence[index].active = true;
      // change label
      //stepInput.parentElement.lastElementChild.innerText = currentSequence[index].note;
    }
  });

  pitchInput.querySelector(".pitchUpButton").dataset.seqNumber = index;
  pitchInput.querySelector(".pitchDownButton").dataset.seqNumber = index;
  pitchInput.querySelector(".pitchUpButton").addEventListener("click", pitchStepUp);
  pitchInput.querySelector(".pitchDownButton").addEventListener("click", pitchStepDown);

});

function nextStep(time){
  /* play note */
  if(currentSequence[currentStep].active){
    synth.triggerAttackRelease(currentSequence[currentStep].note, "8n", time);
  }

  /* style */
  if (currentStep === 0){
    /* store this as a precomputed var */
    currentSequence.forEach((box) => {
      box.boxElement.classList.remove("activeStep");
    });
    currentSequence[0].boxElement.classList.add("activeStep");
  } else {
    currentSequence[currentStep].boxElement.classList.add("activeStep");
    currentSequence[currentStep-1].boxElement.classList.remove("activeStep");
  } 
  if (currentSequence[currentStep].reset) {
    currentStep = 0;
  } else {
    currentStep ++;
  }
}

function pitchStepUp(e){
  // finds string which may be 2 or 3 characters
  let valueElement = e.target.parentElement.parentElement.querySelector(".pitchValue");
  let oldValue = valueElement.innerHTML;
  let oldNote = oldValue.substring(0, oldValue.length - 1);
  let newNote;
  let octave = oldValue.substring(oldValue.length - 1, oldValue.length);
  // need to handle if we're going up to the next octave
  if(oldNote === "b") {
    octave = parseInt(octave) + 1;
    newNote = noteNames[0];
  } else {
    let oldNoteIndex = noteNames.indexOf(oldNote);
    newNote = noteNames[oldNoteIndex + 1];
  }
  valueElement.innerHTML = newNote + octave;
  currentSequence[e.target.dataset.seqNumber].note = newNote + octave;
}
function pitchStepDown(e){
  // finds string which may be 2 or 3 characters
  let valueElement = e.target.parentElement.parentElement.querySelector(".pitchValue");
  let oldValue = valueElement.innerHTML;
  let oldNote = oldValue.substring(0, oldValue.length - 1);
  let newNote;
  let octave = oldValue.substring(oldValue.length - 1, oldValue.length);
  // need to handle if we're going up to the next octave
  if(oldNote === "c") {
    octave = parseInt(octave) - 1;
    newNote = noteNames[noteNames.length - 1];
  } else {
    let oldNoteIndex = noteNames.indexOf(oldNote);
    newNote = noteNames[oldNoteIndex - 1];
  }
  valueElement.innerHTML = newNote + octave;
  console.log(e.target.dataset.seqNumber);
  currentSequence[e.target.dataset.seqNumber].note = newNote + octave;
}