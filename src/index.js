import _ from 'lodash';
import './styles/style.sass';

import Hero from './components/hero-component.js';
import Path from './components/path-component.js';
import Ribs from './components/ribs-component.js';
import Background from './components/background-component.js';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

const gui = new dat.GUI();


const PLANE_LENGTH = 1000;
const PLANE_WIDTH = 50;
const PADDING = PLANE_WIDTH / 5 * 2;
const COURSE_OBJECT_COUNT = 5;

let heroBaseY=1.8;
let renderer,
  hero,
  heroContainer,
  goal,
  scene,
  camera,
  canvasWidth,
  canvasHeight,
  hiScore,
  ribs,
  path,
  paths = [];

let turn = () => {
  pauseGame();

  let posX = paths[0].direction === 'left' ? -20 : 20;

  let position = {
    x: paths[0].group.position.x + posX,
    y: paths[0].group.position.y
  }

  let opts = {
    pathLength: 1000,
    tacoDistance: -500,
    burgerDistances: [-6, 3, 4, 5, 6, 7],
    planeDistances: []
  }

  path = new Path(heroContainer, hero, position, turn, opts);
  path.initPlane();
  path.init();
  paths.push(path);

  /* SCENE */
  scene.add( paths[1].group );

  let posDelta = {
    x: position.x - paths[0].group.position.x,
    y: position.y - paths[0].group.position.y
  };

  hero.changeDirection(paths[0].direction, posDelta);

  setTimeout(() => {
    scene.remove(paths[0].group);
    paths.shift();

    paths[0].playGame();
  }, 300);
};

let setScore = () => {
  hiScore = window.localStorage.getItem('iwmbbr');
  document.querySelector('#score').innerHTML = 0;
  document.querySelector('#hi-score').innerHTML = hiScore ? hiScore : 0;
  hero.score = 0;
};  

let initHero = () => {

  let heroGeometry = new THREE.OctahedronGeometry( 1.5 );
  heroGeometry.scale(0.7, 1, 0.7);
  let heroMaterial = new THREE.MeshLambertMaterial( {
  color: 0xE91E63,
  flatShading: THREE.FlatShading
  } );

  hero = new Hero( heroGeometry, heroMaterial );

  goal = new THREE.Object3D;

  goal.position.set(0, 2, -2);
  hero.mesh.add( goal );
  heroContainer = new THREE.Object3D;
  heroContainer.add(hero.mesh);

  scene.add( heroContainer );
  
  window.addEventListener( 'keydown', () => {

    if ( event.keyCode === 37 ) {
      hero.spin('left');
    } else if ( event.keyCode === 39 ) {
      hero.spin('right');
    }

    if (hero.mesh.position.y > hero.heroBaseY) {
      return;
    }

    if ( event.keyCode === 38 ) {
      hero.jump();
    }
  } );
}

let initBackground = () => {

  let background = new Background();
  ribs = new Ribs();

  scene.add(background, ribs);
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
  camera.position.set( 0, 10, 0 );

  /* LIGHTS */
  let directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.set( -1, 1, 0 );
  let hemisphereLight = new THREE.HemisphereLight( 0xFFB74D, 0x37474F, 1 );
  hemisphereLight.position.y = 500;

  // let spotLight = new THREE.SpotLight( 0xffffff )
  // spotLight.position.set( 0, 50, -400)

  /* HERO */
  initHero();

  setScore();

  initBackground();

  camera.lookAt( hero.mesh.position );
  let position = {
    x: 0,
    y: 0,
    z: 0
  }

  let opts = {
    pathLength: 1000,
    tacoDistance: -500,
    burgerDistances: [ -3, -4, -5, -6, -7, -8, -9, -10],
    planeDistances: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  }

  path = new Path(heroContainer, hero, position, turn, opts);

  path.initPlane();
  paths.push(path);

  /* SCENE */
  scene.add( camera, directionalLight, hemisphereLight, paths[0].group );

  render();

  let $start = document.querySelector('#start');
  let $restart = document.querySelector('#restart');

  $start.onclick = () => {
    runGame();
    $start.classList.add('hidden');
  };

  $restart.onclick = () => {

    scene.remove(paths[0].group);
    paths.shift();

    let position = {
      x: hero.mesh.position.x,
      y: 0,
      z: 0
    }

    path = new Path(heroContainer, hero, position, turn, opts);

    path.initPlane();
    paths.push(path);

    /* SCENE */
    scene.add( path.group );

    runGame();
    $restart.classList.add('hidden');
  };

  window.addEventListener( 'resize', onWindowResize );
  onWindowResize();

  document.body.appendChild( THREE.WEBVR.createButton( renderer ) );
  renderer.vr.enabled = true;
}

let gameOver = () => {
  let $restart = document.querySelector('#restart');
  hiScore = hero.score > hiScore ? hero.score : hiScore;
  window.localStorage.setItem('iwmbbr', hiScore);
  paths[0].pauseGame();

  $restart.classList.remove('hidden');
}

let update = () => {

  let isCollided;
  
  hero.update();

  paths.forEach(path => {
    if (!path.paused) {
      if ( path.group.position.z < PLANE_LENGTH ) {
        path.group.position.z += 2;

        isCollided = path.detectCollisions();
      }
    }

  });

  if ( isCollided ) {
    gameOver();
  }


  if (hero.turn) {
    camera.position.y = hero.mesh.position.y + 3;
    camera.position.z = hero.mesh.position.z + 40;
  } else {
    camera.position.y = 10;
  }

    camera.position.x = hero.mesh.position.x;
}

let render = () => {
  renderer.setAnimationLoop(() => {
    renderer.render( scene, camera );
    update();
  });
}

let onWindowResize = () => {

  canvasHeight = window.innerHeight;
  canvasWidth = window.innerWidth;
  renderer.setSize(canvasWidth, canvasHeight);
  camera.aspect = canvasWidth/canvasHeight;
  camera.updateProjectionMatrix();
}

let pauseGame = () => {
  paths[0].pauseGame();
}

let runGame = () => {
  hero.spinning = false;
  hero.jumping = false;
  hero.spinValue = 0;
  paths[0].init();
  paths[0].playGame();
  setScore();

  update();
  hero.mesh.rotation.z = 0;
}

initGame();