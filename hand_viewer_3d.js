/**
 * TOUCH - 3D Hand Model Renderer & Animation Engine
 * Uses Three.js to construct a cybernetic skeletal hand model
 * and procedural joints mapping to animate 13 distinct sign concepts.
 */

class HandViewer3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.width = this.container.clientWidth || 500;
    this.height = this.container.clientHeight || 380;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    
    this.handGroup = null; // Root hand group
    this.palm = null;
    this.fingers = {}; // Stores finger joint hierarchies
    
    // Animation state
    this.currentConcept = "Neutral";
    this.animationSpeed = 1.0;
    this.isPlaying = true;
    this.time = 0;
    
    // Target joints orientations mapping
    this.poseTargets = this.initPoseTargets();
    this.currentJointAngles = this.initJointAngles();
    this.targetJointAngles = this.initJointAngles();
    
    this.initThreeJS();
    this.createHandModel();
    this.animate();
    
    // Handle resizing
    window.addEventListener('resize', () => this.onWindowResize());
  }

  // Setup Scene, Lights, Camera and Controls
  initThreeJS() {
    this.scene = new THREE.Scene();
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0, 18);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
    
    // Ambient and Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    
    const dirLight1 = new THREE.DirectionalLight(0x00f2fe, 0.8);
    dirLight1.position.set(5, 10, 7);
    this.scene.add(dirLight1);
    
    const dirLight2 = new THREE.DirectionalLight(0x9d4edd, 0.6);
    dirLight2.position.set(-5, -5, 5);
    this.scene.add(dirLight2);
    
    // Orbit Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 1.5;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 25;
  }

  // Construct cybernetic styled hand using hierarchical groups
  createHandModel() {
    this.handGroup = new THREE.Group();
    this.scene.add(this.handGroup);

    // Materials
    const boneMaterial = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.95
    });

    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x9d4edd,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x5a189a,
      emissiveIntensity: 0.5
    });

    // 1. Palm base
    const palmGeo = new THREE.BoxGeometry(3, 3.2, 0.8);
    // Round corners slightly by adding edge lines (cyber mesh style)
    this.palm = new THREE.Mesh(palmGeo, boneMaterial);
    this.handGroup.add(this.palm);

    // 2. Add fingers mapping
    // Hand layout: 5 fingers (Thumb, Index, Middle, Ring, Pinky)
    // Keys match fingers dictionary, values contain relative mounting coordinates
    const fingerSpecs = {
      thumb: { x: -1.4, y: -0.8, z: 0.2, rotZ: 0.5, scale: 0.85 },
      index: { x: -1.1, y: 1.6, z: 0, rotZ: 0.05, scale: 1.0 },
      middle: { x: -0.3, y: 1.7, z: 0, rotZ: 0, scale: 1.05 },
      ring: { x: 0.5, y: 1.6, z: 0, rotZ: -0.05, scale: 0.98 },
      pinky: { x: 1.2, y: 1.4, z: 0, rotZ: -0.12, scale: 0.88 }
    };

    Object.entries(fingerSpecs).forEach(([name, spec]) => {
      const fingerRoot = new THREE.Group();
      fingerRoot.position.set(spec.x, spec.y, spec.z);
      fingerRoot.rotation.z = spec.rotZ;
      this.palm.add(fingerRoot);

      this.fingers[name] = this.buildFingerBones(fingerRoot, name === 'thumb', boneMaterial, jointMaterial, spec.scale);
    });

    // Rotate palm initially to face screen nicely
    this.handGroup.rotation.set(-0.3, 0.5, 0);
  }

  // Build a multi-segmented hierarchical bone structure for a single finger
  buildFingerBones(parentGroup, isThumb, boneMat, jointMat, scale) {
    const phalanges = [];
    const joints = [];
    
    // Segment lengths
    const segLengths = isThumb ? [1.1, 0.9, 0.7] : [1.4, 1.1, 0.8];
    const thickness = 0.22 * scale;
    
    let currentParent = parentGroup;

    for (let i = 0; i < 3; i++) {
      // Joint Sphere
      const jointGeo = new THREE.SphereGeometry(thickness * 1.35, 16, 16);
      const jointMesh = new THREE.Mesh(jointGeo, jointMat);
      currentParent.add(jointMesh);
      joints.push(currentParent); // The group represents the joint rotation center

      // Bone Cylinder
      const length = segLengths[i] * scale;
      const boneGeo = new THREE.CylinderGeometry(thickness * 0.9, thickness, length, 12);
      boneGeo.translate(0, length / 2, 0); // Offset pivot to base of cylinder
      const boneMesh = new THREE.Mesh(boneGeo, boneMat);
      currentParent.add(boneMesh);
      phalanges.push(boneMesh);

      // Create next joint anchor group at the tip of the current bone
      if (i < 2) {
        const nextJointGroup = new THREE.Group();
        nextJointGroup.position.set(0, length, 0);
        currentParent.add(nextJointGroup);
        currentParent = nextJointGroup;
      }
    }

    return { joints, phalanges };
  }

  // Initial joints values definitions (Neutral State)
  initJointAngles() {
    return {
      wrist: { rx: -0.3, ry: 0.5, rz: 0, px: 0, py: 0, pz: 0 },
      thumb: [0, 0, 0],  // Joint rotations rx (MCP, PIP, DIP)
      index: [0, 0, 0],
      middle: [0, 0, 0],
      ring: [0, 0, 0],
      pinky: [0, 0, 0]
    };
  }

  // Populate sign posture angles dictionary
  initPoseTargets() {
    // 0 is fully extended (straight), 1.5 is curled (90 degrees bent)
    const targets = {};

    targets["Neutral"] = {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [0.1, 0.1, 0.1],
      index: [0.1, 0.1, 0.1],
      middle: [0.1, 0.1, 0.1],
      ring: [0.1, 0.1, 0.1],
      pinky: [0.1, 0.1, 0.1]
    };

    // Load all letters and words from global SIGN_DATABASE
    if (typeof SIGN_DATABASE !== "undefined") {
      Object.entries(SIGN_DATABASE).forEach(([key, value]) => {
        if (value.pose) {
          targets[key.toUpperCase()] = value.pose;
        }
      });
    }

    return targets;
  }

  // Trigger anim sequence towards target word
  showSign(concept) {
    const uppercaseConcept = concept.toUpperCase();
    if (!this.poseTargets[uppercaseConcept]) {
      console.warn(`Concept '${uppercaseConcept}' is not registered in dictionary.`);
      return;
    }
    
    this.currentConcept = uppercaseConcept;
    this.time = 0; // Reset animation timeline
    
    // Format label nicely: Letter vs full phrase
    const displayLabel = uppercaseConcept.length === 1 ? `Letter: ${uppercaseConcept}` : `Sign: ${concept}`;
    document.getElementById("current-sign-badge").innerText = displayLabel;
    
    // Set matching items list in sidebar active
    document.querySelectorAll(".dict-item").forEach(btn => {
      const btnWord = btn.getAttribute("data-word") || "";
      if (btnWord.toLowerCase() === concept.toLowerCase()) {
        btn.classList.add("animating");
      } else {
        btn.classList.remove("animating");
      }
    });

    // Update target angles
    const pose = this.poseTargets[uppercaseConcept];
    this.targetJointAngles.wrist = { ...pose.wrist };
    this.targetJointAngles.thumb = [ ...pose.thumb ];
    this.targetJointAngles.index = [ ...pose.index ];
    this.targetJointAngles.middle = [ ...pose.middle ];
    this.targetJointAngles.ring = [ ...pose.ring ];
    this.targetJointAngles.pinky = [ ...pose.pinky ];
  }

  // Linear Interpolation helper
  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  // Core render loop
  animate() {
    requestAnimationFrame(() => this.animate());

    this.controls.update();

    if (this.isPlaying) {
      // Dynamic time step increment
      this.time += 0.015 * this.animationSpeed;
      
      // Interpolate current values to target values smoothly
      const speedCoeff = 0.12 * this.animationSpeed;
      
      // Interpolate wrist orientation
      this.currentJointAngles.wrist.rx = this.lerp(this.currentJointAngles.wrist.rx, this.targetJointAngles.wrist.rx, speedCoeff);
      this.currentJointAngles.wrist.ry = this.lerp(this.currentJointAngles.wrist.ry, this.targetJointAngles.wrist.ry, speedCoeff);
      this.currentJointAngles.wrist.rz = this.lerp(this.currentJointAngles.wrist.rz, this.targetJointAngles.wrist.rz, speedCoeff);

      // Interpolate fingers
      const fingerNames = ['thumb', 'index', 'middle', 'ring', 'pinky'];
      fingerNames.forEach(fn => {
        for (let j = 0; j < 3; j++) {
          this.currentJointAngles[fn][j] = this.lerp(
            this.currentJointAngles[fn][j],
            this.targetJointAngles[fn][j],
            speedCoeff
          );
        }
      });

      // Apply coordinates to model rotations
      this.handGroup.rotation.x = this.currentJointAngles.wrist.rx;
      this.handGroup.rotation.y = this.currentJointAngles.wrist.ry;
      this.handGroup.rotation.z = this.currentJointAngles.wrist.rz;

      fingerNames.forEach(fn => {
        const finger = this.fingers[fn];
        for (let j = 0; j < 3; j++) {
          // Bending rotates joint on the X-axis
          finger.joints[j].rotation.x = this.currentJointAngles[fn][j];
        }
      });

      // Add dynamic micro-movements based on concepts (waving, circling, etc.)
      this.applyDynamicMotionEffects();
    }

    this.renderer.render(this.scene, this.camera);
  }

  // Add periodic secondary animations (Wave, circle) to give lifelike feeling
  applyDynamicMotionEffects() {
    const waveSin = Math.sin(this.time * 6);
    const circleCos = Math.cos(this.time * 4);
    const circleSin = Math.sin(this.time * 4);

    switch(this.currentConcept) {
      case "HELLO":
        // Wave side to side (Z-axis rotation swing)
        this.handGroup.rotation.z += waveSin * 0.22;
        break;
        
      case "THANK YOU":
        // Move forward and down in sequence
        const cycle = (this.time * 2.5) % (Math.PI * 2);
        const progress = Math.sin(cycle * 0.5); // smooth forward sweep
        this.handGroup.rotation.x = this.lerp(-0.1, 0.6, progress);
        this.handGroup.position.y = this.lerp(0, -1.8, progress);
        this.handGroup.position.z = this.lerp(0, 1.2, progress);
        break;

      case "YES":
        // Nodding fist (X-axis rotation swing)
        this.handGroup.rotation.x += Math.sin(this.time * 5) * 0.15;
        break;

      case "NO":
        // Snapping index and middle fingers together
        const snap = Math.max(0, Math.sin(this.time * 8));
        this.fingers.index.joints[0].rotation.x = this.lerp(0.1, 0.9, snap);
        this.fingers.middle.joints[0].rotation.x = this.lerp(0.1, 0.9, snap);
        break;

      case "PLEASE":
        // Circular rubbing pattern in front
        this.handGroup.position.x = circleCos * 0.6;
        this.handGroup.position.y = circleSin * 0.6;
        break;

      case "SORRY":
        // Circular rubbing pattern in front (fist)
        this.handGroup.position.x = circleCos * 0.5;
        this.handGroup.position.y = circleSin * 0.5;
        break;

      case "HELP":
        // Elevate hand upwards
        const helpCycle = (this.time * 2) % (Math.PI * 2);
        this.handGroup.position.y = Math.sin(helpCycle * 0.5) * 1.5;
        break;

      case "WELCOME":
        // Horizontal sweep pattern
        const sweepCycle = (this.time * 2.2) % (Math.PI * 2);
        const sweepProgress = Math.sin(sweepCycle * 0.5);
        this.handGroup.rotation.y = this.lerp(0.1, -0.6, sweepProgress);
        this.handGroup.position.x = this.lerp(-1.0, 1.0, sweepProgress);
        break;

      case "BAD":
        // Downward throwing sweep
        const badCycle = (this.time * 2.5) % (Math.PI * 2);
        const badProgress = Math.sin(badCycle * 0.5);
        this.handGroup.rotation.x = this.lerp(-0.1, 0.8, badProgress);
        this.handGroup.position.y = this.lerp(0, -2.0, badProgress);
        this.handGroup.position.z = this.lerp(0, 1.0, badProgress);
        break;

      case "J":
        // Draw a J hook curve
        const jCycle = (this.time * 3) % (Math.PI * 2);
        this.handGroup.rotation.z = Math.sin(jCycle) * 0.2;
        this.handGroup.rotation.y = Math.cos(jCycle) * 0.15;
        this.handGroup.position.x = Math.sin(jCycle) * 0.5;
        this.handGroup.position.y = -Math.cos(jCycle * 0.5) * 0.8;
        break;

      case "Z":
        // Draw a Z shape path
        const zCycle = (this.time * 2) % 3; // 3 segments: top horizontal, diagonal down-left, bottom horizontal
        if (zCycle < 1) {
          this.handGroup.position.x = this.lerp(-1, 1, zCycle);
          this.handGroup.position.y = 1;
        } else if (zCycle < 2) {
          this.handGroup.position.x = this.lerp(1, -1, zCycle - 1);
          this.handGroup.position.y = this.lerp(1, -1, zCycle - 1);
        } else {
          this.handGroup.position.x = this.lerp(-1, 1, zCycle - 2);
          this.handGroup.position.y = -1;
        }
        break;

      case "GOOD MORNING":
        // Good (Thumbs Up) -> Wave sequence
        const morningPhase = (this.time * 1.5) % 4; // 4 seconds total cycle
        if (morningPhase < 2) {
          // Thumbs Up pose
          const goodPose = this.poseTargets["GOOD"];
          if (goodPose) {
            this.targetJointAngles.wrist = { ...goodPose.wrist };
            this.targetJointAngles.thumb = [ ...goodPose.thumb ];
            this.targetJointAngles.index = [ ...goodPose.index ];
            this.targetJointAngles.middle = [ ...goodPose.middle ];
            this.targetJointAngles.ring = [ ...goodPose.ring ];
            this.targetJointAngles.pinky = [ ...goodPose.pinky ];
          }
          // Tiny nod
          this.handGroup.rotation.x += Math.sin(this.time * 4) * 0.05;
        } else {
          // Hello Wave pose
          const helloPose = this.poseTargets["HELLO"];
          if (helloPose) {
            this.targetJointAngles.wrist = { ...helloPose.wrist };
            this.targetJointAngles.thumb = [ ...helloPose.thumb ];
            this.targetJointAngles.index = [ ...helloPose.index ];
            this.targetJointAngles.middle = [ ...helloPose.middle ];
            this.targetJointAngles.ring = [ ...helloPose.ring ];
            this.targetJointAngles.pinky = [ ...helloPose.pinky ];
          }
          this.handGroup.rotation.z += Math.sin(this.time * 7) * 0.22;
        }
        break;

      case "GOOD NIGHT":
        // Good (Thumbs Up) -> Close fist downward sequence
        const nightPhase = (this.time * 1.5) % 4;
        if (nightPhase < 2) {
          const goodPose = this.poseTargets["GOOD"];
          if (goodPose) {
            this.targetJointAngles.wrist = { ...goodPose.wrist };
            this.targetJointAngles.thumb = [ ...goodPose.thumb ];
            this.targetJointAngles.index = [ ...goodPose.index ];
            this.targetJointAngles.middle = [ ...goodPose.middle ];
            this.targetJointAngles.ring = [ ...goodPose.ring ];
            this.targetJointAngles.pinky = [ ...goodPose.pinky ];
          }
        } else {
          // Fist setting down
          const yesPose = this.poseTargets["YES"];
          if (yesPose) {
            this.targetJointAngles.wrist = { rx: 0.3, ry: 0.3, rz: 0 };
            this.targetJointAngles.thumb = [ ...yesPose.thumb ];
            this.targetJointAngles.index = [ ...yesPose.index ];
            this.targetJointAngles.middle = [ ...yesPose.middle ];
            this.targetJointAngles.ring = [ ...yesPose.ring ];
            this.targetJointAngles.pinky = [ ...yesPose.pinky ];
          }
          this.handGroup.position.y = this.lerp(0.5, -1.5, (nightPhase - 2) * 0.5);
        }
        break;
        
      default:
        // Reset translation offsets
        this.handGroup.position.set(0, 0, 0);
        break;
    }
  }

  // Handle container resizing
  onWindowResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(this.width, this.height);
  }
}
