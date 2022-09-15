/** @format */
import * as ThreeMeshUI from "three-mesh-ui";

const container = new ThreeMeshUI.Block({
  width: 1.2,
  height: 0.7,
  padding: 0.2,
  fontFamily: "./assets/Roboto-msdf.json",
  fontTexture: "./assets/Roboto-msdf.png",
});

//

const text = new ThreeMeshUI.Text({
  content: "Some text to be displayed",
});

container.add(text);

// scene is a THREE.Scene (see three.js)
scene.add(container);

// This is typically done in the render loop :
ThreeMeshUI.update();
