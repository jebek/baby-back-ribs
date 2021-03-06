
const PLANE_LENGTH = 1000;
const LEFT_SPIN_VALUE = -0.4;
const RIGHT_SPIN_VALUE = 0.4;

class Hero {
  constructor(geometry, material) {
    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.castShadow = true;
    this.mesh.position.set( 0, 5, -25 );
    this.mesh.rotation.x = 0.485;
    this.gravity=0.01;
    this.bounceValue = 0;
    this.spinValue = 0;
    this.spinDirection = 'left';
    this.spinning = false;
    this.spinAvailable = true;
    this.turn = false;
    this.heroBaseY=1.8;
    this.heroBaseX=0;
    this.score = 0;
  }

  spin(direction) {
    if (!this.spinAvailable) {
      return;
    }

    this.spinAvailable = false;
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

  changeDirection(direction, posDelta) {
    let self = this;
    this.turn = true;
    this.turnDirection = direction;
    this.posDelta = posDelta;
    this.heroBaseX += posDelta.x;
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

    if (this.turn) {
      if (this.mesh.position.x === this.heroBaseX) {
        this.turn = false;
      } else {
        this.heroBaseY += this.posDelta.y/10;
        this.mesh.position.x += this.posDelta.x/10;
        // this.mesh.position.y += this.posDelta.y/10;
        return;
      }
    }

    if (this.mesh.position.y<=this.heroBaseY) {

      if (this.jumping) {
        this.jumping = false;
      } else {
        this.bounceValue = 0;
        this.spinning = false;
      }
    } else {
      this.bounceValue-=this.gravity;
    }

    this.mesh.position.y = Math.max(this.mesh.position.y + this.bounceValue, this.heroBaseY);
    this.mesh.rotation.y = this.mesh.rotation.y + this.spinValue;

  }
}

export default Hero;
