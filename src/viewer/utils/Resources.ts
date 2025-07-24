import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { EventEmitter } from "./EventEmitter";
import type { Source } from "./Source";

interface Loaders {
  gltfLoader?: GLTFLoader;
  textureLoader?: THREE.TextureLoader;
  cubeTextureLoader?: THREE.CubeTextureLoader;
  dracoLoader?: DRACOLoader;
}

export class Resources extends EventEmitter {
  private sources: Source[];
  items: { [key: string]: GLTF };
  toLoad: number;
  loaded: number;
  loaders: Loaders;

  constructor(_sources: Source[]) {
    super();

    this.sources = _sources;
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;
    this.loaders = {};

    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    this.loaders = {
      gltfLoader: new GLTFLoader(),
      textureLoader: new THREE.TextureLoader(),
      dracoLoader: new DRACOLoader(),
    };

    this.loaders.dracoLoader?.setDecoderPath("/draco/");
    this.loaders.gltfLoader?.setDRACOLoader(this.loaders.dracoLoader!);
  }

  startLoading() {
    console.log(this.sources);
    this.sources.forEach((source) => {
      switch (source.type) {
        case "gltf.model":
          if (source.path && source.path[0]) {
            const gradientTexture = this.loaders.textureLoader?.load(
              "/textures/5.jpg"
            ) as THREE.Texture;
            gradientTexture.magFilter = THREE.NearestFilter;

            const material = new THREE.MeshToonMaterial({
              color: 0xFF1E56,
              gradientMap: gradientTexture,
            });

            this.loaders.gltfLoader?.load(source.path[0], (file) => {
              file.scene.traverse((node: THREE.Object3D) => {
                if ((node as THREE.Mesh).isMesh) {
                  (node as THREE.Mesh).material = material;
                }
              });
              this.sourceLoaded(source, file);
            });
          } else {
            console.warn(`Missing path for source: ${source.name}`);
            this.sourceLoaded(source, null as any);
          }
          break;
        default:
          console.warn("Unknown type", source.type);
          this.sourceLoaded(source, null as any);
          break;
      }
    });
  }

  sourceLoaded(source: Source, file: GLTF) {
    console.log(file);
    this.items[source.name] = file;
    this.loaded++;

    if (this.loaded === this.toLoad) {
      this.trigger("ready");
    }
  }
}
