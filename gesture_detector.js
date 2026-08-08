/**
 * TOUCH - Hand Gesture Detection Engine
 * Integrates MediaPipe Hands and runs a rule-based classifier
 * to recognize 13 ASL signs.
 */

class GestureRecognizer {
  constructor() {
    this.historyLimit = 30; // 30 frames history (approx 1 sec)
    this.handHistory = [];
    this.gestureHistory = [];
    this.currentGesture = "None";
    this.confidence = 0;
    this.sequenceTimer = null;
    this.lastStaticGesture = "None";
    this.lastStaticGestureTime = 0;
  }

  // Clear tracking queues
  reset() {
    this.handHistory = [];
    this.gestureHistory = [];
    this.currentGesture = "None";
    this.confidence = 0;
    this.lastStaticGesture = "None";
    this.lastStaticGestureTime = 0;
  }

  // Update history with new hand landmarks
  update(landmarks) {
    if (!landmarks || landmarks.length === 0) {
      this.handHistory.push(null);
      if (this.handHistory.length > this.historyLimit) this.handHistory.shift();
      return { gesture: "None", confidence: 0 };
    }

    // Add to history
    this.handHistory.push(landmarks);
    if (this.handHistory.length > this.historyLimit) this.handHistory.shift();

    // Recognize static posture
    const staticResult = this.classifyStaticPosture(landmarks);
    
    // Smooth static gesture to prevent flickering
    this.gestureHistory.push(staticResult.gesture);
    if (this.gestureHistory.length > 15) this.gestureHistory.shift();

    const smoothedStaticGesture = this.getMostFrequent(this.gestureHistory);
    let finalGesture = smoothedStaticGesture;
    let finalConfidence = staticResult.confidence;

    // Detect sequences and dynamic movement
    const dynamicResult = this.detectDynamicGestures(landmarks, smoothedStaticGesture);
    if (dynamicResult) {
      finalGesture = dynamicResult.gesture;
      finalConfidence = dynamicResult.confidence;
    }

    // Track state sequences for compound phrases (Good Morning, Good Night)
    const compoundResult = this.checkCompoundPhrases(finalGesture);
    if (compoundResult) {
      finalGesture = compoundResult.gesture;
      finalConfidence = compoundResult.confidence;
    }

    this.currentGesture = finalGesture;
    this.confidence = finalConfidence;

    return { gesture: finalGesture, confidence: finalConfidence };
  }

  // Find most common element in array
  getMostFrequent(arr) {
    if (arr.length === 0) return "None";
    const counts = {};
    let maxEl = arr[0], maxCount = 1;
    for (let i = 0; i < arr.length; i++) {
      const el = arr[i];
      if (counts[el] == null) counts[el] = 1;
      else counts[el]++;
      if (counts[el] > maxCount) {
        maxEl = el;
        maxCount = counts[el];
      }
    }
    return maxEl;
  }

