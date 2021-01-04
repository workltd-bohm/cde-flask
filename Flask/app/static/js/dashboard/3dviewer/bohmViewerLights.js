//import * as THREE from '../../common/three/build/three.module.js';

export function setLights(scene, THREE) {

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

}