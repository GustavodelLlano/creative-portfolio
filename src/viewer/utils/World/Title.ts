import * as THREE from "three";
import CANNON from "cannon";
import type { GLTF } from "three/examples/jsm/Addons.js";
import { Viewer } from "../../Viewer";
import type { Resources } from "../Resources";
import type { PhysicsWorld } from "./PhysicsWorld";
import type { Scroll } from "../Scroll";

export class Title {
  private viewer: Viewer;
  private scene: THREE.Scene;
  private physicsWorld: PhysicsWorld;
  private scroll: Scroll;
  private resources: Resources;
  resource: GLTF;
  model: THREE.Group<THREE.Object3DEventMap>;
  body: CANNON.Body;

  constructor(_viewer: Viewer) {
    this.viewer = _viewer;
    this.scene = this.viewer.scene;
    this.physicsWorld = this.viewer.world.physicsWorld;
    this.scroll = this.viewer.scroll;
    this.resources = this.viewer.resources;
    this.resource = this.resources.items["title"];
    this.model = this.resource.scene;
    this.body = new CANNON.Body({
      mass: 1,
      position:
        window.innerWidth > 768
          ? new CANNON.Vec3(0, 2, 0)
          : new CANNON.Vec3(0, 2.5, 0),
      shape: new CANNON.Box(new CANNON.Vec3(1.5, 0, 1.5)),
    });

    this.setModel();
    this.addBody();
  }

  private cycleDuration = 15000;
  private rotationDuration = 2500;
  private rotationStartTime: number = performance.now() + 15000;

  setModel() {
    const { x, y, z } = this.body.position;
    this.model.position.set(x, y, z);
    this.model.scale.set(0.35, 0.35, 0.35);
    this.scene.add(this.model);
  }

  addBody() {
    this.physicsWorld.instance.addBody(this.body);
  }

  update() {
    this.model.position.copy(this.body.position);
    this.model.position.y += this.scroll.y * 0.00225;
    this.model.position.z -= this.scroll.y * 0.007;

    if (this.scroll.y === 0) {
      const now = performance.now();
      const elapsed = (now - this.rotationStartTime) % this.cycleDuration;

      if (elapsed >= 0 && elapsed < this.rotationDuration) {
        const t = elapsed / this.rotationDuration;

        // Ease-in-out (sine)
        const easeInOutCubic = (t: number) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const easedT = easeInOutCubic(t);
        const angle = easedT * Math.PI * 6; // 3 vueltas

        this.model.rotation.x = angle;
      } else {
        this.model.rotation.x = 0;
      }
    } else {
      // Reset: next rotation in 15s after scroll stops
      this.rotationStartTime = performance.now() + this.cycleDuration;
      this.model.rotation.x = 0;
    }
  }
}