  // Core static posture classification using structural geometric relationships
  classifyStaticPosture(lm) {
    // lm is array of 21 landmarks: {x, y, z}
    
    // 1. Calculate finger extensions
    // A finger is extended if its tip is further from the wrist than its base MCP joints and PIP joints.
    // To handle vertical offsets, we check relative y-distances and euclidean distances.
    const wrist = lm[0];
    
    const getDist = (pt1, pt2) => {
      return Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2) + Math.pow(pt1.z - pt2.z, 2));
    };

    // Calculate distances from wrist
    const distThumb = getDist(lm[4], wrist);
    const distIndex = getDist(lm[8], wrist);
    const distMiddle = getDist(lm[12], wrist);
    const distRing = getDist(lm[16], wrist);
    const distPinky = getDist(lm[20], wrist);

    const baseIndex = getDist(lm[5], wrist);
    const baseMiddle = getDist(lm[9], wrist);
    const baseRing = getDist(lm[13], wrist);
    const basePinky = getDist(lm[17], wrist);

    // Finger extended status checks
    const indexExtended = lm[8].y < lm[6].y && distIndex > baseIndex * 1.15;
    const middleExtended = lm[12].y < lm[10].y && distMiddle > baseMiddle * 1.15;
    const ringExtended = lm[16].y < lm[14].y && distRing > baseRing * 1.15;
    const pinkyExtended = lm[20].y < lm[18].y && distPinky > basePinky * 1.15;

    // Thumb extended checks (usually horizontal expansion relative to Index MCP)
    const thumbExtended = getDist(lm[4], lm[5]) > getDist(lm[2], lm[5]) * 1.2 && lm[4].y < lm[2].y;

    // Helper counts
    const extendedCount = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

    // --- 1. FULL WORD GESTURES (Checked first for specificity) ---

    // A. Stop (Open Hand, flat facing screen)
    if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
      const indexPinkySpread = getDist(lm[8], lm[20]);
      const confidence = Math.min(98, Math.round(75 + indexPinkySpread * 50));
      return { gesture: "Stop", confidence: confidence };
    }

    // B. Hello (open hand)
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
      // Check if fingers are together (B) or spread (Hello/Stop)
      const spread = getDist(lm[8], lm[20]);
      if (spread > basePinky * 0.9) {
        return { gesture: "Hello", confidence: 90 };
      } else {
        return { gesture: "B", confidence: 92 }; // Letter B (fingers closed flat)
      }
    }

    // C. I Love You (Thumb, Index, Pinky extended; Middle and Ring curled)
    if (indexExtended && pinkyExtended && thumbExtended && !middleExtended && !ringExtended) {
      const middleCurled = lm[12].y > lm[9].y || getDist(lm[12], wrist) < baseMiddle * 0.95;
      const ringCurled = lm[16].y > lm[13].y || getDist(lm[16], wrist) < baseRing * 0.95;
      if (middleCurled && ringCurled) {
        return { gesture: "I Love You", confidence: 95 };
      }
    }

    // D. Good (Thumbs up - Thumb extended upward, other fingers completely curled)
    if (thumbExtended && extendedCount === 0) {
      const allCurled = lm[8].y > lm[5].y && lm[12].y > lm[9].y && lm[16].y > lm[13].y && lm[20].y > lm[17].y;
      if (allCurled && lm[4].y < lm[3].y) {
        return { gesture: "Good", confidence: 94 };
      }
    }

    // E. Yes / Fist Shape (Base fist shape used for Yes, Sorry, S, A, T)
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
      const allTucked = lm[8].y > lm[6].y && lm[12].y > lm[10].y && lm[16].y > lm[14].y && lm[20].y > lm[18].y;
      if (allTucked) {
        // Distinguish S, T, A, Yes
        // A: Thumb is extended outward to the side
        if (lm[4].x < lm[2].x - 0.05 || lm[4].x > lm[2].x + 0.05) {
          return { gesture: "A", confidence: 90 };
        }
        // T: Thumb tucked in front of Index PIP
        if (getDist(lm[4], lm[6]) < 0.06) {
          return { gesture: "T", confidence: 85 };
        }
        // Default fist matches Yes or S
        return { gesture: "Yes", confidence: 88 };
      }
    }

    // F. No (Index and Middle fingers pointing down/outwards together)
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      const indexMiddleDist = getDist(lm[8], lm[12]);
      const spacingThreshold = getDist(lm[5], lm[9]) * 1.2;
      if (indexMiddleDist < spacingThreshold) {
        return { gesture: "No", confidence: 92 };
      }
    }

    // G. Please (Flat hand close together, thumb tucked)
    if (indexExtended && middleExtended && ringExtended && pinkyExtended && !thumbExtended) {
      const spread = getDist(lm[8], lm[20]);
      if (spread < basePinky * 0.7) {
        return { gesture: "Please", confidence: 88 };
      }
    }

    // --- 2. INDIVIDUAL LETTER GESTURES ---

    // Y: Thumb and Pinky extended, others curled
    if (thumbExtended && pinkyExtended && !indexExtended && !middleExtended && !ringExtended) {
      return { gesture: "Y", confidence: 94 };
    }

    // W: Index, Middle, Ring extended, Pinky curled
    if (indexExtended && middleExtended && ringExtended && !pinkyExtended) {
      return { gesture: "W", confidence: 90 };
    }

    // V vs U: Index and Middle extended
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      const spread = getDist(lm[8], lm[12]);
      const spacingThreshold = getDist(lm[5], lm[9]) * 1.1;
      
      // R: crossed check (Index is to the right of Middle in camera coords)
      if (lm[8].x > lm[12].x + 0.02) {
        return { gesture: "R", confidence: 85 };
      }

      if (spread >= spacingThreshold) {
        return { gesture: "V", confidence: 93 };
      } else {
        return { gesture: "U", confidence: 91 };
      }
    }

    // L: Index and Thumb extended, others curled
    if (indexExtended && thumbExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return { gesture: "L", confidence: 94 };
    }

    // F: Index and Thumb form a circle, other fingers extended
    if (middleExtended && ringExtended && pinkyExtended && !indexExtended) {
      const indexThumbDist = getDist(lm[8], lm[4]);
      if (indexThumbDist < 0.08) {
        return { gesture: "F", confidence: 90 };
      }
    }

    // D: Index extended up, others curled
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return { gesture: "D", confidence: 93 };
    }

    // I: Pinky extended, others curled
    if (pinkyExtended && !indexExtended && !middleExtended && !ringExtended && !thumbExtended) {
      return { gesture: "I", confidence: 92 };
    }

    // K: Index and Middle up, thumb touching middle joint
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      const thumbMiddleDist = getDist(lm[4], lm[10]);
      if (thumbMiddleDist < 0.08) {
        return { gesture: "K", confidence: 88 };
      }
    }

    // C: Curved hand claw (all fingers partially bent)
    const indexBentHalf = lm[8].y > lm[6].y && lm[8].y < lm[5].y;
    const middleBentHalf = lm[12].y > lm[10].y && lm[12].y < lm[9].y;
    if (indexBentHalf && middleBentHalf && thumbExtended) {
      return { gesture: "C", confidence: 85 };
    }

    // G & H (Horizontal finger extensions check)
    const indexHorizontal = Math.abs(lm[8].x - lm[5].x) > Math.abs(lm[8].y - lm[5].y) * 1.4;
    const middleHorizontal = Math.abs(lm[12].x - lm[9].x) > Math.abs(lm[12].y - lm[9].y) * 1.4;
    
    if (indexHorizontal && middleHorizontal && !ringExtended && !pinkyExtended) {
      return { gesture: "H", confidence: 88 };
    }
    if (indexHorizontal && thumbExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return { gesture: "G", confidence: 86 };
    }

    // E: Curved claws close together (tight claw)
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      const tipsAboveMCP = lm[8].y < lm[5].y && lm[12].y < lm[9].y;
      const tipsBelowPIP = lm[8].y > lm[6].y && lm[12].y > lm[10].y;
      if (tipsAboveMCP && tipsBelowPIP) {
        return { gesture: "E", confidence: 84 };
      }
    }

    // O: Circular shape (all tips touch thumb tip)
    const indexToThumb = getDist(lm[8], lm[4]);
    const middleToThumb = getDist(lm[12], lm[4]);
    if (indexToThumb < 0.08 && middleToThumb < 0.08 && !indexExtended && !middleExtended) {
      return { gesture: "O", confidence: 87 };
    }

    return { gesture: "None", confidence: 0 };
  }

  // Detect dynamic movements (like waving for Hello, sweeping for Welcome/Thank You)
  detectDynamicGestures(lm, staticGesture) {
    if (this.handHistory.length < 10) return null;

    // Filter out null values
    const validHistory = this.handHistory.filter(h => h !== null);
    if (validHistory.length < 8) return null;

    const currentLm = lm;
    const pastLm = validHistory[validHistory.length - 8];

    // Calculate motion of wrist (joint 0) and index finger MCP (joint 5)
    const wristDX = currentLm[0].x - pastLm[0].x;
    const wristDY = currentLm[0].y - pastLm[0].y;
    
    // Wave detection for Hello (X-axis oscillation of open hand)
    if (staticGesture === "Hello" || staticGesture === "Stop") {
      let xcoords = validHistory.map(h => h[5].x);
      let minX = Math.min(...xcoords);
      let maxX = Math.max(...xcoords);
      let xDiff = maxX - minX;

      // If hand is moving side to side significantly
      if (xDiff > 0.08) {
        return { gesture: "Hello", confidence: 96 };
      }
    }

    // Welcome (Open hand sweeping inwards - moving horizontally and slightly towards body)
    if (staticGesture === "Hello") {
      const wristSpeedX = Math.abs(wristDX);
      if (wristSpeedX > 0.05 && Math.abs(wristDY) < 0.03) {
        return { gesture: "Welcome", confidence: 91 };
      }
    }

    // Thank You (Open hand moving from lips downwards/outwards)
    // We check if hand starts high and drops in Y, while tilted forward
    if (staticGesture === "Hello" || staticGesture === "Please") {
      if (wristDY > 0.07) {
        return { gesture: "Thank You", confidence: 93 };
      }
    }

    // Sorry (Fist moving in circular motion)
    const isFist = !currentLm[8].y < currentLm[6].y && !currentLm[12].y < currentLm[10].y;
    if (isFist) {
      let xcoords = validHistory.map(h => h[0].x);
      let ycoords = validHistory.map(h => h[0].y);
      let dx = Math.max(...xcoords) - Math.min(...xcoords);
      let dy = Math.max(...ycoords) - Math.min(...ycoords);
      
      // circular-like motion
      if (dx > 0.04 && dy > 0.04 && dx < 0.15 && dy < 0.15) {
        return { gesture: "Sorry", confidence: 89 };
      }
    }

    // Help (Two hands sequence or Thumbs Up moving upwards)
    if (staticGesture === "Good") {
      // Check if Thumbs Up is moving upwards
      if (wristDY < -0.06) {
        return { gesture: "Help", confidence: 94 };
      }
    }

    return null;
  }

  // Detect multi-gesture phrases (Good Morning, Good Night)
  checkCompoundPhrases(detectedGesture) {
    const now = Date.now();
    
    // Save static gesture updates
    if (detectedGesture !== "None" && detectedGesture !== this.lastStaticGesture) {
      // Sequence detection logic
      if (this.lastStaticGesture === "Good" && (now - this.lastStaticGestureTime < 2200)) {
        if (detectedGesture === "Hello" || detectedGesture === "Welcome") {
          this.reset();
          return { gesture: "Good Morning", confidence: 97 };
        }
        if (detectedGesture === "Stop" || detectedGesture === "Yes") {
          this.reset();
          return { gesture: "Good Night", confidence: 95 };
        }
      }
      
      this.lastStaticGesture = detectedGesture;
      this.lastStaticGestureTime = now;
    }
    
    return null;
  }
}

