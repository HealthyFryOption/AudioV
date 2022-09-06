/** @format */

import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { VRButton } from "./webxr/VRButton.js";
const GSAP = gsap;

// Core Imports

// Core Initializations

// Texture Loading
let textureLoader = new THREE.TextureLoader();
let textureResume1 = textureLoader.load("./img/resume-1.png");

// Texture Loading

const myRayCaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.0001,
  1000
);

// AUDIO

const listener = new THREE.AudioListener();
camera.add(listener);

// create a global audio source
const sound = new THREE.Audio(listener);

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load("./sounds/R&J.mp3", function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
});

let button = document.getElementById("play");
button.addEventListener("click", () => {
  sound.play();
});

// AUDIO

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.getElementById("renderCanvas"),
});
document.body.appendChild(VRButton.createButton(renderer));
renderer.xr.enabled = true;

// renderer.setClearColor("#e5e5e5");
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);

let orbit = new OrbitControls(camera, renderer.domElement);
orbit.maxDistance = 20;
orbit.maxZoom = 0.523599; // 30 degrees

let pLight1 = new THREE.PointLight(0xffffff, 1, 1000);
let pLight2 = new THREE.PointLight(0xffffff, 1.5, 1000);
pLight1.position.set(0, 0, 0);
pLight2.position.set(0, 0, 25);

scene.add(pLight1, pLight2);

// Geometries
let grid = new THREE.GridHelper(100, 10);
grid.frustrumCulled = false;
scene.add(grid);

// == ADD CUBES ==

// Geometries

// ==========================================================================================================================================
// ==========================================================================================================================================

// Core Initializations

// GSAP

function focusLookAt(obj) {
  obj.lookAt(camera.position);
}

function animateFocus(object) {
  let tl = new GSAP.timeline({});
  tl.to(object.scale, 1, {
    x: 1.1,
    ease: Expo.easeOut,
    delay: 0.3,
  });
  tl.call(focusLookAt, [object]);
}

function animateNotFocus(object) {
  let tl = new GSAP.timeline({});

  tl.to(object.scale, 2, { x: 1, ease: Expo.easeOut, delay: 0.3 });
}

// GSAP

// if window resizes
window.addEventListener("resize", () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;

  // update camera's matrix everytime an internal adjustment made
  camera.updateProjectionMatrix();
});

// == ADD NEEDED CUBES and VARIABLES ==
const distanceFromCamera = 3; // 3 units
const distanceFromCameraFocus = 1; // 3 units

let focusScrollY = 0;
const moveSpeed = 0.5; // units per second

let allCubes = new THREE.Group();
for (let i = 0; i < 15; ++i) {
  let cubeMesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({
      map: textureResume1,
    })
  );

  cubeMesh.inFocus = false;
  cubeMesh.targetCamera = new THREE.Vector3(0, 0, -distanceFromCamera);

  cubeMesh.position.y = 5;

  allCubes.add(cubeMesh);
}
// == ADD NEEDED CUBES ==

let infrontGroup = [];

infrontGroup.push(allCubes.children[0]);
infrontGroup.push(allCubes.children[1]);
infrontGroup.push(allCubes.children[2]);

let numberCount = 3;
window.addEventListener("dblclick", () => {
  let allCubesChildren = allCubes.children;

  console.log(numberCount);

  if (numberCount < allCubesChildren.length) {
    infrontGroup.length = 0;
    let prev_numberCount = numberCount;

    let numOfCubes = 3;

    for (let i = numberCount; i < prev_numberCount + numOfCubes; ++i) {
      if (i < allCubesChildren.length) {
        console.log("noran");

        infrontGroup.push(allCubesChildren[i]);
        ++numberCount;
      } else {
        break;
      }
    }

    console.log(infrontGroup);
  }
});

let objInFocus = [];
window.addEventListener("click", (event) => {
  if (!sound.isPlaying) {
    sound.play();
  }

  if (objInFocus.length) {
    orbit.enabled = true;

    objInFocus[0].inFocus = false;
    animateNotFocus(objInFocus[0]);

    objInFocus.length = 0;
    focusScrollY = 0;
  } else {
    mouse.x = (event.clientX / innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / innerHeight) * 2 + 1;

    myRayCaster.setFromCamera(mouse, camera);

    // elements are mesh objects
    let intersects = myRayCaster.intersectObjects(infrontGroup, true);

    if (intersects.length) {
      console.log("run intersect");
      orbit.enabled = false;

      objInFocus.push(intersects[0].object);
      intersects[0].object.inFocus = true;

      animateFocus(intersects[0].object);
    }
  }
});

window.addEventListener("wheel", (event) => {
  if (objInFocus.length) {
    orbit.enabled = false;

    // deltaY down is positive, up is negative
    let delta = event.deltaY;

    // scroll down
    if (delta > 0) {
      focusScrollY -= 0.2;
    } else {
      focusScrollY += 0.2;
    }
  }
});
// move cube in front of camera
// Event Listeners

// Camera adjustments
camera.position.z = 5;
// Camera adjustments

scene.add(allCubes);
renderer.setAnimationLoop(function () {
  // === Follow Camera ===
  for (let i = 0; i < 3; ++i) {
    let cubesCamera = infrontGroup[i];

    let target = cubesCamera.targetCamera;

    if (!cubesCamera.inFocus) {
      target.setY(0);
      target.setZ(-distanceFromCamera);

      if (i === 0) {
        target.setX(-2);
      } else if (i === 1) {
        target.setX(0);
      } else {
        target.setX(2);
      }

      cubesCamera.lookAt(camera.position);
    } else {
      target.setX(0);
      target.setY(0 + -focusScrollY);

      target.setZ(-distanceFromCameraFocus);
    }

    target.applyMatrix4(camera.matrixWorld);
    let distance = cubesCamera.position.distanceTo(target);

    if (distance > 0) {
      const amount = Math.min(moveSpeed, distance) / distance;
      cubesCamera.position.lerp(target, amount);
    }
  }
  // === Follow Camera ===

  renderer.render(scene, camera);
});
