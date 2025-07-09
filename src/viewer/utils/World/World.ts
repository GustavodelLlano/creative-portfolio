import * as THREE from "three";
import type { Viewer } from "../../Viewer";
import Enviroment from "./Enviroment";
import { PhysicsWorld } from "./PhysicsWorld";
import { Floor } from "./Floor";
import { Title } from "./Title";

export class World {
  private viewer: Viewer;
  physicsWorld: PhysicsWorld;
  enviroment: Enviroment | null = null;
  floor: Floor | null = null;
  title: Title | null = null;

  constructor(_viewer: Viewer) {
    this.viewer = _viewer;
    this.physicsWorld = new PhysicsWorld();
  }

  ready() {
    this.floor = new Floor(this.viewer);
    this.enviroment = new Enviroment(this.viewer);
    this.title = new Title(this.viewer);
  }

  update() {
    this.physicsWorld.instance.step(this.viewer.time.delta * 0.15);
    this.title?.update();
  }
}
