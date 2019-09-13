function CustomSinCurve( scale ) {

    THREE.Curve.call( this );

    this.scale = ( scale === undefined ) ? 1 : scale;

}

CustomSinCurve.prototype = Object.create( THREE.Curve.prototype );
CustomSinCurve.prototype.constructor = CustomSinCurve;

CustomSinCurve.prototype.getPoint = function ( t ) {

    var tx = t * 2 - 1;
    var ty = Math.sin( 8 * Math.PI * t );
    var tz = 0;

    return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );

}

class Ribs extends THREE.Group {
  constructor() {
    super()

    this.path = new CustomSinCurve(10)
    this.geometry = new THREE.TubeGeometry(this.path, 20, 2, 8, false)
    this.material = new THREE.MeshStandardMaterial({ color: 0xe3dac9 })

    this.mesh = new THREE.Mesh( this.geometry, this.material )

    this.geometry2 = new THREE.BoxGeometry(25, 10, 10)
    this.material2 = new THREE.MeshStandardMaterial({ color: 0x8b0000 })

    this.mesh2 = new THREE.Mesh( this.geometry2, this.material2 )
    this.mesh2.position.set( 0, -1, 10)


    this.light = new THREE.SpotLight( 0xffffff, 1.3, 300, .07 )
    this.light.position.set( 0, 50, 200)
    this.light.target = this.mesh2

    this.position.set(0, 50, -400)

    this.add(this.mesh, this.mesh2, this.light)
  }
}

export default Ribs
