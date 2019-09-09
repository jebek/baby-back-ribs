
import Back from './back-component.js';
import Wall from './wall-component.js';

const PLANE_LENGTH = 1000;
const PLANE_WIDTH = 10;
const PADDING = PLANE_WIDTH / 5 * 2;

class Path {
  constructor(hero, position, turn) {
    this.hero = hero;
    this.group = new THREE.Group();
    this.group.position.x = position ? position.x : 0;
    this.group.position.y = position ? position.y : 0;
    this.group.position.z = 0;

    this.turn = turn;
    this.paused = false;
  }

  _createWall() {
    const geometry = new THREE.BoxGeometry(20, 20, 2, 2);
    
    let objectMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffa500,
      flatShading: THREE.FlatShading
    });

    this.plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    this.direction = this.plusOrMinus > 0 ? 'left' : 'right';

    let rotation = 2 * this.plusOrMinus;

    let courseObject = new Wall(geometry, objectMaterial, rotation);

    this.group.add( courseObject.mesh );
  }

  _createBack() {
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
    this.group.add( courseObject.mesh );
  }

  init() {

    this._createWall();
    this._createBack();
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

    let rayJump = new THREE.Raycaster( this.hero.mesh.position, new THREE.Vector3(0, -1, 0) );
    let rayCollision = new THREE.Raycaster( this.hero.mesh.position, new THREE.Vector3(0, 0, -1));

    let courseObjects = this.group.children.slice(1);
    let intersections = rayJump.intersectObjects( courseObjects );
    let collisionIntersections = rayCollision.intersectObjects( courseObjects );


    if ( intersections.length > 0 && intersections[0].distance < 2) {
      this.hero.jump();
      return false;
    }

    if ( collisionIntersections.length > 0 && collisionIntersections[0].distance < 5) {
      let isWall = collisionIntersections[0].object.geometry.type === "BoxGeometry";

      if (isWall) {
        if (this.hero.spinning && this.direction === this.hero.spinDirection) {
          this.turn();
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    }

    return false;
  }

  pauseGame() {
    this.paused = true;
  }

  playGame() {
    this.paused = false;
  }
}

export default Path;
