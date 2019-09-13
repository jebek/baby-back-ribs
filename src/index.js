import './styles/style.sass';

import Hero from './components/hero-component.js';
import Path from './components/path-component.js';
import Ribs from './components/ribs-component.js';
import Background from './components/background-component.js';


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
  user,
  canvasWidth,
  canvasHeight,
  hiScore,
  ribs,
  path,
  bitmap,
  bitmap2,
  bitmap3,
  planeMaterial,
  planeMaterial2,
  planeMaterial3,
  updateScore,
  opts,
  g,
  g2,
  g3,
  paths = [],
  initial = true,
  gameRunning = false;


let turn = () => {
  pauseGame();

  let posX = paths[0].direction === 'left' ? -20 : 20;

  let position = {
    x: paths[0].group.position.x + posX,
    y: paths[0].group.position.y
  }

  opts = {
    pathLength: 1000,
    tacoDistance: -500,
    burgerDistances: [ 2, 0, -2, -5, -8],
    planeDistances: [-10, -9, -7, -5, -4, -2, -1, 0, 3, 4, 5, 6, 7, 8, 9, 10],
    setScore: updateScore
  }

  if (hero.score > 100) {
    opts = {
      pathLength: 1000,
      tacoDistance: -500,
      burgerDistances: [ 3, 1, 0, -2, -5, -8],
      planeDistances: [ -5,-4, -2, -1, 1, 2, 4, 5, 6, 7, 8, 9, 10],
      setScore: updateScore
    }
  } else if (hero.score > 150) {
    opts = {
      pathLength: 1000,
      tacoDistance: -500,
      burgerDistances: [ 3, 1, 0, -2, -3, -5, -8],
      planeDistances: [ -4, -1, 1, 2, 4, 5, 6, 7, 8, 9, 10],
      setScore: updateScore
    }
  } else if (hero.score > 250) {
    opts = {
      pathLength: 1000,
      tacoDistance: -500,
      burgerDistances: [ 3, 1, 0, -2, -5, -8],
      planeDistances: [ 4, 5, 6, 7, 8, 9, 10],
      setScore: updateScore
    }
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

let start = () => {

  g3.clearRect(0, 0, 512, 128);
  planeMaterial3.map.needsUpdate = true;

  if (initial) {
    runGame();
    initial = false;
  } else {
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
  }
}

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
    if (!gameRunning) {
      start();
      gameRunning = true;
    }

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

let initText = () => {
  let text = "Score: ";
  bitmap = document.createElement('canvas');
  g = bitmap.getContext('2d');
  bitmap.width = 512;
  bitmap.height = 128;
  bitmap.background = 'transparent';
  g.font = 'bold 48px helvetica';

  g.fillStyle = '#FFD300';
  g.fillText(text, 170, bitmap.height / 2);
  let texture = new THREE.Texture(bitmap) 
  texture.needsUpdate = true;

  let planeGeometry = new THREE.PlaneGeometry(60, 20, 1, 1);
  planeMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });
  let plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.z = -200;
  plane.position.y = 70;


  let hiScoreText = "High Score: ";
  bitmap2 = document.createElement('canvas');
  g2 = bitmap2.getContext('2d');
  bitmap2.width = 512;
  bitmap2.height = 128;
  bitmap2.background = 'transparent';
  g2.font = 'bold 48px helvetica';

  g2.fillStyle = '#FFD300';
  g2.fillText(hiScoreText, 50, bitmap2.height / 2);

  let texture2 = new THREE.Texture(bitmap2) 
  texture2.needsUpdate = true;

  let planeGeometry2 = new THREE.PlaneGeometry(60, 20, 1, 1);
  planeMaterial2 = new THREE.MeshBasicMaterial({
    map: texture2,
    transparent: true,
    depthTest: false
  });
  let plane2 = new THREE.Mesh(planeGeometry2, planeMaterial2);
  plane2.position.z = -200;
  plane2.position.y = 80;

  let startText = "Press any key to start";
  bitmap3 = document.createElement('canvas');
  g3 = bitmap3.getContext('2d');
  bitmap3.width = 512;
  bitmap3.height = 128;
  bitmap3.background = 'transparent';
  g3.font = 'bold 36px helvetica';

  g3.fillStyle = '#FFD300';
  g3.fillText(startText, 50, bitmap3.height / 2);

  let texture3 = new THREE.Texture(bitmap3) 
  texture3.needsUpdate = true;

  let planeGeometry3 = new THREE.PlaneGeometry(60, 20, 1, 1);
  planeMaterial3 = new THREE.MeshBasicMaterial({
    map: texture3,
    transparent: true,
    depthTest: false
  });
  let plane3 = new THREE.Mesh(planeGeometry3, planeMaterial3);
  plane3.position.z = -200;
  plane3.position.y = 50;


  scene.add(plane, plane2, plane3);
}

updateScore = (score) => {
  hiScore = window.localStorage.getItem('iwmbbr');

  let text = "Score: " + score;

  g.clearRect(0, 0, 512, 128);
  planeMaterial.opacity = 1;
  g.font = 'bold 48px helvetica';
  g.fillText(text, 170, 56);
  planeMaterial.map.needsUpdate = true;


  hiScore = score > hiScore ? score : hiScore;
  let hiScoreText = 'High Score: ' + hiScore;
  g2.clearRect(0, 0, 512, 128);
  planeMaterial2.opacity = 1;
  g2.font = 'bold 48px helvetica';
  g2.fillText(hiScoreText, 50, 64);
  planeMaterial2.map.needsUpdate = true;
}

opts = {
  pathLength: 1000,
  tacoDistance: -500,
  burgerDistances: [ 3, 0, -2, -5, -8],
  planeDistances: [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  setScore: updateScore
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


  initBackground();
  initText();

  updateScore(0);

  camera.lookAt( hero.mesh.position );
  let position = {
    x: 0,
    y: 0,
    z: 0
  }

  path = new Path(heroContainer, hero, position, turn, opts);

  path.initPlane();
  paths.push(path);

  user = new THREE.Group();
  user.add(camera);

  /* SCENE */
  scene.add( user, directionalLight, hemisphereLight, paths[0].group );

  render();

  window.addEventListener( 'resize', onWindowResize );
  onWindowResize();

  document.body.appendChild( THREE.WEBVR.createButton( renderer ) );
  renderer.vr.enabled = true;
}

let gameOver = () => {
  paths[0].pauseGame();
  hero.score = 0;

  setTimeout(()=> {
    g3.clearRect(0, 0, 512, 128);
    planeMaterial3.opacity = 1;
    g3.font = 'bold 36px helvetica';
    g3.fillText('Press any key to start', 50, 56);
    planeMaterial3.map.needsUpdate = true;
    gameRunning = false;
  }, 2000)
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

  if ( isCollided || heroContainer.position.y < -2) {
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
  updateScore(0);
  gameRunning = true;

  update();
  hero.mesh.rotation.z = 0;
}

initGame();