import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, extend, useThree } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import Scene from "./Scene";
import * as THREE from "three/webgpu";
import normalizeWheel from "normalize-wheel";
import {
  registerNudgeHandler,
  registerJumpHandler,
  NAV_STEP,
} from "../lib/navigation";
import { motion } from "../lib/motion";

const Experience = () => {
  const camera = useRef();
  const cameraGroup = useRef();

  // Dev-only: ?p=0.42 snaps the camera to a given point on the wall so scene
  // boundaries can be screenshotted deterministically.
  const initialProgress = useMemo(() => {
    if (import.meta.env.DEV) {
      const q = new URLSearchParams(window.location.search);
      if (q.has("p")) {
        motion.reduced = true;
        motion.timeScale = 0;
        return Math.min(Math.max(Number(q.get("p")) || 0, 0), 0.999);
      }
    }
    return 0;
  }, []);

  const scrollProgress = useRef(initialProgress);
  const targetScrollProgress = useRef(initialProgress);
  const baseScrollSpeed = 0.0085;
  const scrollSpeedMultiplier = useRef(1);
  const lerpFactor = 0.1;
  const isSwiping = useRef(false);
  const mousePositionOffset = useRef(new THREE.Vector3());
  const mouseRotationOffset = useRef(new THREE.Euler());
  const lastTouchY = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      const normalized = normalizeWheel(e);

      targetScrollProgress.current +=
        Math.sign(normalized.pixelY) *
        baseScrollSpeed *
        scrollSpeedMultiplier.current *
        Math.min(Math.abs(normalized.pixelY) / 100, 1);
    };

    const handleMouseMove = (e) => {
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = (e.clientY / window.innerHeight) * 2 - 1;

      const sensitivityX = 0.05;
      const sensitivityY = 0.05;

      mousePositionOffset.current.x = mouseX * sensitivityX;
      mousePositionOffset.current.y = mouseY * sensitivityY;

      const rotationSensitivityX = 0.05;
      const rotationSensitivityY = 0.05;

      mouseRotationOffset.current.x = mouseY * rotationSensitivityX;
      mouseRotationOffset.current.y = mouseX * rotationSensitivityY;
    };

    const handleTouchStart = (e) => {
      isSwiping.current = true;
      lastTouchY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!isSwiping.current) return;

      if (lastTouchY.current !== null) {
        const deltaY = e.touches[0].clientY - lastTouchY.current;
        const touchMultiplier = 0.3;
        targetScrollProgress.current +=
          Math.sign(deltaY) *
          baseScrollSpeed *
          touchMultiplier *
          scrollSpeedMultiplier.current;
      }
      lastTouchY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      isSwiping.current = false;
      lastTouchY.current = null;
    };

    const handleMouseDown = (e) => {
      if (e.pointerType === "touch") return;
      isSwiping.current = true;
    };

    const handleMouseDrag = (e) => {
      if (!isSwiping.current || e.pointerType === "touch") return;
      const mouseMultiplier = 0.2;
      // The source referenced an undeclared `scrollSpeed` here; the drag gesture
      // advertised by the intro screen now uses the base speed.
      targetScrollProgress.current +=
        Math.sign(e.movementY) * baseScrollSpeed * mouseMultiplier;
    };

    const handleMouseUp = () => {
      isSwiping.current = false;
    };

    // Keyboard parity for the pointer/wheel gesture.
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      if (
        target instanceof Element &&
        target.closest("button, a, input, textarea, select, [contenteditable]")
      ) {
        return;
      }

      const forward = ["ArrowDown", "ArrowRight", "PageDown", " "];
      const backward = ["ArrowUp", "ArrowLeft", "PageUp"];

      if (forward.includes(e.key)) {
        e.preventDefault();
        targetScrollProgress.current += NAV_STEP;
      } else if (backward.includes(e.key)) {
        e.preventDefault();
        targetScrollProgress.current -= NAV_STEP;
      } else if (e.key === "Home") {
        e.preventDefault();
        targetScrollProgress.current = 0;
        scrollProgress.current = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        targetScrollProgress.current = 0.999;
      }
    };

    const unregisterNudge = registerNudgeHandler((direction) => {
      targetScrollProgress.current += direction * NAV_STEP;
    });

    const unregisterJump = registerJumpHandler((value) => {
      // Keep the jump inside the lap the visitor is currently on.
      const lap = Math.floor(targetScrollProgress.current);
      targetScrollProgress.current = lap + value;
    });

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("keydown", handleKeyDown);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousemove", handleMouseDrag);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      unregisterNudge();
      unregisterJump();
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseDrag);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <Canvas
      shadows
      flat={true}
      aria-hidden="true"
      gl={(props) => {
        extend(THREE);
        const renderer = new THREE.WebGPURenderer(props);
        return renderer.init().then(() => renderer);
      }}
      style={{ width: "100vw", height: "100vh" }}
    >
      <Scene
        cameraGroup={cameraGroup}
        camera={camera}
        scrollProgress={scrollProgress}
        targetScrollProgress={targetScrollProgress}
        lerpFactor={lerpFactor}
        mousePositionOffset={mousePositionOffset}
        mouseRotationOffset={mouseRotationOffset}
        scrollSpeedMultiplier={scrollSpeedMultiplier}
      />

      <group ref={cameraGroup}>
        <PerspectiveCamera
          ref={camera}
          makeDefault
          fov={35}
          // position={[0, 0, 30]}
        />
        {/* <OrbitControls enableZoom={false} enableRotate={false} /> */}
      </group>
    </Canvas>
  );
};

export default Experience;
