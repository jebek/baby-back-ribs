
const PLANE_LENGTH = 1000;
const HERO_BASE_Y=1.8;
const LEFT_SPIN_VALUE = -0.4;
const RIGHT_SPIN_VALUE = 0.4;

class Hero {
  constructor(geometry, material) {
    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.castShadow = true;
    this.mesh.position.set( 0, 5, ( PLANE_LENGTH / 2 ) );
    this.mesh.rotation.x = 0.485;
    this.gravity=0.01;
    this.bounceValue = 0;
    this.spinValue = 0;
    this.spinDirection = 'left';
    this.spinning = false;
  }

  spin(direction) {

    if (this.spinning) {
      return;
    }

    this.spinDirection = direction;
    this.spinning = true;
    this.mesh.rotation.y += 0.4;


    this.jumping = true;
    this.bounceValue = 0.15;
  }

  jump() {
    this.jumping = true;
    this.bounceValue = 0.2;
  }

  update() {

    if (this.spinning) {
      if (Math.abs(this.mesh.rotation.y) > 10) {
        this.mesh.rotation.y = 0;
        this.spinValue = 0;
        this.spinning = false;
      } else {
        if (this.spinDirection === 'left') {
          this.spinValue = LEFT_SPIN_VALUE;
        } else {
          this.spinValue = RIGHT_SPIN_VALUE;
        }
      }
    }

    if (this.mesh.position.y<=HERO_BASE_Y) {
      if (this.jumping) {
        this.jumping = false;
      } else {
        this.bounceValue = 0;
        this.spinning = false;
      }
    } else {
      this.bounceValue-=this.gravity;
    }

    this.mesh.position.y = Math.max(this.mesh.position.y + this.bounceValue, HERO_BASE_Y);
    this.mesh.rotation.y = this.mesh.rotation.y + this.spinValue;

  }
}

export default Hero;
