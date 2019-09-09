
const PLANE_LENGTH = 1000;
const PLANE_WIDTH = 50;
const PADDING = PLANE_WIDTH / 5 * 2;
const COURSE_OBJECT_COUNT = 5;

class Wall {
  constructor(geometry, material, rotation) {
    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.position.set( 0, 10, -( PLANE_LENGTH - PADDING ) / 7);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.rotation.y = rotation;
  }
}

export default Wall;
