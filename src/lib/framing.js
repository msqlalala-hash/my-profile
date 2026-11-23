/**
 * Camera framing for the paper wall.
 *
 * Desktop keeps the measured reference framing: fov 35, zoom 1, no pan.
 * Narrow viewports get a deliberate recomposition: the projection is widened
 * (zoom < 1, so the camera does not physically travel and the parallax between
 * the paper wall and the cut-out objects stays intact) and the view is panned
 * along the wall so the focal subject stays in frame.
 *
 * Two anchors, because a portrait tablet can still hold the whole opening
 * cluster (airplane, panda on the bicycle, handwritten welcome) while a phone
 * can only hold the mascot group — the greeting is one swipe away there.
 */
const WIDE_ASPECT = 1.2;
const TABLET_ASPECT = 0.75;
const PHONE_ASPECT = 0.46;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

export const getFraming = (aspect) => {
  if (!Number.isFinite(aspect) || aspect >= WIDE_ASPECT) {
    return { fov: 35, zoom: 1, panX: 0 };
  }

  if (aspect >= TABLET_ASPECT) {
    const t = clamp01((WIDE_ASPECT - aspect) / (WIDE_ASPECT - TABLET_ASPECT));
    return { fov: 35, zoom: lerp(1, 0.66, t), panX: lerp(0, -1.45, t) };
  }

  const t = clamp01((TABLET_ASPECT - aspect) / (TABLET_ASPECT - PHONE_ASPECT));
  return { fov: 35, zoom: lerp(0.66, 0.6, t), panX: lerp(-1.45, -2.28, t) };
};
