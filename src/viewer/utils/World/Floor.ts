import * as THREE from "three";
import CANNON from "cannon";
import type { Viewer } from "../../Viewer";
import type { PhysicsWorld } from "./PhysicsWorld";

export class Floor {
  private viewer: Viewer;
  private physicsWorld: PhysicsWorld;
  body: CANNON.Body;

  constructor(_viewer: Viewer) {
    this.viewer = _viewer;
    this.physicsWorld = this.viewer.world.physicsWorld;
    this.body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, 0, 0),
      shape: new CANNON.Plane(),
    });

    this.initBody();
  }

  initBody() {
    this.body.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );
    this.physicsWorld.instance.addBody(this.body);
  }
}
