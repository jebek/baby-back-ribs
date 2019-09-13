
class Background extends THREE.Group {
  constructor () {
    super()
    const geometry = new THREE.SphereBufferGeometry(500, 32, 32)
    const material = new THREE.ShaderMaterial(
      {
        uniforms: {
          t: { type: 'c', value: new THREE.Color(0x293462) },
          b: { type: 'c', value: new THREE.Color(0x3a1f5d) }
        },
        vertexShader: `
          varying vec3 v;

          void main() {

            vec4 w = modelMatrix * vec4( position, 1.0 );
            v = w.xyz;
    
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

          }
        `,
        fragmentShader: `
          uniform vec3 t;
          uniform vec3 b;
          varying vec3 v;

          void main()
            {
              vec3 p = normalize(v.xyz);
              float f = sin(p.y * 2.0);

              gl_FragColor = vec4(mix(t,b, f ), 1.0);
            }
        `,
        side: THREE.BackSide
      }
    )


    this.sky = new THREE.Mesh(geometry, material)
    this.add(this.sky)
  }
}

export default Background;