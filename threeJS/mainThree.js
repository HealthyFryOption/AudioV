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
let button = document.getElementById("play");
button.addEventListener("click", () => {
  sound.play();
});

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

// ===== GLTFs =====

// ----- Book Model -----
gltfModels["bookModel"] = (await modelLoader("./models/scene.gltf")).scene;

let scaleValue = 0.05;
gltfModels["bookModel"].scale.set(scaleValue, scaleValue, scaleValue);
gltfModels["bookModel"].receiveShadow = true;
gltfModels["bookModel"].position.set(0, 3, 0);
gltfModels["bookModel"].rotation.x = Math.PI / 2;
gltfModels["bookModel"].rotation.z = 44;
gltfModels["bookModel"].rotation.y = 50;

scene.add(gltfModels["bookModel"]);
// ----- Book Model -----

// ===== GLTFs =====

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

const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

// Create the final object to add to the scene
const splineObject = new THREE.Line(geometry, material);

scene.add(splineObject);

// ============= Scene Objects & Manipulations =============

// Camera adjustments
camera.position.y = 1.6;
// Camera adjustments

let camPositionZ = 0;
console.log("6");

// Controllers
let controllerModelFactory = new XRControllerModelFactory();

const controllerGrip1 = renderer.xr.getControllerGrip(0);
const model1 = controllerModelFactory.createControllerModel(controllerGrip1);

controllerGrip1.add(model1);
console.log(controllerGrip1);

scene.add(controllerGrip1);

const controllerGrip2 = renderer.xr.getControllerGrip(1);
const model2 = controllerModelFactory.createControllerModel(controllerGrip2);

controllerGrip2.add(model2);
console.log(controllerGrip2);

scene.add(controllerGrip2);

renderer.setAnimationLoop(function () {
  gltfModels["bookModel"].rotation.z += 0.01;
  gltfModels["bookModel"].rotation.y += 0.01;
  gltfModels["bookModel"].rotation.z += 0.01;

  // user.position.setZ(Math.sin(camPositionZ) * 5);
  // camPositionZ += 0.003;

  renderer.render(scene, camera);
});
