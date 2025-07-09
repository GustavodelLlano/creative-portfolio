import CANNON from "cannon";

export class PhysicsWorld {
  instance: CANNON.World;
  defaultMaterial: CANNON.Material;
  defaultContactMaterial: CANNON.ContactMaterial;

  constructor() {
    this.instance = new CANNON.World();
    this.defaultMaterial = new CANNON.Material("default");
    this.defaultContactMaterial = new CANNON.ContactMaterial(
      this.defaultMaterial,
      this.defaultMaterial,
      {
        friction: 0.05,
        restitution: 0.45,
      }
    );

    this.setInstance();
    this.setMaterials();
  }

  setInstance() {
    this.instance.broadphase = new CANNON.SAPBroadphase(this.instance);
    this.instance.allowSleep = true;
    this.instance.gravity.set(0, -3.5, 0);
  }

  setMaterials() {
    this.instance.addContactMaterial(this.defaultContactMaterial);
    this.instance.defaultContactMaterial = this.defaultContactMaterial;
  }
}