// MediaPipe Setup and Loop Hook
let gestureRecognizer = new GestureRecognizer();
let webcamElement = null;
let canvasElement = null;
let canvasCtx = null;
let camera = null;
let handsDetector = null;
let onGestureRecognizedCallback = null;

function initGestureDetector(videoId, canvasId, callback) {
  webcamElement = document.getElementById(videoId);
  canvasElement = document.getElementById(canvasId);
  canvasCtx = canvasElement.getContext('2d');
  onGestureRecognizedCallback = callback;

  // Set canvas size to match resolution
  canvasElement.width = 640;
  canvasElement.height = 360;

  // Initialize MediaPipe Hands
  handsDetector = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
  });

  handsDetector.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.55,
    minTrackingConfidence: 0.55
  });

  handsDetector.onResults(onHandResults);
}

function onHandResults(results) {
  // Clear canvas
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  let detectedLandmarks = null;
  let handStatus = "Disconnected";

  // Check if hand is detected
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    detectedLandmarks = results.multiHandLandmarks[0];
    handStatus = "Connected";

    // Draw landmarks using MediaPipe utility
    drawConnectors(canvasCtx, detectedLandmarks, HAND_CONNECTIONS, {
      color: '#7f00ff',
      lineWidth: 3
    });
    drawLandmarks(canvasCtx, detectedLandmarks, {
      color: '#00f2fe',
      lineWidth: 1,
      radius: 4
    });
  }

  // Update gesture classifier
  const result = gestureRecognizer.update(detectedLandmarks);
  
  if (onGestureRecognizedCallback) {
    onGestureRecognizedCallback({
      status: handStatus,
      gesture: result.gesture,
      confidence: result.confidence
    });
  }
}

