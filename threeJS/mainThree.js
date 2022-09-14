/** @format */

// ============= Initialization =============

// ----- Core Imports -----
import * as THREE from "three";
import { OrbitControls } from "OrbitControls";

import { XRControllerModelFactory } from "./webxr/XRControllerModelFactory.js";
import { VRButton } from "./webxr/VRButton.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.138.3/examples/jsm/loaders/GLTFLoader.js";
import { Vector3 } from "three";

const GSAP = gsap;

// ----- Needed Objects -----
const myRayCaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  10000000000
);

// ----- Renderer Set -----
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.getElementById("renderCanvas"),
});

renderer.setClearColor("#000000");
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);

// ----- Renderer Set -----

// ----- WebXR Initialization -----
document.body.appendChild(VRButton.createButton(renderer));
renderer.xr.enabled = true;
// ----- WebXR Initialization -----

// ----- Orbit Set -----
let orbit = new OrbitControls(camera, renderer.domElement);
// orbit.maxDistance = 20;
// orbit.maxZoom = 0.523599; // 30 degrees
// ----- Orbit Set -----

// ----- Audio Set -----
let songPath = "./sounds/";
let songIndex = 0;
let songsToChoose = [
  songPath + "aLovelyNight.mp3",
  songPath + "R&J.mp3",
  songPath + "SomeoneInTheCrowd.mp3",
];
let songsLoaded = [];
let chosenSong;

const listener = new THREE.AudioListener(); // Microphone to our camera (one needed only)
camera.add(listener);

// Help load music files, set it to buffer later
const audioLoader = new THREE.AudioLoader();

// new THREE.Audio(listener) creates a non positional, global audio object (Audio object is the source of sounds)

for (let i = 0; i < songsToChoose.length; ++i) {
  songsLoaded.push(new THREE.Audio(listener));

  audioLoader.load(songsToChoose[i], function (buffer) {
    songsLoaded[i].setBuffer(buffer);
    songsLoaded[i].setLoop(true);
    songsLoaded[i].setVolume(1);
  });
}
chosenSong = songsLoaded[0];

let analyser = new THREE.AudioAnalyser(chosenSong, 512);
// ----- Audio Set -----

// ----- GLTF Set -----
let gltfModels = {};
const loader = new GLTFLoader();

function modelLoader(url) {
  return new Promise((res, rej) => {
    loader.load(url, (data) => res(data), null, rej);
  });
}

// ----- GLTF Set -----

// ============= Initialization =============

// ============= Events =============

// ----- if window resizes -----
window.addEventListener("resize", () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;

  // update camera's matrix everytime an internal adjustment made
  camera.updateProjectionMatrix();
});
// ----- if window resizes -----

// ============= Events =============

// ============= Scene Objects & Manipulations =============

let pLight1 = new THREE.PointLight(0xffffff, 1.5, 1000);
let pLight2 = new THREE.PointLight(0xffffff, 1.5, 1000);
pLight1.position.set(0, 0, 0);
scene.add(pLight1);

// pLight2.position.set(0, 0, 25);
// scene.add(pLight2);

// ===== Grids =====
let gridSize = 20; // grid centerpoint is (0, gridSize/2, 0)
let gridSizeHalf = gridSize / 2;

let gridMain = new THREE.GridHelper(
  gridSize,
  gridSize / 2,
  "#168270",
  "#2c1682"
);
gridMain.frustrumCulled = false;

let grid1 = gridMain.clone();
scene.add(grid1);

let grid2 = gridMain.clone();
grid2.rotation.x = Math.PI / 2;
grid2.position.y = gridSizeHalf;
grid2.position.z = gridSizeHalf;
scene.add(grid2);

let grid3 = gridMain.clone();
grid3.rotation.x = Math.PI / 2;
grid3.position.y = gridSizeHalf;
grid3.position.z = -gridSizeHalf;
scene.add(grid3);

let grid4 = gridMain.clone();
grid4.rotation.z = Math.PI / 2;
grid4.position.y = gridSizeHalf;
grid4.position.x = gridSizeHalf;
scene.add(grid4);

