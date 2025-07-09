import * as THREE from "three";
import { Viewer } from './../Viewer';
import type { Sizes } from "./Sizes";
import type Camera from "./Camera";

export class Renderer {
  private viewer: Viewer;
  private sizes: Sizes;
  private scene: THREE.Scene;
  private canvas: HTMLElement | null;
  private camera: Camera;
  instance: THREE.WebGLRenderer;

  constructor(_viewer: Viewer) {
    this.viewer = _viewer;
    this.sizes = this.viewer.sizes;
    this.scene = this.viewer.scene;
    this.canvas = this.viewer.canvas;
    this.camera = this.viewer.camera;
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
    });

    this.setInstance();
  }

  setInstance() {
    this.instance.setSize(this.sizes?.width, this.sizes?.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.instance.setClearColor(0x000000, 0);
  }

  resize() {
    this.instance.setSize(this.sizes?.width, this.sizes?.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  update() {
    this.instance.render(this.scene, this.camera.instance);
  }
}
