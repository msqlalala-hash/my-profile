import React from "react";
import styles from "./SceneBoundary.module.scss";

/** Feature test only — no rendering decisions are made from the GPU string. */
export const supportsWebGL = () => {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
};

/**
 * Keeps the experience shell intact when the renderer cannot start.
 * Deliberately text-only: the reference media is never used as a stand-in.
 */
const Fallback = () => (
  <div className={styles.fallback}>
    <div className={styles.sheet}>
      <h2 className={styles.title}>Mr. Panda</h2>
      <p className={styles.subtitle}>Psychologically Safe Portfolio</p>
      <p className={styles.body}>
        This papercraft world is drawn with WebGL, which this browser has turned
        off. Turn on hardware acceleration or open the page in a recent Chrome,
        Safari, Firefox or Edge to walk along the wall.
      </p>
      <a className={styles.link} href="https://get.webgl.org/">
        Check WebGL support
      </a>
    </div>
  </div>
);

class SceneBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // Surfaced for debugging without breaking the shell.
    console.error("Papercraft scene failed to start:", error);
  }

  render() {
    if (this.state.failed) return <Fallback />;
    // eslint-disable-next-line react/prop-types
    return this.props.children;
  }
}

SceneBoundary.Fallback = Fallback;

export default SceneBoundary;
