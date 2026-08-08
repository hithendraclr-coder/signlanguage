# Implementation Plan - TOUCH Web Application

TOUCH (Transforming Oral Understanding into Clear HandSigns) is a web-based, interactive system providing two-way translation between hand signs and spoken language/text. It is designed with rich visual aesthetics suitable for a premium academic/B.Tech project demonstration.

## User Review Required

> [!IMPORTANT]
> The application will run entirely in the browser using HTML5, CSS3, MediaPipe Hands (CDN), Three.js (CDN), and the Web Speech API (Speech Recognition & Speech Synthesis). 
> This approach ensures it can be run instantly by opening the `index.html` file or via a local web server (e.g. VS Code Live Server) without any node_modules configuration, making it highly portable and reliable for presentations.

> [!TIP]
> We will implement standard gesture detection using MediaPipe landmark coordinates. We'll write a rule-based gesture classifier in JavaScript to identify the 13 supported signs in real time from the webcam feed, complete with feedback overlays.

## Proposed Changes

We will create a modular, modern web application containing:
1. `index.html` — The main structure, including a hero section, the dual-mode dashboard, tech stack details, about section, and user instructions.
2. `style.css` — High-fidelity CSS using glassmorphism, responsive grid layouts, interactive glowing hover states, and smooth transition animations.
3. `gesture_detector.js` — The MediaPipe camera overlay integration and custom classification logic for hand gestures.
4. `hand_viewer_3d.js` — Three.js skeletal hand mesh creator and procedural animation engine for spoken words.
5. `app.js` — Core coordinator for speech recognition, text-to-speech, camera states, dictionaries, and UI event binding.

---

### UI & Layout (index.html, style.css)

#### [NEW] [index.html](file:///c:/Users/91756/OneDrive/Pictures/hand%20guesture%20project/index.html)
- Main title and subtitle with custom animations.
- Dashboard cards for:
  - **Mode 1**: Hand Sign to Text (Video element, Canvas overlay for hand skeletons, confidence display, recognized word read-out, Speech Speak button, Reset button).
  - **Mode 2**: Voice to 3D Sign (Speech trigger, status log, 3D viewport canvas for Three.js hand, 3D play/pause/replay controls, speed slider).
- Info cards: "About TOUCH", "How it Works", "Technology Stack", and "Project Benefits".
- Beautiful custom alert messages for permissions.

#### [NEW] [style.css](file:///c:/Users/91756/OneDrive/Pictures/hand%20guesture%20project/style.css)
- Sleek modern theme using Deep Blue (`#0a192f`), Cyan (`#00f2fe`), Purple (`#7f00ff`), and Glassmorphism (backdrop-filters, light translucent backgrounds, border rings).
- Responsive grid and card systems.
- Keyframe animations for hand landmarks scanning, voice wave animations, and pulse effects.

---

### Machine Learning & Computer Vision (gesture_detector.js)

#### [NEW] [gesture_detector.js](file:///c:/Users/91756/OneDrive/Pictures/hand%20guesture%20project/gesture_detector.js)
- Loads and instantiates MediaPipe Hands using web worker files from CDN.
- Configures hand landmarks detection with optimal parameters (max hands: 1, min detection confidence: 0.5).
- Custom logic to classify the 13 initial signs based on joint angles, coordinates, and distances:
  - **I Love You**: Thumb, Index, Pinky extended; Middle, Ring closed.
  - **Good** (Thumbs up): Thumb extended upwards; other fingers folded.
  - **Stop**: All fingers fully extended and spaced out.
  - **Yes**: Fist shape (all fingers folded) shifting or shaking.
  - **No**: Index and middle fingers extended close together, thumb pointing forward, others folded.
  - **Hello**: Hand waving (tracking coordinates delta over frames) or open flat hand.
  - **Thank You**: Hand moving flat from face outwards (tilt change).
  - **Please**: Flat hand moving in a circular path.
  - **Help**: Thumb up resting on palm.
  - **Sorry**: Flat hand or fist on chest.
  - **Welcome**: Open hand moving towards the body.
  - **Good Morning** & **Good Night**: Sequence detection of Good + wave/close.
- Draws standard landmark skeletons and connectors on canvas over the camera feed.

---

### 3D Hand Model & Animations (hand_viewer_3d.js)

#### [NEW] [hand_viewer_3d.js](file:///c:/Users/91756/OneDrive/Pictures/hand%20guesture%20project/hand_viewer_3d.js)
- Initializes Three.js renderer, scene, perspective camera, lights, and orbit controls.
- Creates a structured 3D hand mesh:
  - Palm: Rounded flat box mesh.
  - Fingers: Hierarchical finger segments (MCP, PIP, DIP) composed of cylinders and spheres for joints.
- Implements procedural joint animations for the 13 supported signs:
  - Hello (hand rotates side-to-side).
  - Thank You (hand moves forward and down, rotating).
  - Yes (fist nodes up and down).
  - No (index and middle fingers wiggle/pinch down).
  - Please (hand moves in circular pattern).
  - Good (fingers bend except thumb).
  - I Love You (middle/ring fingers bend, others stay straight).
  - Stop (palm faces forward, fingers spread).
  - etc.
- Provides controllers for speed, pausing, playing, and resetting/looping animations.

---

### Main Logic Coordinating (app.js)

#### [NEW] [app.js](file:///c:/Users/91756/OneDrive/Pictures/hand%20guesture%20project/app.js)
- Manages permission requests for Camera and Microphone.
- Wires up the SpeechRecognition API (`webkitSpeechRecognition`) to listen to microphone input, print recognized text, and trigger the 3D hand animation.
- Wires up the SpeechSynthesis API to speak out recognized text when clicking the "Speak" button.
- Handles user interface tab toggles between Hand Sign Mode and Voice Mode.

## Verification Plan

### Automated Verification
- Code quality checks via browser console.
- Mocking mock-speech-recognition triggers and verifying output UI states.

### Manual Verification
1. Open page in browser.
2. Toggle Mode 1 (Camera):
   - Accept camera permission.
   - Show hands, verify landmarks are drawn.
   - Perform "I Love You" gesture, check if it detects it and updates output.
   - Click "Speak" button, check if voice says "I Love You".
3. Toggle Mode 2 (Voice):
   - Accept microphone permission.
   - Speak "Hello" or "Good", verify speech-to-text displays the word.
   - Watch the 3D viewer perform the hand animation.
   - Verify play, pause, replay, and speed adjustment sliders.
