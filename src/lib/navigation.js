/**
 * Tiny bridge between the DOM chrome and the WebGL camera.
 *
 * The source experience reads scroll progress from refs inside <Experience />.
 * The accessible controls (buttons, keyboard) live in real DOM, so they nudge
 * that same ref through this module-level bus instead of duplicating state.
 */

let nudgeHandler = null;
let jumpHandler = null;
let progress = 0;

export const NAV_STEP = 0.085;

export const registerNudgeHandler = (fn) => {
  nudgeHandler = fn;
  return () => {
    if (nudgeHandler === fn) nudgeHandler = null;
  };
};

export const registerJumpHandler = (fn) => {
  jumpHandler = fn;
  return () => {
    if (jumpHandler === fn) jumpHandler = null;
  };
};

/** direction: 1 = forward along the paper wall, -1 = back. */
export const navigate = (direction) => {
  if (nudgeHandler) nudgeHandler(Math.sign(direction) || 0);
};

/** Jump to an absolute point (0-1) on the current lap of the wall. */
export const jumpTo = (value) => {
  if (jumpHandler) jumpHandler(value);
};

export const reportProgress = (value) => {
  progress = value;
};

export const readProgress = () => progress;