let grid5 = gridMain.clone();
grid5.rotation.z = Math.PI / 2;
grid5.position.y = gridSizeHalf;
grid5.position.x = -gridSizeHalf;
scene.add(grid5);

let grid6 = gridMain.clone();
grid6.rotation.y = Math.PI / 2;
grid6.position.y = gridSizeHalf;
grid6.position.y = gridSizeHalf * 2;
scene.add(grid6);

// ===== Grids =====

// Create a sine-like wave
const curve = new THREE.SplineCurve([
  new THREE.Vector2(-10, 0),
  new THREE.Vector2(-5, 5),
  new THREE.Vector2(0, 0),
  new THREE.Vector2(5, -5),
  new THREE.Vector2(10, 0),
]);

const points = curve.getPoints(100);
const geometry = new THREE.BufferGeometry().setFromPoints(points);

// Create the final object to add to the scene
const splineObject = new THREE.Line(
  geometry,
  new THREE.LineBasicMaterial({ color: 0xff0000 })
);

scene.add(splineObject);

// Camera adjustments
camera.position.x = -15;
camera.position.z = 15;
camera.position.y = 10;
camera.lookAt(new THREE.Vector3(0, 0, 0));
// Camera adjustments
let camPositionZ = 0;
// ============= Scene Objects & Manipulations =============

// ============= Controllers =============
let controllerGestures = [];
let controllerModels = [];

let userProfile = new THREE.Group();
userProfile.position.set(0, 0, 0);

let controllerReach = 3;

function onSelectStart() {
  console.log("selected start");

  if (this.name == "left") {
    if (chosenSong.isPlaying) {
      chosenSong.pause();
    } else {
      chosenSong = songsLoaded[songIndex];
      analyser = new THREE.AudioAnalyser(chosenSong, 512);
      chosenSong.play();

      songIndex += 1;
      songIndex = songIndex < songsLoaded.length ? songIndex : 0;
    }
  } else {
    createBullet(this);
  }

  this.children[0].scale.z = controllerReach;
  this.userData.selectPressed = true;
}

function onSelectEnd() {
  console.log("selected stop");

  this.children[0].scale.z = 0;
  this.userData.selectPressed = false;
}

function setUpController(event) {
  this.gamepad = event.data.gamepad;
  this.name = event.data.handedness;
}

function createControllers() {
  let controllerModelFactory = new XRControllerModelFactory();

  let controlGestureLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]),
    new THREE.LineBasicMaterial({
      color: 0x0000ff,
    })
  );
  controlGestureLine.scale.z = 0;

  for (let i = 0; i < 2; ++i) {
    let controlGesture = renderer.xr.getController(i);
    controlGesture.add(controlGestureLine.clone());

    controlGesture.userData.selectPressed = false; // When select button is pressed
    controlGesture.userData.selectPressedPrev = false; // When select button is previously pressed one frame back

    scene.add(controlGesture);
    controllerGestures.push(controlGesture);

    let controllerGrip = renderer.xr.getControllerGrip(i);
    controllerGrip.add(
      controllerModelFactory.createControllerModel(controllerGrip)
    );
    scene.add(controllerGrip);
    controllerModels.push(controllerGrip);
  }

  controllerGestures.forEach((controllerGesture) => {
    controllerGesture.addEventListener("selectstart", onSelectStart);
    controllerGesture.addEventListener("selectend", onSelectEnd);
    controllerGesture.addEventListener("connected", setUpController);
  });
}

// ============= Controllers =============

// ============= Interactable Objects =============
let interactableObjects = [];
let chosenInteractableObject = []; // 0 => Object | 1 => ObjectOriginalPosition
var boxAxis = new THREE.AxesHelper(20);

// ----- Cube Book -----
let cubeBookGroup = new THREE.Group();

let cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xffdddd, wireframe: true })
);

cubeBookGroup.add(cube);
cubeBookGroup.add(boxAxis);

// Book Model
gltfModels["bookModel"] = (await modelLoader("./models/scene.gltf")).scene;

