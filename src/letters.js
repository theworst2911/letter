// this file is where we set up the hitboxes of each character
// its a pretty arduious task but you only ever have to do it once.
// unless you decide to change the font later on..

import p2 from "p2";

// i've been lazy here. some characters share similar dimensions
// so I've just written them once and shared them
const bLetterXY = {
  bBoxX: -4,
  bBoxY: 3.5
};

const bLetterBox = {
  width: 1.1,
  height: 1
};

const eLetterXY = {
  bBoxX: -3,
  bBoxY: 3.5
};

const eLetterBox = {
  width: 1.2,
  height: 1
};

const makeLetter = function ({ letter, mass, bBoxX, bBoxY, width, height }) {
  const body = new p2.Body({ mass });

  // body options
  body.sleepSpeedLimit = 0.5; // Body will feel sleepy if speed < x
  body.sleepTimeLimit = 2; // Body falls asleep after being sleepy for x secondss
  body.allowSleep = true;

  // body properties
  body.letter = letter;
  body.bBoxX = bBoxX;
  body.bBoxY = bBoxY;
  // 50/50 chance between a dark or light coloured letter
  body.fillStyle = Math.random() > 0.5 ? "#000" : "#fff";

  const shape = new p2.Box({ width, height });
  body.addShape(shape);

  return body;
};

export default [
  makeLetter({
    letter: "H",
    mass: 2,
    bBoxX: -4,
    bBoxY: 3.5,
    width: 1.2,
    height: 1
  }),
  makeLetter({
    letter: "E",
    mass: 3,
    ...bLetterXY,
    ...bLetterBox
  }),
  makeLetter({
    letter: "L",
    mass: 3,
    ...bLetterXY,
    ...bLetterBox
  }),
  makeLetter({
    letter: "I",
    mass: 3,
    ...bLetterXY,
    ...bLetterBox
  }),
  makeLetter({
    letter: "Z",
    mass: 3,
    ...eLetterXY,
    ...eLetterBox
  }),

  makeLetter({
    letter: "A",
    mass: 3,
    ...eLetterXY,
    ...eLetterBox
  }),
  makeLetter({
    letter: "B",
    mass: 5,
    bBoxX: -6,
    bBoxY: 3.8,
    width: 1.5,
    height: 1
  }),

  makeLetter({
    letter: "E",
    mass: 4,
    bBoxX: -6,
    bBoxY: 3.5,
    width: 1.5,
    height: 1
  }),

  makeLetter({
    letter: "T",
    mass: 1,
    bBoxX: -2,
    bBoxY: 3.5,
    width: 0.4,
    height: 1
  }),

  makeLetter({
    letter: "A",
    mass: 3,
    ...eLetterXY,
    ...eLetterBox
  }),
  makeLetter({
    letter: "K",
    mass: 4,
    ...bLetterXY,
    ...bLetterBox
  }),
  makeLetter({
    letter: "L",
    mass: 3,
    ...eLetterXY,
    ...eLetterBox
  }),

  makeLetter({
    letter: "M",
    mass: 4,
    bBoxX: -4,
    bBoxY: 3.5,
    width: 1.3,
    height: 1
  }),
  makeLetter({
    letter: "N",
    mass: 3,
    ...bLetterXY,
    ...bLetterBox
  }),
  makeLetter({
    letter: "O",
    mass: 4,
    bBoxX: -4,
    bBoxY: 3.8,
    width: 1.2,
    height: 1
  }),
  makeLetter({
    letter: "P",
    mass: 3,
    ...bLetterXY,
    ...bLetterBox
  }),
  makeLetter({
    letter: "Q",
    mass: 4,
    bBoxX: -6,
    bBoxY: 3.8,
    width: 1.2,
    height: 1
  }),
  makeLetter({
    letter: "R",
    mass: 3,
    ...bLetterXY,
    ...bLetterBox
  }),
  makeLetter({
    letter: "S",
    mass: 3,
    ...bLetterXY,
    ...bLetterBox
  }),
  makeLetter({
    letter: "T",
    mass: 3,
    ...eLetterXY,
    ...eLetterBox
  }),
  makeLetter({
    letter: "U",
    mass: 3,
    bBoxX: -6,
    bBoxY: 3.5,
    width: 1.5,
    height: 1
  }),

  makeLetter({
    letter: "V",
    mass: 3,
    bBoxX: -5,
    bBoxY: 3.5,
    width: 1.2,
    height: 1
  }),

  makeLetter({
    letter: "W",
    mass: 6,
    bBoxX: -4,
    bBoxY: 3.5,
    width: 1.2,
    height: 1
  }),

  makeLetter({
    letter: "X",
    mass: 3,
    bBoxX: -4,
    bBoxY: 3.5,
    width: 1.2,
    height: 1
  }),

  makeLetter({
    letter: "Y",
    mass: 3,
    bBoxX: -6,
    bBoxY: 3.5,
    width: 1.5,
    height: 1
  }),

  makeLetter({
    letter: "Z",
    mass: 3,
    bBoxX: -3,
    bBoxY: 3.5,
    width: 1.2,
    height: 1
  })
];
