import * as THREE from "three";
import { ImprovedNoise } from "three/addons/math/ImprovedNoise.js";

let renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera;
let mesh: THREE.Mesh<THREE.BoxGeometry, THREE.RawShaderMaterial>;
let parameters = { threshold: 1.0, steps: 200 };
let material: THREE.RawShaderMaterial;

export function initArtisticSection() {
  const canvasContainer = document.getElementById("canvas-container");
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
    precision: "mediump",
    logarithmicDepthBuffer: false,
    depth: false,
  });

  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.position = "fixed";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100vh";
  renderer.domElement.style.pointerEvents = "none";
  canvasContainer?.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 0.9);

  // Texture
  const size = 128;
  const data = new Uint8Array(size * size * size);
  let i = 0;
  const perlin = new ImprovedNoise();
  const sizeInv = 1.0 / size;
  const noiseScale = 7;
  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const nx = x * sizeInv * noiseScale;
        const ny = y * sizeInv * noiseScale;
        const nz = z * sizeInv * noiseScale;
        const d = perlin.noise(nx, ny, nz);
        data[i++] = d * 128 + 128;
      }
    }
  }
  const texture = new THREE.Data3DTexture(data, size, size, size);
  texture.format = THREE.RedFormat;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;

  // Material
  const vertexShader = /* glsl */ `
                  in vec3 position;
                  uniform mat4 modelMatrix;
                  uniform mat4 modelViewMatrix;
                  uniform mat4 projectionMatrix;
                  uniform vec3 cameraPos;
                  out vec3 vOrigin;
                  out vec3 vDirection;
                  void main() {
                      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                      vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
                      vDirection = position - vOrigin;
                      gl_Position = projectionMatrix * mvPosition;
                  }
              `;
  const fragmentShader = /* glsl */ `
                  precision highp float;
                  precision highp sampler3D;
                  uniform mat4 modelViewMatrix;
                  uniform mat4 projectionMatrix;
                  in vec3 vOrigin;
                  in vec3 vDirection;
                  out vec4 color;
                  uniform sampler3D map;
                  uniform float threshold;
                  uniform float steps;
                  vec2 hitBox( vec3 orig, vec3 dir ) {
                      const vec3 box_min = vec3( - 0.5 );
                      const vec3 box_max = vec3( 0.5 );
                      vec3 inv_dir = 1.0 / dir;
                      vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
                      vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
                      vec3 tmin = min( tmin_tmp, tmax_tmp );
                      vec3 tmax = max( tmin_tmp, tmax_tmp );
                      float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
                      float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
                      return vec2( t0, t1 );
                  }
                  float sample1( vec3 p ) {
                      return texture( map, p ).r;
                  }
                  #define epsilon .0001
                  vec3 normal( vec3 coord ) {
                      if ( coord.x < epsilon ) return vec3( 1.0, 0.0, 0.0 );
                      if ( coord.y < epsilon ) return vec3( 0.0, 1.0, 0.0 );
                      if ( coord.z < epsilon ) return vec3( 0.0, 0.0, 1.0 );
                      if ( coord.x > 1.0 - epsilon ) return vec3( - 1.0, 0.0, 0.0 );
                      if ( coord.y > 1.0 - epsilon ) return vec3( 0.0, - 1.0, 0.0 );
                      if ( coord.z > 1.0 - epsilon ) return vec3( 0.0, 0.0, - 1.0 );
                      float step = 0.01;
                      float x = sample1( coord + vec3( - step, 0.0, 0.0 ) ) - sample1( coord + vec3( step, 0.0, 0.0 ) );
                      float y = sample1( coord + vec3( 0.0, - step, 0.0 ) ) - sample1( coord + vec3( 0.0, step, 0.0 ) );
                      float z = sample1( coord + vec3( 0.0, 0.0, - step ) ) - sample1( coord + vec3( 0.0, 0.0, step ) );
                      return normalize( vec3( x, y, z ) );
                  }
                  void main(){
                      vec3 rayDir = normalize( vDirection );
                      vec2 bounds = hitBox( vOrigin, rayDir );
                      if ( bounds.x > bounds.y ) discard;
                      bounds.x = max( bounds.x, 0.0 );
                      vec3 p = vOrigin + bounds.x * rayDir;
                      vec3 inc = 1.0 / abs( rayDir );
                      float delta = min( inc.x, min( inc.y, inc.z ) );
                      delta /= steps;
                      for ( float t = bounds.x; t < bounds.y; t += delta ) {
                          float d = sample1( p + 0.5 );
                          if ( d > threshold ) {
                              vec3 norm = normal( p + 0.5 );
                              vec3 baseColor = vec3(1.0, 0.12, 0.34);
                              float lightFactor = 0.9 + 0.9 * max(0.0, dot(norm, normalize(vec3(1.0, 1.0, 1.0))));
                              color.rgb = baseColor * lightFactor;
                              color.a = 1.0;
                              break;
                          }
                          p += rayDir * delta;
                      }
                      if ( color.a == 0.0 ) discard;
                  }
              `;
  const geometry = new THREE.BoxGeometry(15, 15, 1);
  material = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: {
      map: { value: texture },
      cameraPos: { value: new THREE.Vector3() },
      threshold: { value: parameters.threshold },
      steps: { value: parameters.steps },
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
  });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  window.addEventListener("resize", onWindowResize);
}

export function setupScrollAnimation() {
  function getSectionVisibility() {
    const section = document.getElementById("artistic-section");
    if (!section) return { isVisible: false, progress: 0 };
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const isVisible = rect.bottom > 0 && rect.top < windowHeight;
    let progress = 0;
    if (isVisible) {
      if (rect.height <= windowHeight) {
        progress = 1 - rect.top / windowHeight;
      } else {
        progress = 1 - rect.top / windowHeight;
      }
      progress = Math.max(0, Math.min(1, progress));
    }
    return { isVisible, progress };
  }
  function updateThresholdFromScroll() {
    const { isVisible, progress } = getSectionVisibility();
    if (!isVisible) {
      parameters.threshold = 1.0;
    } else {
      const eased = Math.pow(progress, 2);
      parameters.threshold = Math.max(0, 1.0 - eased);
    }
    material.uniforms.threshold.value = parameters.threshold;
  }
  window.addEventListener("scroll", updateThresholdFromScroll);
  updateThresholdFromScroll();
}

function update() {
  material.uniforms.threshold.value = parameters.threshold;
  material.uniforms.steps.value = parameters.steps;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  mesh.material.uniforms.cameraPos.value.copy(camera.position);
  renderer.render(scene, camera);
}
