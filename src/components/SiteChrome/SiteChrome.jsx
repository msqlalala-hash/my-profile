import { useEffect, useRef, useState } from "react";
import { navigate, readProgress } from "../../lib/navigation";
import styles from "./SiteChrome.module.scss";

/**
 * Real DOM chrome for the papercraft experience.
 *
 * Kept to the two corners of the floor strip so the measured 3D composition
 * (paper wall, airplane, panda, notes) is untouched. Every word here is also
 * what the scene itself says: "Mr. Panda", "Psychologically Safe Portfolio",
 * "scroll / drag up / down to navigate".
 */
const SiteChrome = () => {
  const fillRef = useRef(null);
  const barRef = useRef(null);
  const [announcement, setAnnouncement] = useState("");

  // Paint the position indicator straight to the DOM: no per-frame React work.
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = () => {
      const p = Math.min(Math.max(readProgress(), 0), 1);
      const pct = Math.round(p * 100);
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
      if (pct !== last) {
        last = pct;
        if (barRef.current) barRef.current.setAttribute("aria-valuenow", `${pct}`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const step = (direction) => {
    navigate(direction);
    setAnnouncement(
      direction > 0 ? "Moved forward along the portfolio" : "Moved back along the portfolio",
    );
  };

  return (
    <>
      <a className={styles.skip} href="#portfolio-navigation">
        Skip to portfolio navigation
      </a>

      <header className={styles.brand}>
        <h1 className={styles.name}>
          Mr. Panda
          <span className={styles.tagline}>Psychologically Safe Portfolio</span>
        </h1>
      </header>

      <p className={styles.hint}>
        <span className={styles.hintLine} aria-hidden="true" />
        scroll / drag up / down to navigate
      </p>

      <nav
        className={styles.controls}
        id="portfolio-navigation"
        aria-label="Portfolio navigation"
      >
        <button
          type="button"
          className={styles.button}
          onClick={() => step(-1)}
          aria-label="Previous scene"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 20.5c.1-4.6.4-8.9 1-13.2" />
            <path d="M6.4 12.6c2-2.3 3.6-3.9 6.6-5.6 3 1.8 4.7 3.5 6.6 5.9" />
            <path d="M8.4 13.2c1.9-1.6 3.1-2.4 4.6-3.2" />
          </svg>
        </button>

        <div
          className={styles.track}
          ref={barRef}
          role="progressbar"
          aria-label="Position along the paper wall"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
        >
          <span className={styles.trackFill} ref={fillRef} />
        </div>

        <button
          type="button"
          className={styles.button}
          onClick={() => step(1)}
          aria-label="Next scene"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 3.5c-.1 4.6-.4 8.9-1 13.2" />
            <path d="M6.4 11.4c2 2.3 3.6 3.9 6.6 5.6 3-1.8 4.7-3.5 6.6-5.9" />
            <path d="M8.4 10.8c1.9 1.6 3.1 2.4 4.6 3.2" />
          </svg>
        </button>
      </nav>

      <p className={styles.srOnly} role="status" aria-live="polite">
        {announcement}
      </p>
    </>
  );
};

export default SiteChrome;
