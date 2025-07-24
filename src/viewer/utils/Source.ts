import * as THREE from "three";

export const sources: Source[] = [
  {
    name: "title",
    type: "gltf.model",
    path: ["/models/bienvenido.glb"],
  },
];

export type Source = {
  name: string;
  type: string;
  path: string[];
};
