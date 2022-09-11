/** @format */

function animate() {
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
  requestAnimationFrame(animate);
}

// if (firstRun) {
//   if (renderer.xr.isPresenting) {
//     userProfile.add(camera);
//     scene.add(userProfile);

//     controllerGestures.forEach((gesture) => {
//       userProfile.add(gesture);
//     });
//     controllerModels.forEach((model) => {
//       userProfile.add(model);
//     });
//     firstRun = false;
//   }
// }
