
import Back from './back-component.js';
import Wall from './wall-component.js';

const PLANE_LENGTH = 1000;
const PLANE_WIDTH = 50;
const PADDING = PLANE_WIDTH / 5 * 2;
const COURSE_OBJECT_COUNT = 5;

class Path {
  constructor(hero, turn) {
    this.courseObjects = [];
    this.walls = [];
    this.hero = hero
    this.group = new THREE.Group();
    this.turn = turn;
    this.paused = false;
  }

  _initWalls() {
    let self = this;

    self.wallSpawnIntervalID = window.setInterval( function () {
    
        const geometry = new THREE.BoxGeometry(20, 20, 2, 2);
        
        let objectMaterial = new THREE.MeshPhongMaterial( {
          color: 0xffa500,
          flatShading: THREE.FlatShading
        });

        let plusOrMinus = Math.random() < 0.5 ? -1 : 1;

        let rotation = 2 * plusOrMinus;

        let wall = new Wall(geometry, objectMaterial, rotation);
        self.walls.push( wall );

        self.group.add( wall.mesh );

    }, 1000 );
  }

  _initBacks() {
    let self = this;

    this.courseObjectSpawnIntervalID = window.setInterval( function () {

      if ( self.courseObjects.length < COURSE_OBJECT_COUNT ) {
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

        let courseObject = new Back(geometry, objectMaterial);
        self.courseObjects.push( courseObject );
        self.group.add( courseObject.mesh );
      }

    }, 4000 );
  }

  init() {
    this.courseObjects.forEach(obj => {
      this.group.remove(obj.mesh);
    });

    this.walls.forEach(obj => {
      this.group.remove(obj.mesh);
    });

    this.courseObjects = [];
    this.walls = [];

    this._initWalls();
    this._initBacks();
  }

  initPlane() {
    /* TRACK */
    let planeGeometry = new THREE.BoxGeometry( PLANE_WIDTH, PLANE_LENGTH + PLANE_LENGTH / 10, 1 );
    let planeMaterial = new THREE.MeshLambertMaterial( {
      color: 0x000000
    } );
    this.plane = new THREE.Mesh( planeGeometry, planeMaterial );
    this.plane.rotation.x = -1.570;
    this.plane.receiveShadow = true;

    this.group.add(this.plane);
  }

  detectWall() {
    let walls = this.walls.map(obj => obj.mesh);
    let rayWall = new THREE.Raycaster( this.hero.mesh.position, new THREE.Vector3(0, 0, -1));
    let wallIntersections = rayWall.intersectObjects( walls );

    if (
      wallIntersections.length > 0 &&
      wallIntersections[0].distance < 2
    ) {
      if (this.hero.spinning) {
        this.turn();
        return false;
      } else {
        return true;
      }
    }
  }

  detectCollisions() {

    let courseObjects = this.courseObjects.map(obj => obj.mesh);
    let rayJump = new THREE.Raycaster( this.hero.mesh.position, new THREE.Vector3(0, -1, 0) );
    let rayCollision = new THREE.Raycaster( this.hero.mesh.position, new THREE.Vector3(0, 0, -1));

    let intersections = rayJump.intersectObjects( courseObjects );
    let collisionIntersections = rayCollision.intersectObjects( courseObjects );


    if ( intersections.length > 0 && intersections[0].distance < 2) {
      this.hero.jump();
      return false;
    }

    if ( collisionIntersections.length > 0 && collisionIntersections[0].distance < 5) {
      return true;
    }

    return false;
  }

  pauseGame() {
    this.paused = true;
    clearInterval(this.wallSpawnIntervalID);
    clearInterval(this.courseObjectSpawnIntervalID);
  }

  update() {
    let self = this;

    if (!self.paused) {
      self.courseObjects.forEach( function ( element, index ) {
        self.courseObjects[ index ].animate();
      });

      self.walls.forEach( function ( element, index ) {
        self.walls[ index ].animate();
      });
    }
  }
}

export default Path;
