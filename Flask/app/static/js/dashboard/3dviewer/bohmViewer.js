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



    /*---CAMERA---
    */
    var camera = setCamera('perspective', THREE);
    /*aspect = window.innerWidth/window.innerHeight;// 2;  // the canvas default
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.y = -50;
    //camera.up = new THREE.Vector3(1, 0, 0);
    camera.lookAt(0, 0, 0);*/


    /*---SCENE---
    A Scene in three.js is the root of a form of scene graph. Anything you want three.js to draw needs to be added to the scene.*/
    scene = new THREE.Scene();

    /*---GEOMETRY---*/
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    /*---MATERIAL---
    The MeshBasicMaterial is not affected by lights.
    Let's change it to a MeshPhongMaterial which is affected by lights.
    */
    //const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
    const material = new THREE.MeshPhongMaterial({color: 0x44aa88});  // greenish blue


    //Take care of the resize of the window
    /*window.addEventListener('resize', ()=>{
        renderer.setSize(window.innerWidth,window.innerHeight); //update thes ize of the renderer
        camera.aspect = window.innerWidth/window.innerHeight; //update the aspect ratio of the camera
        camera.updateProjectionMatrix();
    })*/

    /*---LIGHT---*/
      const color = 0xFFFFFF;
      const intensity = 1;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(-1, -2, 4);
      scene.add(light);

      const light2 = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 2 );
      scene.add( light2 );


      const directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
      directionalLight.position.set(1,1,1);
      scene.add( directionalLight );

      const directionalLight2 = new THREE.DirectionalLight( 0xffffff, 1 );
      directionalLight2.position.set(-1,1,-1);
      scene.add( directionalLight2 );


    /*---RENDER---*/
    //renderer.render(scene, camera);

    /*---ANIMATE---
    requestAnimationFrame is a request to the browser that you want to animate something. You pass it a function to be
    called. In our case that function is render. The browser will call your function and if you update anything related
    to the display of the page the browser will re-render the page. In our case we are calling three's renderer.render
    function which will draw our scene.

    requestAnimationFrame passes the time since the page loaded to our function. That time is passed in milliseconds.
    I find it's much easier to work with seconds so here we're converting that to seconds.*/

    bohmLoad('gltf', scene);



    /*function loadModel( rhinoDoc) {

        console.log( rhinoDoc );

    }*/

    const controls = new OrbitControls( camera, renderer.domElement );
    //controls.maxPolarAngle = 8.16;
    controls.update();
    //controls.enabled=false;





    function render(time) {
          time *= 0.001;  // convert time to seconds
          //camera.rotation.z += 0.01;

          /*RESPONSIVE DESIGN - resizing the window*/

            if (resizeRendererToDisplaySize(renderer)) {
                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
              }

          //cube.rotation.x = time;
          //cube.rotation.y = time;

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