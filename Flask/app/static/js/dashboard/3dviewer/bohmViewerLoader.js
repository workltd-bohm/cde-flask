import { Rhino3dmLoader } from '../../common/three/examples/jsm/loaders/3DMLoader.js';
import { GLTFLoader } from '../../common/three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../../common/three/examples/jsm/loaders/DRACOLoader.js';

export function bohmLoad(type, scene) {

    if(type == 'rhino')
    {

            //LOAD RHINO
            {
                const loader = new Rhino3dmLoader();
                loader.setLibraryPath( 'js/common/three/examples/jsm/libs/rhino3dm/' );


                     loader.load(
                    'js/common/three/examples/jsm/models/3dm/Rhino.3dm',
                    function ( object ) {

                        object.color = 0xff0000;
                        scene.add( object );
                        //console.log(object);

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

            }
    }
    else if(type == 'gltf')
    {
        const gltfLoader = new GLTFLoader();


            // Optional: Provide a DRACOLoader instance to decode compressed mesh data
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath( 'js/common/three/examples/js/libs/draco/' );
            gltfLoader.setDRACOLoader( dracoLoader );


             const url = 'js/common/three/examples/jsm/models/gltf/LittlestTokyo.glb';

             gltfLoader.load(url, (gltf) => {

                scene.add(gltf.scene);

                },
                    // called while loading is progressing
                function ( xhr ) {

                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

                },
                // called when loading has errors
                function ( error ) {

                    console.log( 'An error happened' );

                }

            );
    }

}

