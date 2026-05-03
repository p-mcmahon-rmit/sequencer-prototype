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
  // open info modal on intro close if it exists
  if(infoModal){
    infoModal.showModal();
  }
  synth.chain(Tone.Destination);
});

// find info modal
const infoModal = document.getElementById("infoDialog");
// because i'm demonstrating adding this to a specific page, i'm encapsulating the logic in an if
if(infoModal){

  document.getElementById("infoDialogOpenButton").addEventListener("click", () => {
    infoModal.showModal();
  });

  document.getElementById("infoDialogCloseButton").addEventListener("click", () => {
    infoModal.close();
  });

}

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
]

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

// create default settings
let initNotes = [
    0,
    null,
    4,
    -7,
    0,
    2,
    null,
    -7
];
let betterNotes = [
    0,
    null,
    4,
    -7,
    null,
    "reset",
    null,
    null
];

stepInputs.forEach((stepInput, index) => {

  let pitchInput = stepInput.nextElementSibling;

  let defaultNote;
  let newValue = pitchInput.value;
  let quotient = Math.floor(newValue/12);
  let remainder = newValue % 12;
  if(remainder >= 0){
    defaultNote = `${noteNames[remainder]}${3 + quotient}`;
  } else {
    defaultNote = `${noteNames[noteNames.length + remainder]}${3 + quotient}`;
  }

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
      stepInput.parentElement.lastElementChild.innerText = "off";
      if (index !== 0) {
        currentSequence[index-1].reset = true;
        // change label
        stepInput.parentElement.lastElementChild.innerText = "reset";
      }
      currentSequence[index].active = false;
    } else {
      currentSequence[index].active = true;
      // change label
      stepInput.parentElement.lastElementChild.innerText = currentSequence[index].note;
    }
  });
  
  pitchInput.addEventListener("change", (e) => {
    let newValue = e.target.value;
    let quotient = Math.floor(newValue/12);
    let remainder = newValue % 12;
    let newNoteValue;
    if(remainder >= 0){
      newNoteValue = `${noteNames[remainder]}${3 + quotient}`;
    } else {
      newNoteValue = `${noteNames[noteNames.length + remainder]}${3 + quotient}`;
    }
    // if active change label
    if(currentSequence[index].active){
      pitchInput.nextElementSibling.textContent = newNoteValue;
    }
    // update actual note value
    currentSequence[index].note = newNoteValue;
  })
});

// this code is a bit of nonesense required because of how these specific demos are structured to reuse code and need to
// be able to determine which html file loaded them

let link = document.querySelector("a");

if(link === null){
  loadSequence(betterNotes);
} else {
  if(link.id === "defaults"){
    loadSequence(initNotes);
  }
}

function loadSequence(sequence) {
  stepInputs.forEach((stepInput, index) => {

    let pitchInput = stepInput.nextElementSibling;

    console.log(index, sequence[index])

    if (typeof sequence[index] === 'number') {
      pitchInput.value = sequence[index];
      pitchInput.dispatchEvent(new Event('change'));
      stepInput.click();
    } else if (sequence[index] === "reset") {
      stepInput.click();
      stepInput.click();
    }
  });
}

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