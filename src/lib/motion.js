/**
 * Shared motion preferences.
 *
 * The original scene (see CREDITS) animates every frame with wall-clock time.
 * For `prefers-reduced-motion` we keep the exact same scene graph but freeze
 * the clocks and jump the camera instead of easing it, so the settled frame is
 * deterministic on every load.
 */

export const motion = {
  reduced: false,
  // 0 freezes the idle paper wobble, 1 is the source timing.
  timeScale: 1,
};

export const initMotionPreference = () => {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};

  const query = window.matchMedia("(prefers-reduced-motion: reduce)");

  const apply = () => {
    motion.reduced = query.matches;
    motion.timeScale = query.matches ? 0 : 1;
    document.documentElement.dataset.reducedMotion = query.matches
      ? "true"
      : "false";
  };

  apply();
  query.addEventListener("change", apply);
  return () => query.removeEventListener("change", apply);
};

/** Deterministic scene time: frozen at 0 when motion is reduced. */
export const sceneTime = (state) =>
  motion.reduced ? 0 : state.clock.elapsedTime;

/** Deterministic delta: 0 when motion is reduced. */
export const sceneDelta = (delta) => delta * motion.timeScale;
