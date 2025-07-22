import * as THREE from "three";
import { Mouse } from "./utils/Mouse";
import { Scroll } from "./utils/Scroll";
import { Sizes } from "./utils/Sizes";
import { Time } from "./utils/Time";
import { Resources } from "./utils/Resources";
import { Camera } from "./utils/Camera";
import { Renderer } from "./utils/Renderer";
import type { Source } from "./utils/Source";
import { World } from "./utils/World/World";

export class Viewer {
  canvas: HTMLElement;
  sizes: Sizes;
  mouse: Mouse;
  scroll: Scroll;
  time: Time;
  scene: THREE.Scene;
  resources: Resources;
  camera: Camera;
  renderer: Renderer;
  world: World;

  constructor(_canvas: HTMLElement, sources: Source[]) {
    this.canvas = _canvas;
    this.sizes = new Sizes();
    this.mouse = new Mouse(this);
    this.scroll = new Scroll();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources(sources);
    this.camera = new Camera(this);
    this.renderer = new Renderer(this);
    this.world = new World(this);

    this.sizes.on("resize", () => {
      this.resize();
    });

    this.time.on("tick", () => {
      this.update();
    });

    this.resources.on("ready", () => {
      this.ready();
    });

    this.scroll.on("scroll", () => {
      this.scroll.update();
    });
  }

  resize() {
    this.sizes.resize();
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.camera.update();
    this.renderer.update();
    this.world.update();
    this.camera.mouseMove();
  }

  ready() {
    this.world.ready();
  }
}
