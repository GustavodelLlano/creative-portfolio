import * as THREE from "three";
import { Viewer } from "../../Viewer";
import type { Resources } from "../Resources";

class Enviroment {
  private viewer: Viewer;
  private scene: THREE.Scene;
  private resources: Resources;
  ambientLight: THREE.AmbientLight | null = null;
  directionalLight: THREE.DirectionalLight | null = null;
  enviromentMap: any;

  constructor(_viewer: Viewer) {
    this.viewer = _viewer;
    this.scene = this.viewer.scene;
    this.resources = this.viewer.resources;

    this.setAmbientLight();
    this.setDirectionalLight();
  }

  setAmbientLight() {
    this.ambientLight = new THREE.AmbientLight(0xfffaf0, 0.2);
    this.scene.add(this.ambientLight);
  }

  setDirectionalLight() {
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    this.directionalLight.position.set(-0.8, 0.5, 1.8);
    this.scene.add(this.directionalLight);
  }

  // Not used
  setEnviromentMap() {
    this.enviromentMap = {};
    this.enviromentMap.intensity = 2.4;
    this.enviromentMap.texture = this.resources.items["name of item"];
    this.enviromentMap.texture.colorSpace = THREE.SRGBColorSpace;

    this.scene.environment = this.enviromentMap.texture;

    this.enviromentMap.updateMaterials = () => {
      this.scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial
        ) {
          child.material.envMap = this.enviromentMap.texture;
          child.material.envMapIntensity = this.enviromentMap.intensity;
          child.material.needsUpdate = true;
        }
      });
    };
    this.enviromentMap.updateMaterials();
  }
}

export default Enviroment;