function startCameraStream() {
  if (!handsDetector) return Promise.reject("MediaPipe not initialized");

  document.getElementById("camera-placeholder").style.display = "none";
  document.getElementById("btn-stop-camera").style.display = "inline-flex";
  document.getElementById("scanner-line").parentNode.classList.add("scanning");

  camera = new Camera(webcamElement, {
    onFrame: async () => {
      await handsDetector.send({ image: webcamElement });
    },
    width: 640,
    height: 360
  });

  return camera.start().then(() => {
    document.getElementById("camera-status-dot").className = "status-dot connected";
    document.getElementById("camera-status-text").innerText = "Camera Status: Active";
  });
}

function stopCameraStream() {
  if (camera) {
    camera.stop();
    camera = null;
  }
  
  // Reset UI
  document.getElementById("camera-placeholder").style.display = "flex";
  document.getElementById("btn-stop-camera").style.display = "none";
  document.getElementById("scanner-line").parentNode.classList.remove("scanning");
  document.getElementById("camera-status-dot").className = "status-dot disconnected";
  document.getElementById("camera-status-text").innerText = "Camera Status: Disconnected";
  
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  gestureRecognizer.reset();
  
  if (onGestureRecognizedCallback) {
    onGestureRecognizedCallback({
      status: "Disconnected",
      gesture: "None",
      confidence: 0
    });
  }
}
