import { React, Suspense, useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import MovingObjects from "./models/Moving_Objects";
import SceneOne from "./models/SceneOne";
import SceneTwo from "./models/SceneTwo";
import SceneThree from "./models/SceneThree";
import SceneFour from "./models/SceneFour";
import SingleSheet from "./models/SingleSheet";
import Panda from "./models/Panda";
import {
  cameraCurve as initialCameraCurve,
  initialCameraPoints,
  SHIFT_X_AMOUNT,
  rotationTargets,
} from "./components/curve";
import { useScrollCurve } from "./hooks/useScrollCurve";
import { motion } from "../lib/motion";
import { getFraming } from "../lib/framing";
import { reportProgress } from "../lib/navigation";

const WORLD_FORWARD_TRIGGER = 0.92;
const WORLD_BACK_TRIGGER = 0.91;
const SINGLE_FORWARD_TRIGGER = 0.5;
const SINGLE_BACK_TRIGGER = 0.35;

const Scene = ({
  cameraGroup,
  camera,
  scrollProgress,
  targetScrollProgress,
  lerpFactor,
  mousePositionOffset,
  mouseRotationOffset,
  scrollSpeedMultiplier,
}) => {
  const cameraScrollCurve = useScrollCurve(
    initialCameraCurve,
    initialCameraPoints,
    SHIFT_X_AMOUNT,
  );

  const sceneGroupRef = useRef();
  const singleSheetRef = useRef();

  const { size } = useThree();
  const aspect = size.width / size.height;
  const framing = getFraming(aspect);

  // Projection is updated only when the framing bucket changes, not per frame.
  useEffect(() => {
    if (!camera.current) return;
    camera.current.fov = framing.fov;
    camera.current.zoom = framing.zoom;
    camera.current.updateProjectionMatrix();
  }, [camera, framing.fov, framing.zoom]);

  const shiftWorld = (direction = "forward") => {
    if (!sceneGroupRef.current) return;
    const offset =
      direction === "forward"
        ? SHIFT_X_AMOUNT * cameraScrollCurve.loopCounter.current
        : SHIFT_X_AMOUNT * (cameraScrollCurve.loopCounter.current - 1);
    sceneGroupRef.current.position.x = offset;
  };

  const shiftSingleSheet = (direction = "forward") => {
    if (!singleSheetRef.current) return;
    const offset =
      direction === "forward"
        ? SHIFT_X_AMOUNT * cameraScrollCurve.loopCounter.current
        : SHIFT_X_AMOUNT * (cameraScrollCurve.loopCounter.current - 1);
    singleSheetRef.current.position.x = offset;
  };

  const [rotationBufferQuat] = useState(
    new THREE.Quaternion().setFromEuler(rotationTargets[0].rotation),
  );

  const getLerpedRotation = (progress) => {
    if (cameraScrollCurve.transitionCurveActive.current) {
      const lerpFactor = (progress - 0) / (1 - 0);
      const startQuaternion = new THREE.Quaternion().setFromEuler(
        rotationTargets[rotationTargets.length - 1].rotation,
      );
      const endQuaternion = new THREE.Quaternion().setFromEuler(
        rotationTargets[0].rotation,
      );
      const lerpingQuaternion = new THREE.Quaternion();
      lerpingQuaternion.slerpQuaternions(
        startQuaternion,
        endQuaternion,
        lerpFactor,
      );
      return lerpingQuaternion;
    } else {
      for (let i = 0; i < rotationTargets.length - 1; i++) {
        const start = rotationTargets[i];
        const end = rotationTargets[i + 1];
        if (progress >= start.progress && progress <= end.progress) {
          const lerpFactor =
            (progress - start.progress) / (end.progress - start.progress);
          const startQuaternion = new THREE.Quaternion().setFromEuler(
            start.rotation,
          );
          const endQuaternion = new THREE.Quaternion().setFromEuler(
            end.rotation,
          );
          const lerpingQuaternion = new THREE.Quaternion();
          lerpingQuaternion.slerpQuaternions(
            startQuaternion,
            endQuaternion,
            lerpFactor,
          );
          return lerpingQuaternion;
        }
      }
    }
    return new THREE.Quaternion().setFromEuler(
      rotationTargets[rotationTargets.length - 1].rotation,
    );
  };

  // Place the camera on the wall immediately: gliding in from the world origin
  // only reads as a slow zoom on low-end GPUs, and the intro overlay covers the
  // moment anyway. Composition is unchanged.
  useEffect(() => {
    if (!cameraGroup.current) return;
    cameraGroup.current.position.copy(
      cameraScrollCurve.getCurrentPoint(scrollProgress.current),
    );
    rotationBufferQuat.copy(
      new THREE.Quaternion().setFromEuler(rotationTargets[0].rotation),
    );
    cameraGroup.current.quaternion.copy(rotationBufferQuat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    // Reduced motion: the same composed frames, reached instantly.
    const still = motion.reduced;
    const eased = still ? 1 : lerpFactor;

    let newProgress = THREE.MathUtils.lerp(
      scrollProgress.current,
      targetScrollProgress.current,
      eased,
    );

    if (newProgress >= 1) {
      if (cameraScrollCurve.transitionCurveActive.current) {
        cameraScrollCurve.transitionCurveActive.current = false;
        cameraScrollCurve.shiftCurvePoints("forward");
        cameraScrollCurve.loopCounter.current++;
      } else {
        cameraScrollCurve.transitionCurveActive.current = true;
        cameraScrollCurve.initiateTransitionCurve();
      }
      scrollProgress.current -= 1;
      targetScrollProgress.current -= 1;
      newProgress -= 1;
    } else if (newProgress < 0) {
      if (cameraScrollCurve.transitionCurveActive.current) {
        cameraScrollCurve.transitionCurveActive.current = false;
        cameraScrollCurve.shiftCurvePoints("backward");
      } else {
        cameraScrollCurve.loopCounter.current--;
        cameraScrollCurve.transitionCurveActive.current = true;
        cameraScrollCurve.initiateTransitionCurve();
      }
      scrollProgress.current += 1;
      targetScrollProgress.current += 1;
      newProgress += 1;
    }

    scrollProgress.current = newProgress;

    if (cameraScrollCurve.transitionCurveActive.current) {
      scrollSpeedMultiplier.current = newProgress <= 0.95 ? 6 : 1;
    } else {
      scrollSpeedMultiplier.current = 1;
    }

    if (
      newProgress > WORLD_FORWARD_TRIGGER &&
      !cameraScrollCurve.transitionCurveActive.current
    ) {
      shiftWorld("forward");
    }
    if (
      newProgress <= WORLD_BACK_TRIGGER &&
      !cameraScrollCurve.transitionCurveActive.current
    ) {
      shiftWorld("backward");
    }
    if (
      newProgress >= SINGLE_FORWARD_TRIGGER &&
      !cameraScrollCurve.transitionCurveActive.current
    ) {
      shiftSingleSheet("forward");
    }
    if (
      newProgress <= SINGLE_BACK_TRIGGER &&
      !cameraScrollCurve.transitionCurveActive.current
    ) {
      shiftSingleSheet("backward");
    }

    const basePoint = cameraScrollCurve.getCurrentPoint(newProgress);

    cameraGroup.current.position.x = THREE.MathUtils.lerp(
      cameraGroup.current.position.x,
      basePoint.x,
      eased,
    );
    cameraGroup.current.position.y = THREE.MathUtils.lerp(
      cameraGroup.current.position.y,
      basePoint.y,
      eased,
    );
    cameraGroup.current.position.z = THREE.MathUtils.lerp(
      cameraGroup.current.position.z,
      basePoint.z,
      eased,
    );

    camera.current.position.x = THREE.MathUtils.lerp(
      camera.current.position.x,
      framing.panX + (still ? 0 : mousePositionOffset.current.x),
      eased,
    );
    camera.current.position.y = THREE.MathUtils.lerp(
      camera.current.position.y,
      still ? 0 : -mousePositionOffset.current.y,
      eased,
    );
    camera.current.position.z = 0;

    const targetRotation = getLerpedRotation(newProgress);
    rotationBufferQuat.slerp(targetRotation, still ? 1 : 0.05);
    cameraGroup.current.quaternion.copy(rotationBufferQuat);

    camera.current.rotation.x = THREE.MathUtils.lerp(
      camera.current.rotation.x,
      still ? 0 : -mouseRotationOffset.current.x,
      eased,
    );
    camera.current.rotation.y = THREE.MathUtils.lerp(
      camera.current.rotation.y,
      still ? 0 : -mouseRotationOffset.current.y,
      eased,
    );

    reportProgress(newProgress);

  });

  return (
    <>
      <Suspense fallback={null}>
        <group ref={sceneGroupRef}>
          <MovingObjects scrollProgress={scrollProgress} />
          <SceneOne />
          <SceneTwo />
          <SceneThree scrollProgress={scrollProgress} />
          <SceneFour />
        </group>

        <Panda
          scrollProgress={scrollProgress}
          cameraScrollCurve={cameraScrollCurve}
        />
        <group ref={singleSheetRef}>
          <SingleSheet scrollProgress={scrollProgress} />
        </group>
      </Suspense>
    </>
  );
};

export default Scene;
