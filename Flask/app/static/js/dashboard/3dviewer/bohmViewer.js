//import * as THREE from 'https://unpkg.com/three@latest/build/three.module.js';
//import { OrbitControls } from 'https://unpkg.com/three@latest/examples/jsm/controls/OrbitControls.js';
//import { Rhino3dmLoader } from 'https://unpkg.com/three@latest/examples/jsm/loaders/3DMLoader.js';

import * as THREE from '../../common/three/build/three.module.js';
import { OrbitControls } from '../../common/three/examples/jsm/controls/OrbitControls.js';
//import { TrackballControls } from '../../common/three/examples/jsm/controls/TrackballControls.js';
//import { Rhino3dmLoader } from '../../common/three/examples/jsm/loaders/3DMLoader.js';
import { GLTFLoader } from '../../common/three/examples/jsm/loaders/GLTFLoader.js';
import {bohmLoad} from './bohmViewerLoader.js';
import {setCamera} from './bohmViewerCamera.js';
import {setLights} from './bohmViewerLights.js';

let renderer, aspect, scene, camera, controls, sceneBox;

// For hover / selection
let raycaster, mouse, selection, hover;

function init() {


    /*---CANVAS---
    We want our function to draw into the canvas, so we have to look it up
    If you don't pass a canvas into three.js it will create one for you but then you have to add it to your document.
    Where to add it may change depending on your use case and you'll have to change your code so I find that passing a
    canvas to three.js feels a little more flexible.*/
        const canvas = document.querySelector('#c');
        const renderer = new THREE.WebGL1Renderer({canvas});

    /*---CAMERA---*/
    var camera = setCamera('perspective', THREE);

    /*---SCENE---
    A Scene in three.js is the root of a form of scene graph. Anything you want three.js to draw needs to be added to the scene.*/
    scene = new THREE.Scene();

    /*---GEOMETRY---*/
    bohmLoad('gltf', scene);

    /*---MATERIAL---*/
    const material = new THREE.MeshPhongMaterial({color: 0x44aa88});  // greenish blue

    /*---LIGHT---*/
    setLights(scene, THREE);

    /*---CONTROLS---*/
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.update();


    function render(time) {
          time *= 0.001;  // convert time to seconds


          /*RESPONSIVE DESIGN - resizing the window*/

            if (resizeRendererToDisplaySize(renderer)) {
                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
              }

        controls.update();

          renderer.render(scene, camera);

          requestAnimationFrame(render); //RECURSIVE
    }

    requestAnimationFrame(render); //INITIATE THE LOOP

}

/*
Let's write a function that checks if the renderer's canvas is not already the size
it is being displayed as and if so set its size.
*/
function resizeRendererToDisplaySize(renderer, controls) {
  const canvas = renderer.domElement;
  const needResize = canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight;
  if (needResize) {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); //It's important to pass false at the end.
  }

  return needResize;
}




init();