//import * as THREE from '../../common/three/build/three.module.js';

export function setCamera(type, THREE) {

    var aspect = window.innerWidth/window.innerHeight;// 2;  // the canvas default
    var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.z = 400;
    camera.position.x = 400;
    //camera.up = new THREE.Vector3(1, 0, 0);
    //camera.lookAt(0, 0, 0);
    return camera;
}