/**
 * TOUCH - Application Coordinator
 * Connects User Interface, MediaPipe Classifier, Three.js 3D hand,
 * and Web Speech APIs (Speech-to-Text and Text-to-Speech).
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- State Variables ---
  let activeMode = "hand"; // 'hand' or 'voice'
  let isWebcamActive = false;
  let isSpeechRecording = false;
  let speechRecognizer = null;
  let hand3DViewer = null;
  let lastAppendedWord = "";
  let gestureStableCount = 0;
  let stableWordThreshold = 22; // Frames needed to register word output
  let wordQueue = [];
  let isQueuePlaying = false;
  let constructedWord = "";

  // --- Initializations ---
  
  // 1. Initialize 3D Viewer
  try {
    hand3DViewer = new HandViewer3D("canvas-3d-container");
    // Play initial "Hello" sign as a welcome animation
    setTimeout(() => {
      hand3DViewer.showSign("Hello");
    }, 1000);
  } catch (err) {
    console.error("Three.js initialization failed:", err);
  }

  // 2. Initialize MediaPipe Detector
  try {
    initGestureDetector("webcam", "camera-overlay", handleGestureResult);
  } catch (err) {
    console.error("MediaPipe initialization failed:", err);
  }

  // 3. Initialize Web Speech Recognition
  initSpeechRecognition();

  // --- UI Elements Selector ---
  const btnModeHand = document.getElementById("btn-mode-hand");
  const btnModeVoice = document.getElementById("btn-mode-voice");
  const panelHand = document.getElementById("panel-hand");
  const panelVoice = document.getElementById("panel-voice");
  
  const btnStartCamera = document.getElementById("btn-start-camera");
  const btnStopCamera = document.getElementById("btn-stop-camera");
  const btnSpeakGesture = document.getElementById("btn-speak-gesture");
  const btnResetGesture = document.getElementById("btn-reset-gesture");
  
  const btnStartVoice = document.getElementById("btn-start-voice");
  const voiceWaves = document.getElementById("voice-waves");
  const voiceHelpText = document.getElementById("voice-help-text");
  const voiceStatusDot = document.getElementById("voice-status-dot");
  const voiceStatusText = document.getElementById("voice-status-text");
  const spokenTextDisplay = document.getElementById("spoken-text-display");
  
  const valGesture = document.getElementById("val-gesture");
  const valConfidence = document.getElementById("val-confidence");
  const confidenceBar = document.getElementById("confidence-bar");
  const handRecognizedText = document.getElementById("hand-recognized-text");
  
  // New constructed word UI elements
  const valConstructedWord = document.getElementById("val-constructed-word");
  const valWordStatus = document.getElementById("val-word-status");
  
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  
  const dictItems = document.querySelectorAll(".dict-item");
  const errorModal = document.getElementById("error-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");

  // --- Theme Toggle Handler ---
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    if (document.body.classList.contains("light-theme")) {
      themeIcon.innerText = "dark_mode";
      themeToggle.setAttribute("title", "Toggle Dark Theme");
    } else {
      themeIcon.innerText = "light_mode";
      themeToggle.setAttribute("title", "Toggle Light Theme");
    }
  });

  // --- Mode Toggles ---
  btnModeHand.addEventListener("click", () => switchMode("hand"));
  btnModeVoice.addEventListener("click", () => switchMode("voice"));

  function switchMode(mode) {
    if (activeMode === mode) return;
    activeMode = mode;

    if (mode === "hand") {
      btnModeHand.classList.add("active");
      btnModeVoice.classList.remove("active");
      panelHand.classList.add("active");
      panelVoice.classList.remove("active");
      
      // Stop voice recorder
      stopSpeechRecognition();
    } else {
      btnModeVoice.classList.add("active");
      btnModeHand.classList.remove("active");
      panelVoice.classList.add("active");
      panelHand.classList.remove("active");
      
      // Stop webcam stream
      if (isWebcamActive) {
        stopWebcam();
      }
    }
  }

  // --- Mode 1: Hand Gesture Handlers ---
  btnStartCamera.addEventListener("click", startWebcam);
  btnStopCamera.addEventListener("click", stopWebcam);
  
  btnResetGesture.addEventListener("click", () => {
    handRecognizedText.value = "";
    lastAppendedWord = "";
    constructedWord = "";
    if (valConstructedWord) valConstructedWord.innerText = "None";
    if (valWordStatus) valWordStatus.innerText = "Waiting for input...";
    btnSpeakGesture.disabled = true;
    gestureStableCount = 0;
  });

  btnSpeakGesture.addEventListener("click", () => {
    const textToSpeak = handRecognizedText.value;
    if (textToSpeak && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // clear queue
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  });

  function startWebcam() {
    startCameraStream()
      .then(() => {
        isWebcamActive = true;
        btnStartCamera.style.display = "none";
      })
      .catch((err) => {
        console.error("Camera access failed:", err);
        showModal(
          "Camera Access Denied",
          "TOUCH requires camera access to track hand gestures. Please check your system settings, enable permission inside browser URL bar, and retry."
        );
      });
  }

  function stopWebcam() {
    stopCameraStream();
    isWebcamActive = false;
    btnStartCamera.style.display = "inline-flex";
    
    valGesture.innerText = "None";
    valConfidence.innerText = "0%";
    confidenceBar.style.width = "0%";
  }

  // Handle detection updates from MediaPipe loop
  function handleGestureResult(result) {
    if (!isWebcamActive) return;

    const detected = result.gesture;
    const confidence = result.confidence;

    valGesture.innerText = detected;
    valConfidence.innerText = `${confidence}%`;
    confidenceBar.style.width = `${confidence}%`;

    // Stabilizer check (ensure word remains detected for N frames to register)
    if (detected !== "None" && confidence > 70) {
      if (detected === lastAppendedWord) {
        gestureStableCount = 0; // Already added
      } else {
        gestureStableCount++;
        if (gestureStableCount >= stableWordThreshold) {
          processDetectedSign(detected);
          gestureStableCount = 0;
        }
      }
    } else {
      gestureStableCount = 0;
    }
  }

  function processDetectedSign(sign) {
    lastAppendedWord = sign;
    
    if (sign.length === 1) {
      // It is an individual letter, append to constructed word
      constructedWord += sign;
      updateConstructedWordUI();
    } else {
      // It is a full word gesture, append directly to history
      constructedWord = sign.toUpperCase();
      appendWordToHistory(sign);
      
      // Update Word Status
      if (valConstructedWord) valConstructedWord.innerText = constructedWord;
      if (valWordStatus) valWordStatus.innerHTML = `<span style="color: var(--success-color); font-weight: bold;">Recognized Word: ${constructedWord}</span>`;
      
      speakWord(sign);
    }
  }

  function updateConstructedWordUI() {
    if (valConstructedWord) valConstructedWord.innerText = constructedWord;
    
    // Check if the constructed word exists in our database
    const upperWord = constructedWord.toUpperCase();
    if (SIGN_DATABASE[upperWord] && SIGN_DATABASE[upperWord].type === "word") {
      if (valWordStatus) valWordStatus.innerHTML = `<span style="color: var(--success-color); font-weight: bold;">Recognized Word: ${upperWord}</span>`;
      
      // Automatically add the full word to the history textarea
      appendWordToHistory(constructedWord);
      speakWord(constructedWord);
      
      // Reset constructed word for the next sign spelling sequence
      constructedWord = "";
    } else {
      // Not in database, show letter fallback spelling list
      const lettersSpelled = constructedWord.split("").join(" + ");
      if (valWordStatus) valWordStatus.innerHTML = `<span style="color: var(--primary-cyan);">Letters Detected: ${lettersSpelled}</span>`;
    }
  }

  function appendWordToHistory(word) {
    let currentText = handRecognizedText.value.trim();
    if (currentText.length > 0) {
      currentText += " " + word;
    } else {
      currentText = word;
    }
    handRecognizedText.value = currentText;
    btnSpeakGesture.disabled = false;
    
    // Auto-scroll textarea to bottom
    handRecognizedText.scrollTop = handRecognizedText.scrollHeight;
  }

  function speakWord(word) {
    if (word && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }

  // --- Mode 2: Voice Handlers ---
  btnStartVoice.addEventListener("click", () => {
    if (isSpeechRecording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  });

  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      btnStartVoice.disabled = true;
      voiceHelpText.innerText = "Speech Recognition not supported by browser. Try Chrome/Edge.";
      return;
    }

    speechRecognizer = new SpeechRecognition();
    speechRecognizer.continuous = false;
    speechRecognizer.interimResults = false;
    speechRecognizer.lang = "en-US";

    speechRecognizer.onstart = () => {
      isSpeechRecording = true;
      btnStartVoice.classList.add("recording");
      voiceHelpText.innerText = "Listening... Speak now";
      voiceStatusDot.className = "status-dot connected";
      voiceStatusText.innerText = "Mic Status: Recording";
    };

    speechRecognizer.onend = () => {
      isSpeechRecording = false;
      btnStartVoice.classList.remove("recording");
      voiceHelpText.innerText = "Click microphone to speak";
      voiceStatusDot.className = "status-dot disconnected";
      voiceStatusText.innerText = "Mic Status: Idle";
    };

    speechRecognizer.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      isSpeechRecording = false;
      btnStartVoice.classList.remove("recording");
      voiceHelpText.innerText = "Error occurred. Click to retry.";
      voiceStatusDot.className = "status-dot disconnected";
      voiceStatusText.innerText = "Mic Status: Idle";

      if (event.error === 'not-allowed') {
        showModal(
          "Microphone Access Denied",
          "TOUCH requires microphone permissions to capture speech. Please grant microphone access and try again."
        );
      }
    };

    speechRecognizer.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      spokenTextDisplay.innerText = `"${resultText}"`;
      parseSpeechToSign(resultText);
    };
  }

  function startSpeechRecognition() {
    if (speechRecognizer) {
      try {
        speechRecognizer.start();
      } catch (err) {
        console.error("Speech recognition startup error:", err);
      }
    }
  }

  function stopSpeechRecognition() {
    if (speechRecognizer && isSpeechRecording) {
      speechRecognizer.stop();
    }
  }

  // Parse spoken text and map to 3D animations sequence
  function parseSpeechToSign(text) {
    if (!hand3DViewer) return;

    const cleanText = text.toUpperCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
    const words = cleanText.split(/\s+/).filter(Boolean);
    
    const animationSequence = [];
    
    // Scan words/compounds in sequence
    let i = 0;
    while (i < words.length) {
      // Check compound of 3 words (like I LOVE YOU)
      if (i < words.length - 2) {
        const potentialCompound3 = `${words[i]} ${words[i+1]} ${words[i+2]}`;
        if (SIGN_DATABASE[potentialCompound3] && SIGN_DATABASE[potentialCompound3].type === "word") {
          animationSequence.push(potentialCompound3);
          i += 3;
          continue;
        }
      }

      // Check compound of 2 words (like GOOD MORNING, THANK YOU, GOOD NIGHT)
      if (i < words.length - 1) {
        const potentialCompound2 = `${words[i]} ${words[i+1]}`;
        if (SIGN_DATABASE[potentialCompound2] && SIGN_DATABASE[potentialCompound2].type === "word") {
          animationSequence.push(potentialCompound2);
          i += 2;
          continue;
        }
      }
      
      const currentWord = words[i];
      if (SIGN_DATABASE[currentWord] && SIGN_DATABASE[currentWord].type === "word") {
        animationSequence.push(currentWord);
      } else {
        // Fallback: split word into individual letters
        for (let char of currentWord) {
          if (SIGN_DATABASE[char]) {
            animationSequence.push(char);
          }
        }
      }
      i++;
    }

    if (animationSequence.length > 0) {
      playSignSequence(animationSequence);
    } else {
      hand3DViewer.showSign("Neutral");
      document.getElementById("current-sign-badge").innerText = "Sign: No Match";
    }
  }

  // Play a sequence of signs one after another
  function playSignSequence(sequence) {
    if (sequence.length === 0 || !hand3DViewer) return;

    wordQueue = [...sequence];
    if (isQueuePlaying) return;

    isQueuePlaying = true;
    playNextQueuedWord();
  }

  function playNextQueuedWord() {
    if (wordQueue.length === 0) {
      isQueuePlaying = false;
      return;
    }

    const nextWord = wordQueue.shift();
    hand3DViewer.showSign(nextWord);

    // Dynamic duration based on sign type
    let duration = 2200; // ms default for full words
    if (nextWord.length === 1) {
      duration = 1000; // 1 second for letters
    } else if (nextWord === "GOOD MORNING" || nextWord === "GOOD NIGHT") {
      duration = 4200; // longer for complex sequences
    }

    // Scale duration with current animation speed
    const scaledDuration = duration / parseFloat(hand3DViewer.animationSpeed);

    setTimeout(() => {
      playNextQueuedWord();
    }, scaledDuration);
  }

  // --- 3D Viewer Control Events ---
  const btn3DPlay = document.getElementById("btn-3d-play");
  const btn3DPause = document.getElementById("btn-3d-pause");
  const btn3DReplay = document.getElementById("btn-3d-replay");
  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.getElementById("speed-value");

  btn3DPlay.addEventListener("click", () => {
    if (hand3DViewer) {
      hand3DViewer.isPlaying = true;
      btn3DPlay.disabled = true;
      btn3DPause.disabled = false;
    }
  });

  btn3DPause.addEventListener("click", () => {
    if (hand3DViewer) {
      hand3DViewer.isPlaying = false;
      btn3DPlay.disabled = false;
      btn3DPause.disabled = true;
    }
  });

  btn3DReplay.addEventListener("click", () => {
    if (hand3DViewer) {
      hand3DViewer.showSign(hand3DViewer.currentConcept);
      hand3DViewer.isPlaying = true;
      btn3DPlay.disabled = true;
      btn3DPause.disabled = false;
    }
  });

  speedSlider.addEventListener("input", () => {
    const val = parseFloat(speedSlider.value);
    speedValue.innerText = `${val.toFixed(2)}x`;
    if (hand3DViewer) {
      hand3DViewer.animationSpeed = val;
    }
  });

  // Default state bindings
  btn3DPlay.disabled = true;
  btn3DPause.disabled = false;

  // --- Dictionary Sidebar Click Handlers ---
  dictItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const word = btn.getAttribute("data-word");
      if (hand3DViewer) {
        // If voice mode, update description box
        if (activeMode === "voice") {
          spokenTextDisplay.innerText = `Previewing: "${word}"`;
        }
        
        // Show sign on 3D view
        playSignSequence([word]);
        
        // Force play loop
        hand3DViewer.isPlaying = true;
        btn3DPlay.disabled = true;
        btn3DPause.disabled = false;
      }
    });
  });

  // --- Fail-Safe / Demo Simulation Alphabet Buttons ---
  const letterBtns = document.querySelectorAll(".letter-btn");
  letterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const letter = btn.getAttribute("data-letter");
      
      // Update UI metrics to show simulated letter
      valGesture.innerText = letter;
      valConfidence.innerText = "100%";
      confidenceBar.style.width = "100%";
      
      // Process simulated sign
      processDetectedSign(letter);
      
      // Show sign on 3D view
      if (hand3DViewer) {
        hand3DViewer.showSign(letter);
        hand3DViewer.isPlaying = true;
        btn3DPlay.disabled = true;
        btn3DPause.disabled = false;
      }
    });
  });

  // --- Keyboard Overrides (A-Z keys) ---
  document.addEventListener("keydown", (event) => {
    if (isWebcamActive && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const char = event.key.toUpperCase();
      if (char >= 'A' && char <= 'Z') {
        event.preventDefault();
        valGesture.innerText = char;
        valConfidence.innerText = "100%";
        confidenceBar.style.width = "100%";
        processDetectedSign(char);
        
        if (hand3DViewer) {
          hand3DViewer.showSign(char);
          hand3DViewer.isPlaying = true;
          btn3DPlay.disabled = true;
          btn3DPause.disabled = false;
        }
      }
    }
  });

  // --- Modal Helpers ---
  function showModal(title, msg) {
    modalTitle.innerText = title;
    modalMessage.innerText = msg;
    errorModal.style.display = "flex";
  }
});