let scaleValue = 0.01;
gltfModels["bookModel"].scale.set(scaleValue, scaleValue, scaleValue);
gltfModels["bookModel"].receiveShadow = true;
gltfModels["bookModel"].position.set(0, 0, 0);
gltfModels["bookModel"].rotation.x = Math.PI / 2;
gltfModels["bookModel"].rotation.z = 44;
gltfModels["bookModel"].rotation.y = 50;

cubeBookGroup.add(gltfModels["bookModel"]);
// Book Model

interactableObjects.push(cubeBookGroup);
cubeBookGroup.position.set(0, 2, -3);
// ----- Cube Book -----

// Add all interactable objects into scene
interactableObjects.forEach((obj) => {
  scene.add(obj);
});

// ============= Interactable Objects =============

// Gesture Handling Function
function gestureHandling(controllerGesture) {
  if (controllerGesture.userData.selectPressed) {
    if (!chosenInteractableObject.length > 0) {
      // First time intersect when select is pressed

      controllerGesture.children[0].scale.z = controllerReach;
      const rotationMatrix = new THREE.Matrix4();
      rotationMatrix.extractRotation(controllerGesture.matrixWorld);
      const raycaster = new THREE.Raycaster();
      raycaster.ray.origin.setFromMatrixPosition(controllerGesture.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(rotationMatrix);

      const intersects = raycaster.intersectObjects(interactableObjects);

      if (intersects.length > 0) {
        if (intersects[0].distance <= controllerReach) {
          controllerGesture.children[0].scale.z = intersects[0].distance;

          // chosenInteractableObject[0] is to put the Box's Parent
          chosenInteractableObject.push(intersects[0].object.parent);

          let controllerGestureWorldPos = new THREE.Vector3(0, 0, 0);
          controllerGesture.getWorldPosition(controllerGestureWorldPos);
          // chosenInteractableObject[1] is to put the distance from the Box's parent object with the controller
          chosenInteractableObject.push(
            intersects[0].object.parent.position.distanceTo(
              controllerGestureWorldPos
            )
          );
        }
      }
    } else {
      // Move selected object while always the same distance from controller
      let controllerGestureWorldPos = new THREE.Vector3(0, 0, 0);
      controllerGesture.getWorldPosition(controllerGestureWorldPos);

      const moveVector = controllerGesture
        .getWorldDirection(new THREE.Vector3())
        .multiplyScalar(chosenInteractableObject[1])
        .negate();
      chosenInteractableObject[0].position.copy(
        controllerGestureWorldPos.clone().add(moveVector)
      );
      chosenInteractableObject[0].lookAt(camera.position);
    }
  } else if (controllerGesture.userData.selectPressedPrev) {
    // Select released
    if (chosenInteractableObject.length > 0) {
      chosenInteractableObject.length = 0;
    }
  }
  controllerGesture.userData.selectPressedPrev =
    controllerGesture.userData.selectPressed;
}

// ============= Outside Objects =============
let outsideObj = [];

function plusOrMinus() {
  return Math.random() < 0.5 ? -1 : 1;
}

function getRandColor(brightness) {
  // Six levels of brightness from 0 to 5, 0 being the darkest
  var rgb = [Math.random() * 256, Math.random() * 256, Math.random() * 256];
  var mix = [brightness * 51, brightness * 51, brightness * 51]; //51 => 255/5
  var mixedrgb = [rgb[0] + mix[0], rgb[1] + mix[1], rgb[2] + mix[2]].map(
    function (x) {
      return Math.round(x / 2.0);
    }
  );

  return (
    "0x" +
    mixedrgb[0].toString(16) +
    mixedrgb[1].toString(16) +
    mixedrgb[2].toString(16)
  );

  // return "rgb(" + mixedrgb.join(",") + ")";
}

let maxDistanceOutsideObj = 30 + gridSize; //max distance from margin distance of outside obj (max + margin => x,y,z)

let yMax = maxDistanceOutsideObj;
let yMin = -(maxDistanceOutsideObj - gridSize);
let glowRad = 2.5;
let axisChoices = ["x", "y", "z"];

// ----- Create Spheres -----
for (let i = 0; i < 350; ++i) {
  let sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 12, 12),
    new THREE.MeshBasicMaterial()
  );
  let spriteMaterial = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load("./img/glow.png"),
    transparent: true,
    blending: THREE.AdditiveBlending,
  });

  let sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(glowRad, glowRad, glowRad);

  // Color
  sphere.colorNow = getRandColor(5);
  sphere.material.color.setHex(sphere.colorNow);
  sprite.material.color.setHex(sphere.colorNow);
  // Color

  sphere.add(sprite); // this centers the glow at the mesh
  outsideObj.push(sphere);

  console.log(sphere);
}

