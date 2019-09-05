import _ from 'lodash';
import './styles/style.sass';

// function component() {
//   const element = document.createElement('div');

//   element.innerHTML = _.join(['Hello', 'webpack'], ' ');

//   return element;
// }

// document.body.appendChild(component());

import Hero from './components/hero-component.js';
import Back from './components/back-component.js';

const PLANE_LENGTH = 1000;
const PLANE_WIDTH = 50;
const PADDING = PLANE_WIDTH / 5 * 2;
const COURSE_OBJECT_COUNT = 5;

let heroBaseY=1.8;
let renderer,
  hero,
  scene,
  camera,
  globalRenderID,
  canvasWidth,
  canvasHeight,
  courseObjectSpawnIntervalID,
  courseObject = {},   
  courseObjects = [];

let getRandomInteger = ( min, max ) => {
  return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

let initBacks = () => {
  courseObjectSpawnIntervalID = window.setInterval( function () {
  
  if ( courseObjects.length < COURSE_OBJECT_COUNT ) {
    const verticesOfCube = [
      -1, -1, -1,    1, -1, -1,    1,  1, -1,    -1,  1, -1,
      -1, -1,  1,    1, -1,  1,    1,  1,  1,    -1,  1,  1,
    ];
    const indicesOfFaces = [
      2, 1, 0,    0, 3, 2,
      0, 4, 7,    7, 3, 0,
      0, 1, 5,    5, 4, 0,
      1, 2, 6,    6, 5, 1,
      2, 3, 7,    7, 6, 2,
      4, 5, 6,    6, 7, 4,
    ];
    const radius = 2;
    const detail = 2;
    const geometry = new THREE.PolyhedronBufferGeometry(verticesOfCube, indicesOfFaces, radius, detail);
    
    let objectMaterial = new THREE.MeshPhongMaterial( {
    color: 0x29B6F6,
    flatShading: THREE.FlatShading
    });

    courseObject = new Back(geometry, objectMaterial);
    courseObjects.push( courseObject );
    scene.add( courseObject.mesh );
  }

  }, 4000 );
}

let detectCollisions = ( objects ) => {

  let courseObjects = objects.map(obj => obj.mesh);
  let rayJump = new THREE.Raycaster( hero.mesh.position, new THREE.Vector3(0, -1, 0) );
  let rayCollision = new THREE.Raycaster( hero.mesh.position, new THREE.Vector3(0, 0, -1));


  let intersections = rayJump.intersectObjects( courseObjects );
  let collisionIntersections = rayCollision.intersectObjects( courseObjects );

  if ( intersections.length > 0 && intersections[0].distance < 2) {
    hero.jump();
    return false;
  }

  if ( collisionIntersections.length > 0 && collisionIntersections[0].distance < 5) {
    return true;
  }

  return false;
}  

let initHero = () => {

  let heroGeometry = new THREE.OctahedronGeometry( 1.5 );
  let heroMaterial = new THREE.MeshLambertMaterial( {
  color: 0xE91E63,
  flatShading: THREE.FlatShading
  } );

  hero = new Hero( heroGeometry, heroMaterial );

  scene.add( hero.mesh );
  
  window.addEventListener( 'keydown', () => {

  if ( event.keyCode === 37 ) {
    hero.spin('left');
  } else if ( event.keyCode === 39 ) {
    hero.spin('right');
  }

  if (hero.mesh.position.y > heroBaseY) {
    return;
  }

  if ( event.keyCode === 38 ) {
    hero.jump();
  }
  } );
}

let initGame = () => {
  let canvas = document.querySelector('#game');

  THREE.ImageUtils.crossOrigin = '';

  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;

  renderer = new THREE.WebGLRenderer({canvas});
  renderer.setSize( canvasWidth, canvasHeight );
  renderer.antialias = true;
  renderer.setClearColor( 0xFFFFFF, 1 );
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;

  scene = new THREE.Scene();

  /* CAMERA */
  camera = new THREE.PerspectiveCamera( 45, canvasWidth / canvasHeight, 1, 3000 );
  camera.position.set( 0, PLANE_LENGTH / 125, PLANE_LENGTH / 2 + PLANE_LENGTH / 25 );


  /* TRACK */
  let planeGeometry = new THREE.BoxGeometry( PLANE_WIDTH, PLANE_LENGTH + PLANE_LENGTH / 10, 1 );
  let planeMaterial = new THREE.MeshLambertMaterial( {
  color: 0x000000
  } );
  let plane = new THREE.Mesh( planeGeometry, planeMaterial );
  plane.rotation.x = 1.770;
  plane.receiveShadow = true;


  /* LIGHTS */
  let directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.set( 0, 1, 0 );
  let hemisphereLight = new THREE.HemisphereLight( 0xFFB74D, 0x37474F, 1 );
  hemisphereLight.position.y = 500;

  /* BACKS */
  initBacks();

  /* HERO */
  initHero();

  /* SCENE */
  scene.add( camera, directionalLight, hemisphereLight, plane );
  window.scene = scene;

  render();

  let $start = document.querySelector('#start');
  let $restart = document.querySelector('#restart');

  $start.onclick = () => {
    runGame();
    $start.classList.add('hidden');
  };

  $restart.onclick = () => {
    courseObjects.forEach(obj => {
      scene.remove(obj.mesh);
    })

    courseObjects = [];

    runGame();
    $restart.classList.add('hidden');
  };
}

let gameOver = () => {
  let $restart = document.querySelector('#restart');

  $restart.classList.remove('hidden');
}

let update = () => {
  hero.update();

  courseObjects.forEach( function ( element, index ) {
  courseObjects[ index ].animate();
  });

  let isCollided = detectCollisions( courseObjects );

  if ( isCollided ) {
    cancelAnimationFrame(globalRenderID);
    gameOver();
  } else {
    globalRenderID = requestAnimationFrame(update);
    render();
  }
}

let render = () => {
  //globalRenderID = requestAnimationFrame( render );
  
  renderer.render( scene, camera );
}

let onWindowResize = () => {

  canvasHeight = window.innerHeight;
  canvasWidth = window.innerWidth;
  renderer.setSize(canvasWidth, canvasHeight);
  camera.aspect = canvasWidth/canvasHeight;
  camera.updateProjectionMatrix();
}

let runGame = () => {
  window.addEventListener( 'resize', onWindowResize );
  update();
  onWindowResize();
}

initGame();
//runGame();