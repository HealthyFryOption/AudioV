/** @format */

// ============= Initialization =============

// ----- Core Imports -----
import * as THREE from "three";
import { OrbitControls } from "OrbitControls";

import { XRControllerModelFactory } from "./webxr/XRControllerModelFactory.js";
import { VRButton } from "./webxr/VRButton.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.138.3/examples/jsm/loaders/GLTFLoader.js";
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
orbit.maxDistance = 20;
orbit.maxZoom = 0.523599; // 30 degrees
// ----- Orbit Set -----

// ------
let user = new THREE.Group();
user.position.set(0, 0, 0);
user.add(camera);
scene.add(user);
// ------

// ----- Audio Set -----
const listener = new THREE.AudioListener();
camera.add(listener);
// create a global audio source
const sound = new THREE.Audio(listener);
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

// ----- Audio Events -----

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load("./sounds/R&J.mp3", function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
});
// ----- Audio Events -----

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

let pLight1 = new THREE.PointLight(0xffffff, 3, 1000);
let pLight2 = new THREE.PointLight(0xffffff, 1.5, 1000);
pLight1.position.set(0, 0, 0);
pLight2.position.set(0, 0, 25);

scene.add(pLight1, pLight2);

// Grid
let grid = new THREE.GridHelper(100, 100, "#168270", "#2c1682");
grid.frustrumCulled = false;
scene.add(grid);

// Create a sine-like wave
const curve = new THREE.SplineCurve([
  new THREE.Vector2(-20, 0),
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

// ============= Scene Objects & Manipulations =============

// Camera adjustments
camera.position.y = 1.6;
// Camera adjustments
let camPositionZ = 0;

// ============= Controllers =============
let controllerGestures = [];
let controllerReach = 2;

function onSelectStart() {
  console.log("selected start");
  // sound.play();
  this.children[0].scale.z = controllerReach;
  this.userData.selectPressed = true;
}

function onSelectEnd() {
  console.log("selected stop");
  this.children[0].scale.z = 0;
  this.userData.selectPressed = false;
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

    user.add(controlGesture);
    scene.add(controlGesture);
    controllerGestures.push(controlGesture);

    let controllerGrip = renderer.xr.getControllerGrip(i);
    controllerGrip.add(
      controllerModelFactory.createControllerModel(controllerGrip)
    );
    user.add(controllerGrip);
    scene.add(controllerGrip);
  }

  controllerGestures.forEach((controllerGesture) => {
    controllerGesture.addEventListener("selectstart", onSelectStart);
    controllerGesture.addEventListener("selectend", onSelectEnd);
  });
}

// ============= Controllers =============

// ============= Interactable Objects =============
let interactableObjects = [];
let chosenInteractableObject = []; // 0 => Object | 1 => ObjectOriginalPosition

let cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
cube.position.set(0, 1.5, -5.8);
cube.isGLTF = false;
interactableObjects.push(cube);

// ===== GLTFs =====

// ----- Book Model -----
gltfModels["bookModel"] = (await modelLoader("./models/scene.gltf")).scene;

let scaleValue = 0.01;
gltfModels["bookModel"].scale.set(scaleValue, scaleValue, scaleValue);
gltfModels["bookModel"].receiveShadow = true;
gltfModels["bookModel"].position.set(0, 1, 0);
gltfModels["bookModel"].rotation.x = Math.PI / 2;
gltfModels["bookModel"].rotation.z = 44;
gltfModels["bookModel"].rotation.y = 50;
gltfModels["bookModel"].isGLTF = true;

interactableObjects.push(gltfModels["bookModel"]);
// ----- Book Model -----

// ===== GLTFs =====

// Add all interactable objects into scene
interactableObjects.forEach((obj) => {
  scene.add(obj);
});

// ============= Interactable Objects =============

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

          chosenInteractableObject.push(intersects[0].object);
          chosenInteractableObject.push(
            intersects[0].object.position.distanceTo(controllerGesture.position)
          );
          console.log(intersects[0].object);
        }
      }
    } else {
      // Move selected object so it's always the same distance from controller
      const moveVector = controllerGesture
        .getWorldDirection(new THREE.Vector3())
        .multiplyScalar(chosenInteractableObject[1])
        .negate();
      chosenInteractableObject[0].position.copy(
        controllerGesture.position.clone().add(moveVector)
      );
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

// ============= Run =============
createControllers();

console.log("Ver 7");
renderer.setAnimationLoop(function () {
  gltfModels["bookModel"].rotation.z += 0.01;
  gltfModels["bookModel"].rotation.y += 0.01;
  gltfModels["bookModel"].rotation.z += 0.01;

  controllerGestures.forEach((controllerGesture) => {
    gestureHandling(controllerGesture);
  });

  renderer.render(scene, camera);
});

// user.position.setZ(Math.sin(camPositionZ) * 5);
// camPositionZ += 0.003;
