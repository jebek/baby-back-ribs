
class Back extends THREE.Group {
  constructor(geometry, material, distance) {
    super()

    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    let lettuceGeometry = new THREE.CylinderGeometry(2.1, 2.1, 0.2, 32);
    let lettuceMaterial = new THREE.MeshBasicMaterial( {
      color: 0x85DB46
    });
    let lettuceMesh = new THREE.Mesh(lettuceGeometry, lettuceMaterial);
    lettuceMesh.position.y = 0.1;

    let tomatoGeometry = new THREE.CylinderGeometry(2.1, 2.1, 0.2, 32);
    let tomatoMaterial = new THREE.MeshBasicMaterial( {
      color: 0xEB4039
    });
    let tomatoMesh = new THREE.Mesh(tomatoGeometry, tomatoMaterial);
    tomatoMesh.position.y = -0.1;

    let meatGeometry = new THREE.CylinderGeometry(2.1, 2.1, 0.2, 32);
    let meatMaterial = new THREE.MeshBasicMaterial( {
      color: 0xBC683A
    });
    let meatMesh = new THREE.Mesh(meatGeometry, meatMaterial);
    meatMesh.position.y = -0.3;

    this.position.set( 0, 0.5, distance);

    this.add(this.mesh, lettuceMesh, tomatoMesh, meatMesh);
  }
}

export default Back;
