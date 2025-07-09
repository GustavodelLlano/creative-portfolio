import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Viewer } from "../Viewer";
import type { Sizes } from "./Sizes";
import type { Mouse } from "./Mouse";
import type { Time } from "./Time";

export class Camera {
  private viewer: Viewer;
  private sizes: Sizes;
  private scene: THREE.Scene;
  private canvas: HTMLElement;
  private mouse: Mouse;
  private time: Time;
  instance: THREE.PerspectiveCamera;
  controls: OrbitControls | null = null;

  constructor(_viewer: Viewer) {
    this.viewer = _viewer;
    this.sizes = this.viewer.sizes;
    this.scene = this.viewer.scene;
    this.canvas = this.viewer.canvas;
    this.mouse = this.viewer.mouse;
    this.time = this.viewer.time;
    this.instance = new THREE.PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );

    this.setInstance();
  }

  setInstance() {
    if (window.innerWidth > 768) {
      this.instance.position.set(0, 0, 2.5);
    } else {
      this.instance.position.set(0, 0, 8);
    }
    this.scene.add(this.instance);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls?.update();
  }

  mouseMove() {
    // this.instance.position.x +=
    //   (this.mouse.parallax.x - this.instance.position.x) *
    //   0.0075 *
    //   this.time.delta;
    // this.instance.position.y +=
    //   (-this.mouse.parallax.y - this.instance.position.y) *
    //   0.0075 *
    //   this.time.delta;
  }
}

export default Camera;
