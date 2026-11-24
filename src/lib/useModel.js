import { useGLTF } from "@react-three/drei";
import { asset } from "./asset";

// Every .glb in this project is referenced from the public root, so route it
// through `asset()` once here instead of touching each scene model.
export const useModel = (path) => useGLTF(asset(path));

useModel.preload = (path) => useGLTF.preload(asset(path));
