const recordBtn = document.querySelector(".record"),
  result = document.querySelector(".result"),
  downloadBtn = document.querySelector(".download"),
  inputLanguage = document.querySelector("#input-language"),
  outputLanguage = document.querySelector("#output-language"),
  clearBtn = document.querySelector(".clear"),
  voiceSelect = document.querySelector("#voice-select");

let SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition,
  recognition,
  recording = false;

function populateLanguages() {
  languages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.code;
    option.innerHTML = lang.name;
    inputLanguage.appendChild(option);

    const outputOption = option.cloneNode(true);
    outputLanguage.appendChild(outputOption);
  });
}

function populateVoices() {
  const voices = window.speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";
  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.innerHTML = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
}

function updateVoice() {
  const selectedLangCode = outputLanguage.value;
  const voices = window.speechSynthesis.getVoices();
  const filteredVoices = voices.filter((voice) =>
    voice.lang.startsWith(selectedLangCode)
  );
  voiceSelect.innerHTML = "";
  filteredVoices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.innerHTML = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
  if (filteredVoices.length > 0) {
    speech.voice = filteredVoices[0];
  }
}

populateLanguages();

function speechToText() {
  try {
    recognition = new SpeechRecognition();
    recognition.lang = inputLanguage.value;
    recognition.interimResults = true;
    recordBtn.classList.add("recording");
    recordBtn.querySelector("p").innerHTML = "Listening...";
    recognition.start();
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      if (event.results[0].isFinal) {
        result.innerHTML += " " + speechResult;
        result.querySelector("p").remove();
      } else {
        if (!document.querySelector(".interim")) {
          const interim = document.createElement("p");
          interim.classList.add("interim");
          result.appendChild(interim);
        }
        document.querySelector(".interim").innerHTML = " " + speechResult;
      }
      downloadBtn.disabled = false;
    };
    recognition.onspeechend = () => {
      speechToText();
    };
    recognition.onerror = (event) => {
      stopRecording();
      if (event.error === "no-speech") {
        alert("No speech was detected. Stopping...");
      } else if (event.error === "audio-capture") {
        alert(
          "No microphone was found. Ensure that a microphone is installed."
        );
      } else if (event.error === "not-allowed") {
        alert("Permission to use microphone is blocked.");
      } else if (event.error === "aborted") {
        alert("Listening stopped.");
      } else {
        alert("Error occurred in recognition: " + event.error);
      }
    };
  } catch (error) {
    recording = false;
    console.log(error);
  }
}

recordBtn.addEventListener("click", () => {
  if (!recording) {
    speechToText();
    recording = true;
  } else {
    stopRecording();
  }
});

function stopRecording() {
  recognition.stop();
  recordBtn.querySelector("p").innerHTML = "Start Listening";
  recordBtn.classList.remove("recording");
  recording = false;
}

function download() {
  const text = result.innerText;
  const filename = "speech.txt";

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

downloadBtn.addEventListener("click", download);

clearBtn.addEventListener("click", () => {
  result.innerHTML = "";
  downloadBtn.disabled = true;
});

/* --Text To Speech Converter-- */

let speech = new SpeechSynthesisUtterance();

document.querySelector("#speakButton").addEventListener("click", () => {
  const text = document.querySelector("#textToSpeak").value;
  speech.text = text;

  const selectedVoiceName = voiceSelect.value;
  const voices = window.speechSynthesis.getVoices();
  speech.voice = voices.find((voice) => voice.name === selectedVoiceName);

  window.speechSynthesis.speak(speech);
});

// Ensure voices are loaded and populate the dropdowns
function loadVoices() {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      });
    }
  });
}

loadVoices().then(() => {
  populateVoices();
  updateVoice(); // Update voice options based on the initial language
});

outputLanguage.addEventListener("change", updateVoice);

document.addEventListener("DOMContentLoaded", () => {
  const switchButton = document.querySelector(".switchbetween");
  const speechToTextSection = document.querySelector(".speech-to-text");
  const textToSpeechSection = document.querySelector(".text-to-speech");

  // Initially show the Speech to Text section
  speechToTextSection.classList.add("active");

  switchButton.addEventListener("click", () => {
    if (speechToTextSection.classList.contains("active")) {
      // Switch to Text to Speech
      speechToTextSection.classList.remove("active");
      textToSpeechSection.classList.add("active");
      switchButton.textContent = "Speech to Text";
    } else {
      // Switch to Speech to Text
      textToSpeechSection.classList.remove("active");
      speechToTextSection.classList.add("active");
      switchButton.textContent = "Text to Speech";
    }
  });

  // Ensure languages are populated
  populateLanguages();
  loadVoices().then(() => {
    populateVoices();
    updateVoice(); // Update voice options based on the initial language
  });
});
