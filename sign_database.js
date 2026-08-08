/**
 * TOUCH - Shared Sign Language Database
 * Contains A-Z letter poses and word animation definitions.
 * Poses are specified by joint rotation angles (0 = straight, 1.4 = fully curled).
 */

const SIGN_DATABASE = {
  // --- LETTERS A-Z ---
  "A": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [0.2, 0.2, 0.2],
      index: [1.4, 1.4, 1.4],
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "B": {
    type: "letter",
    pose: {
      wrist: { rx: -0.2, ry: 0.4, rz: 0 },
      thumb: [1.2, 0.8, 0.8], // Thumb folded across palm
      index: [0, 0, 0],
      middle: [0, 0, 0],
      ring: [0, 0, 0],
      pinky: [0, 0, 0]
    }
  },
  "C": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.6, rz: -0.2 },
      thumb: [0.6, 0.6, 0.6],
      index: [0.6, 0.6, 0.6],
      middle: [0.6, 0.6, 0.6],
      ring: [0.6, 0.6, 0.6],
      pinky: [0.6, 0.6, 0.6]
    }
  },
  "D": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [0.8, 0.8, 0.8],
      index: [0, 0, 0], // Pointing up
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "E": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [1.2, 1.0, 1.0],
      index: [1.0, 1.0, 1.0],
      middle: [1.0, 1.0, 1.0],
      ring: [1.0, 1.0, 1.0],
      pinky: [1.0, 1.0, 1.0]
    }
  },
  "F": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [1.0, 1.0, 1.0],
      index: [1.0, 1.0, 1.0], // Touch thumb
      middle: [0, 0, 0], // Extended
      ring: [0, 0, 0], // Extended
      pinky: [0, 0, 0]  // Extended
    }
  },
  "G": {
    type: "letter",
    pose: {
      wrist: { rx: -0.1, ry: 1.2, rz: 0 }, // Hand turned sideways
      thumb: [0, 0, 0], // Pointing forward
      index: [0, 0, 0], // Pointing forward
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "H": {
    type: "letter",
    pose: {
      wrist: { rx: -0.1, ry: 1.2, rz: 0 }, // Hand turned sideways
      thumb: [1.4, 1.4, 1.4],
      index: [0, 0, 0], // Pointing forward
      middle: [0, 0, 0], // Pointing forward close together
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "I": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [1.2, 0.8, 0.8],
      index: [1.4, 1.4, 1.4],
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [0, 0, 0] // Pinky up
    }
  },
  "J": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [1.2, 0.8, 0.8],
      index: [1.4, 1.4, 1.4],
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [0, 0, 0]
    },
    dynamicEffect: "J"
  },
  "K": {
    type: "letter",
    pose: {
      wrist: { rx: -0.2, ry: 0.5, rz: 0 },
      thumb: [0.4, 0.2, 0.2], // Resting on middle finger
      index: [0, 0, 0], // Up
      middle: [0.3, 0.1, 0.1], // Slightly forward/up
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "L": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [0, 0, 0], // Outward
      index: [0, 0, 0], // Upward
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "M": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [1.0, 0.8, 0.8],
      index: [1.2, 1.2, 1.2], // Bent over thumb
      middle: [1.2, 1.2, 1.2], // Bent over thumb
      ring: [1.2, 1.2, 1.2], // Bent over thumb
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "N": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [1.0, 0.8, 0.8],
      index: [1.2, 1.2, 1.2], // Bent over thumb
      middle: [1.2, 1.2, 1.2], // Bent over thumb
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "O": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [0.8, 0.8, 0.8],
      index: [0.8, 0.8, 0.8],
      middle: [0.8, 0.8, 0.8],
      ring: [0.8, 0.8, 0.8],
      pinky: [0.8, 0.8, 0.8]
    }
  },
  "P": {
    type: "letter",
    pose: {
      wrist: { rx: 0.8, ry: 0.5, rz: -0.3 }, // Pointing down
      thumb: [0.4, 0.2, 0.2],
      index: [0, 0, 0],
      middle: [0.3, 0.1, 0.1],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "Q": {
    type: "letter",
    pose: {
      wrist: { rx: 0.8, ry: 1.2, rz: -0.3 }, // Pointing down
      thumb: [0, 0, 0],
      index: [0, 0, 0],
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "R": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [1.4, 1.4, 1.4],
      index: [0, 0, 0], // Crossed index
      middle: [0, 0, 0], // Crossed middle (close/behind index)
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "S": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [1.4, 1.2, 1.2], // Folded tightly in front of fingers
      index: [1.4, 1.4, 1.4],
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "T": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [0.8, 0.8, 0.8], // Tucked under index
      index: [1.2, 1.2, 1.2],
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "U": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [1.4, 1.4, 1.4],
      index: [0, 0, 0], // Up
      middle: [0, 0, 0], // Up close together
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "V": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [1.4, 1.4, 1.4],
      index: [0, 0, 0], // Up
      middle: [0, 0, 0], // Up spread
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "W": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [1.0, 0.8, 0.8],
      index: [0, 0, 0],
      middle: [0, 0, 0],
      ring: [0, 0, 0],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "X": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [1.4, 1.4, 1.4],
      index: [0.4, 1.2, 1.2], // Hooked index
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    }
  },
  "Y": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [0, 0, 0], // Extended
      index: [1.4, 1.4, 1.4],
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [0, 0, 0] // Extended
    }
  },
  "Z": {
    type: "letter",
    pose: {
      wrist: { rx: -0.3, ry: 0.5, rz: 0 },
      thumb: [1.4, 1.4, 1.4],
      index: [0, 0, 0],
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    },
    dynamicEffect: "Z"
  },

  // --- COMMON WORDS ---
  "HELLO": {
    type: "word",
    pose: {
      wrist: { rx: -0.1, ry: 0, rz: 0 },
      thumb: [0, 0, 0],
      index: [0, 0, 0],
      middle: [0, 0, 0],
      ring: [0, 0, 0],
      pinky: [0, 0, 0]
    },
    dynamicEffect: "Hello"
  },
  "THANK YOU": {
    type: "word",
    pose: {
      wrist: { rx: 0.4, ry: 0.3, rz: -0.2 },
      thumb: [0.2, 0, 0],
      index: [0, 0, 0],
      middle: [0, 0, 0],
      ring: [0, 0, 0],
      pinky: [0, 0, 0]
    },
    dynamicEffect: "Thank You"
  },
  "YES": {
    type: "word",
    pose: {
      wrist: { rx: -0.1, ry: 0.5, rz: 0 },
      thumb: [1.2, 0.8, 0.8],
      index: [1.4, 1.4, 1.4],
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    },
    dynamicEffect: "Yes"
  },
  "NO": {
    type: "word",
    pose: {
      wrist: { rx: -0.2, ry: 0.4, rz: 0.1 },
      thumb: [0, 0.1, 0.1],
      index: [0.8, 0.7, 0.5],
      middle: [0.8, 0.7, 0.5],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    },
    dynamicEffect: "No"
  },
  "HELP": {
    type: "word",
    pose: {
      wrist: { rx: -0.2, ry: 0.7, rz: 0.2 },
      thumb: [0, 0, 0],
      index: [1.4, 1.4, 1.4],
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    },
    dynamicEffect: "Help"
  },
  "GOOD": {
    type: "word",
    pose: {
      wrist: { rx: -0.1, ry: 0.6, rz: 0 },
      thumb: [0, -0.2, -0.2],
      index: [1.4, 1.4, 1.4],
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    },
    dynamicEffect: "Good"
  },
  "BAD": {
    type: "word",
    pose: {
      wrist: { rx: 0.5, ry: -0.4, rz: -0.2 },
      thumb: [0.4, 0.2, 0.2],
      index: [0, 0, 0], // flat fingers pointing down-ish
      middle: [0, 0, 0],
      ring: [0, 0, 0],
      pinky: [0, 0, 0]
    },
    dynamicEffect: "Bad"
  },
  "PLEASE": {
    type: "word",
    pose: {
      wrist: { rx: -0.4, ry: 0.3, rz: 0 },
      thumb: [0.6, 0.4, 0.4],
      index: [0.05, 0.05, 0.05],
      middle: [0.05, 0.05, 0.05],
      ring: [0.05, 0.05, 0.05],
      pinky: [0.05, 0.05, 0.05]
    },
    dynamicEffect: "Please"
  },
  "WELCOME": {
    type: "word",
    pose: {
      wrist: { rx: -0.2, ry: 0.3, rz: -0.2 },
      thumb: [0.1, 0, 0],
      index: [0.05, 0.05, 0.05],
      middle: [0.05, 0.05, 0.05],
      ring: [0.05, 0.05, 0.05],
      pinky: [0.05, 0.05, 0.05]
    },
    dynamicEffect: "Welcome"
  },
  "SORRY": {
    type: "word",
    pose: {
      wrist: { rx: -0.1, ry: 0.5, rz: 0.1 },
      thumb: [1.2, 0.9, 0.9],
      index: [1.4, 1.4, 1.4],
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    },
    dynamicEffect: "Sorry"
  },

  // --- DYNAMIC PHRASES ---
  "GOOD MORNING": {
    type: "word",
    pose: {
      wrist: { rx: -0.1, ry: 0, rz: 0 },
      thumb: [0, 0, 0],
      index: [0, 0, 0],
      middle: [0, 0, 0],
      ring: [0, 0, 0],
      pinky: [0, 0, 0]
    },
    dynamicEffect: "Good Morning"
  },
  "GOOD NIGHT": {
    type: "word",
    pose: {
      wrist: { rx: -0.1, ry: 0.5, rz: 0 },
      thumb: [1.2, 0.8, 0.8],
      index: [1.4, 1.4, 1.4],
      middle: [1.4, 1.4, 1.4],
      ring: [1.4, 1.4, 1.4],
      pinky: [1.4, 1.4, 1.4]
    },
    dynamicEffect: "Good Night"
  }
};
