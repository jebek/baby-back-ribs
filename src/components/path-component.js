
import Back from './back-component.js';
import Wall from './wall-component.js';

class Path {
  constructor(heroContainer, hero, position, turn, opts) {
    this.heroContainer = heroContainer;
    this.hero = hero;
    this.pathLength = opts.pathLength;
    this.group = new THREE.Group();
    this.group.position.x = position ? position.x : 0;
    this.group.position.y = position ? position.y : 0;
    this.group.position.z = -this.pathLength/2;

    this.turn = turn;
    this.tacoDistance = opts.tacoDistance;
    this.burgerDistances = opts.burgerDistances;
    this.planeDistances = opts.planeDistances;
    this.paused = false;
    this.pathSegmentsLength = 1;
  }

  _createWall(distance) {
    const geometry = new THREE.BoxGeometry(20, 20, 2, 2);
    
    let objectMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffa500,
      flatShading: THREE.FlatShading
    });

    this.plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    this.direction = this.plusOrMinus > 0 ? 'left' : 'right';

    let rotation = 2 * this.plusOrMinus;

    let courseObject = new Wall(geometry, objectMaterial, rotation, distance);

    this.group.add( courseObject.mesh );
  }

  _createBack(distance) {
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

    let courseObject = new Back(geometry, objectMaterial, distance * 50);
    this.group.add( courseObject.mesh );
  }

  _createPlane(distance) {
    let planeGeometry = new THREE.BoxGeometry( 10, 50, 1 );
    let planeMaterial = new THREE.MeshLambertMaterial( {
      color: 0x440c65
    } );

    let plane = new THREE.Mesh( planeGeometry, planeMaterial );

    plane.position.z = distance * 50;
    plane.rotation.x = -1.570;
    plane.receiveShadow = true;

    this.group.add( plane );
  }

  init() {
    if (this.planeDistances.length !== 0) {
      this.group.remove(this.plane);

      this.planeDistances.forEach(distance => {
        this._createPlane(distance);
      });

      this.pathSegmentsLength = this.planeDistances.length;
    }

    this._createWall(this.tacoDistance);

    this.burgerDistances.forEach(distance => {
      this._createBack(distance);
    });
  }

  initPlane() {
    /* TRACK */
    let planeGeometry = new THREE.BoxGeometry( 10, 1000, 1 );
    let planeMaterial = new THREE.MeshLambertMaterial( {
      color: 0x440c65
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

  addScore(pts) {
    document.querySelector('#score').innerHTML = this.hero.score += pts;
  }

  detectCollisions() {
    let rayJump = new THREE.Raycaster( this.hero.mesh.position, new THREE.Vector3(0, -1, 0) );
    let rayCollision = new THREE.Raycaster( this.hero.mesh.position, new THREE.Vector3(0, 0, -1));

    let courseObjects = this.group.children.slice(this.pathSegmentsLength);
    let intersections = rayJump.intersectObjects( courseObjects );
    let collisionIntersections = rayCollision.intersectObjects( courseObjects );

    let path = this.group.children.slice(0, this.pathSegmentsLength);
    let pathIntersections = rayJump.intersectObjects( path );

    if ( pathIntersections.length > 0 && pathIntersections[0].distance < 2 ) {
      this.hero.spinAvailable = true;
      this.heroContainer.position.y = pathIntersections[0].point.y + 0.1;
    } else if (this.hero.mesh.position.y <= 1.8) {
      this.heroContainer.position.y -= 0.5;
    }


    if ( intersections.length > 0 && intersections[0].distance < 2) {
      this.hero.jump();
      this.hero.spinAvailable = true;
      this.addScore(5);
      return false;
    }

    if ( collisionIntersections.length > 0 && collisionIntersections[0].distance < 3.5) {
      let isWall = collisionIntersections[0].object.geometry.type === "BoxGeometry";

      if (isWall) {
        if (this.hero.spinning && this.direction === this.hero.spinDirection) {
          this.turn();

          this.addScore(10);
          this.hero.spinAvailable = true;
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
