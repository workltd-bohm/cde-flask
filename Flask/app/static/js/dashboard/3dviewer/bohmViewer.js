import * as THREE from 'https://unpkg.com/three@latest/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@latest/examples/jsm/controls/OrbitControls.js';
import { Rhino3dmLoader } from 'https://unpkg.com/three@latest/examples/jsm/loaders/3DMLoader.js';

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
    aspect = window.innerWidth/window.innerHeight;// 2;  // the canvas default
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.z = 5;

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

    /*---MESH---
    A combination of Geometry and Material*/
    const cube = new THREE.Mesh(geometry, material);

    //Adding the mesh to the scene
    scene.add(cube);

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
      light.position.set(-1, 2, 4);
      scene.add(light);

    /*---RENDER---*/
    //renderer.render(scene, camera);

    /*---ANIMATE---
    requestAnimationFrame is a request to the browser that you want to animate something. You pass it a function to be
    called. In our case that function is render. The browser will call your function and if you update anything related
    to the display of the page the browser will re-render the page. In our case we are calling three's renderer.render
    function which will draw our scene.

    requestAnimationFrame passes the time since the page loaded to our function. That time is passed in milliseconds.
    I find it's much easier to work with seconds so here we're converting that to seconds.*/

    //LOAD RHINO
    {
        var loader = new Rhino3dmLoader();
        loader.setLibraryPath( '/static/libs/' );

             loader.load(
            // resource URL
            '/static/model/cube.3dm',
            // called when the resource is loaded
            function ( object ) {

                object.color = 0xff0000;
                scene.add( object );
                console.log(object);

            },
            // called as loading progresses
            function ( xhr ) {

                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

            },
            // called when loading has errors
            function ( error ) {

                console.log( 'An error happened' );

            }
        );

        /*loader.load( './static/model/cube.3dm', loadModel);*/
        /*loader.load( './static/model/the.3dm', ( object ) => {

                        scene.add( object );
                        //initGUI( object.userData.layers );

                    } );*/
    }

    /*function loadModel( rhinoDoc) {

        console.log( rhinoDoc );

    }*/

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

          //cube.rotation.x = time;
          //cube.rotation.y = time;



          renderer.render(scene, camera);

          requestAnimationFrame(render); //RECURSIVE
    }

    requestAnimationFrame(render); //INITIATE THE LOOP

}

/*
Let's write a function that checks if the renderer's canvas is not already the size
it is being displayed as and if so set its size.
*/
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const needResize = canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight;
  if (needResize) {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); //It's important to pass false at the end.
  }
  return needResize;
}




init();