outsideObj.forEach((sphere) => {
  // Initial position outside of the grid
  sphere.position.set(
    Math.round(Math.random() * maxDistanceOutsideObj * plusOrMinus()),
    Math.round(Math.random() * (yMax - yMin) + yMin),
    Math.round(Math.random() * maxDistanceOutsideObj * plusOrMinus())
  );

  sphere.uniformDirection = 0.01;
  sphere.randomPosNeg = plusOrMinus();
  sphere.randomAxis = axisChoices[Math.ceil(Math.random() * 3) - 1]; // which axis will be the turning point

  sphere.counter = 0;
  sphere.lastFlash = 0;

  sphere.keepGlow = false;
  sphere.castShadow = true;
  sphere.receiveShadow = true;

  scene.add(sphere);
});

let outsideObjMomentum = 0.1;
let significantAudChance = false;

function moveOutsideObj() {
  outsideObj.forEach((sphere) => {
    sphere.counter += 1;
    sphere.children[0].scale.set(glowRad, glowRad, glowRad);

    if (chosenSong.isPlaying) {
      if (significantAudChance) {
        // If frame since last change has been at least 2
        if (sphere.counter - sphere.lastFlash > 2) {
          sphere.lastFlash = sphere.counter;

          // Color
          sphere.colorNow = getRandColor(5);
          sphere.children[0].material.color.setHex(sphere.colorNow);
          sphere.children[0].scale.set(
            glowRad + 0.9,
            glowRad + 0.9,
            glowRad + 0.9
          );
          sphere.material.color.setHex(sphere.colorNow);
          // Color

          sphere.randomAxis = axisChoices[Math.ceil(Math.random() * 3) - 1];
          sphere.randomPosNeg = plusOrMinus();
          sphere.counter = 0;
          sphere.lastFlash = 0;

          sphere.keepGlow = true;
        }
      }

      if (sphere.keepGlow) {
        if (sphere.counter - sphere.lastFlash > 5) {
          sphere.keepGlow = false;
        }
        if (sphere.children[0].scale.x >= glowRad) {
          sphere.children[0].scale.x += Math.sin(sphere.counter);
          sphere.children[0].scale.y += Math.sin(sphere.counter);
          sphere.children[0].scale.z += Math.sin(sphere.counter);
        }
      }
    }

    // Check if out of bounds
    for (let i = 0; i < 3; ++i) {
      let axis = axisChoices[i];

      if (i == 1) {
        // y
        if (sphere.position.y > yMin && sphere.position.y < yMax) {
          continue;
        }
      } else {
        // Math.abs(sphere.position[axis]) > maxDistanceOutsideObj // 4 pillar effect

        if (
          sphere.position[axis] > -maxDistanceOutsideObj &&
          sphere.position[axis] < maxDistanceOutsideObj
        ) {
          continue;
        } else {
          sphere.position.set(
            Math.round(Math.random() * maxDistanceOutsideObj * plusOrMinus()),
            Math.round(Math.random() * (yMax - yMin) + yMin),
            Math.round(Math.random() * maxDistanceOutsideObj * plusOrMinus())
          );
        }
      }
    }

    // Update movement
    for (let i = 0; i < 3; ++i) {
      let axis = axisChoices[i];

      // If axis chosen is the random one
      if (axis == sphere.randomAxis) {
        sphere.position[axis] +=
          sphere.uniformDirection +
          Math.cos(sphere.counter / 4) *
            outsideObjMomentum * // go up and down [Math.sin() increase horizontal width]
            sphere.randomPosNeg;
      } else {
        // the rest move on the same direction

        sphere.position[axis] +=
          (sphere.uniformDirection + 0.5) *
          sphere.randomPosNeg *
          outsideObjMomentum;
      }
    }
  });
}
// ============= Outside Objects =============

// ============= Shoot =============

let allBullet = [];

function createBullet(controllerGesture) {
  let bullet = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 0.01, 0.01),
    new THREE.MeshBasicMaterial()
  );
  console.log(bullet);

  let controllerGestureWorldPos = new THREE.Vector3();
  controllerGesture.getWorldPosition(controllerGestureWorldPos);

  bullet.position.copy(controllerGestureWorldPos);

  let controllerGestureWorldQuaternion = new THREE.Quaternion();
  controllerGesture.getWorldQuaternion(controllerGestureWorldQuaternion);

  bullet.rotation.copy(controllerGesture.rotation);

  allBullet.push(bullet);
  scene.add(bullet);
}

// ============= Shoot =============

// ============= Run =============

// ===== Functions to call =====
createControllers();

//=====  Variables for running logic =====
let firstRun = true;
let frame = 0;
let currentAudFrequency = 0;
let prevAudFrequency = 0;

// ===== Misc Functions For Run =====
function initXR() {
  if (renderer.xr.isPresenting) {
    userProfile.add(camera);

    controllerGestures.forEach((gesture) => {
      userProfile.add(gesture);
    });
    controllerModels.forEach((model) => {
      userProfile.add(model);
    });
    scene.add(userProfile);

    firstRun = false;
  }
}

console.log("Ver 17");
renderer.setAnimationLoop(function () {
  if (firstRun) {
    initXR();
  }

  frame += 1;
  currentAudFrequency = analyser.getAverageFrequency();

  gltfModels["bookModel"].rotation.z += 0.01;
  gltfModels["bookModel"].rotation.y += 0.01;
  gltfModels["bookModel"].rotation.z += 0.01;

  if (currentAudFrequency > 80) {
    significantAudChance = true;
  } else if (currentAudFrequency > prevAudFrequency + 6) {
    significantAudChance = true;
  }

  if (chosenSong.isPlaying) {
    outsideObjMomentum = Math.floor(currentAudFrequency) * 0.005;
  } else {
    outsideObjMomentum = 0.02;
  }
  moveOutsideObj();

  controllerGestures.forEach((controllerGesture) => {
    if (controllerGesture.name == "right") {
      // left on right joystick
      if (controllerGesture.gamepad.axes[2] > 0) {
        userProfile.translateX(0.01);
      } else if (controllerGesture.gamepad.axes[2] < 0) {
        userProfile.translateX(-0.01);
      }

      // Up and down joystick
      if (controllerGesture.gamepad.axes[3] > 0) {
        userProfile.translateZ(0.01);
      } else if (controllerGesture.gamepad.axes[3] < 0) {
        userProfile.translateZ(-0.01);
      }

      // only right controller can be used to move things around
      gestureHandling(controllerGesture);
    } else if (controllerGesture.name == "left") {
      if (controllerGesture.gamepad.axes[3] > 0) {
        userProfile.position.y -= 0.01; // go down
      } else if (controllerGesture.gamepad.axes[3] < 0) {
        userProfile.position.y += 0.01; // go up
      }
    }
  });

  allBullet.forEach((bullet, index, object) => {
    let direction = new Vector3();
    bullet.getWorldDirection(direction);
    bullet.position.add(direction.multiplyScalar(-1));

    if (
      Math.abs(bullet.position.x) > 20 ||
      Math.abs(bullet.position.y) > 20 ||
      Math.abs(bullet.position.z) > 20
    ) {
      object.splice(index, 1);
    }
  });

  significantAudChance = false;
  prevAudFrequency = currentAudFrequency;

  renderer.render(scene, camera);
});
