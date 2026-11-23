import { useEffect, useRef, useState } from "react";
import { chapters, getChapterIndex, profile } from "../../data/cv";
import { jumpTo, readProgress } from "../../lib/navigation";
import { motion } from "../../lib/motion";
import { useMedia } from "../../lib/useMedia";
import styles from "./SceneDialogue.module.scss";

/**
 * One taped paper note per scene, in Mr. Panda's voice.
 *
 * Real DOM text (selectable, translatable, screen-reader friendly) that follows
 * the camera: the note swaps when the wall reaches the next chapter. Collapsible
 * so the artwork can be watched untouched.
 */
const SceneDialogue = () => {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(true);
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const isNarrow = useMedia("(max-width: 900px)");
  const showFull = !isNarrow || expanded;
  const cardRef = useRef(null);
  const shouldFocusTab = useRef(false);
  const chapter = chapters[index];

  // Follow the camera: chapter changes swap the note.
  useEffect(() => {
    let raf = 0;
    let current = -1;
    const tick = () => {
      const next = getChapterIndex(readProgress());
      if (next !== current) {
        current = next;
        setIndex(next);
        // Keep the artwork visible on phones when the wall moves on.
        setExpanded(false);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Re-play the entrance whenever the chapter changes.
  useEffect(() => {
    if (!open) return;
    if (motion.reduced) {
      setVisible(true);
      return;
    }
    setVisible(false);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [index, open]);

  // Esc closes the note and returns focus to the tab that reopens it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    shouldFocusTab.current = true;
    setOpen(false);
  };

  const goToChapter = (next) => {
    const target = Math.min(Math.max(next, 0), chapters.length - 1);
    jumpTo(chapters[target].range[0] + 0.004);
    setIndex(target);
  };

  if (!open) {
    return (
      <button
        type="button"
        className={styles.tab}
        onClick={() => setOpen(true)}
        aria-expanded="false"
        aria-controls="scene-dialogue"
        ref={(node) => {
          if (node && shouldFocusTab.current) {
            node.focus();
            shouldFocusTab.current = false;
          }
        }}
      >
        <span className={styles.tabDot} aria-hidden="true" />
        {profile.tab}
      </button>
    );
  }

  return (
    <aside
      className={`${styles.card} ${visible ? styles.shown : ""} ${
        isNarrow && !expanded ? styles.compact : ""
      }`}
      id="scene-dialogue"
      aria-label="Résumé note from Mr. Panda"
      ref={cardRef}
      onWheel={(e) => {
        // Let the wall keep scrolling unless this note is the scrollable one.
        const el = cardRef.current;
        if (el && el.scrollHeight > el.clientHeight + 4) e.stopPropagation();
      }}
    >
      <span className={styles.tape} aria-hidden="true" />

      <div className={styles.head}>
        <p className={styles.tag}>
          Chapter {chapter.no}
          <span className={styles.tagSep} aria-hidden="true">
            /
          </span>
          {String(chapters.length).padStart(2, "0")}
        </p>
        <button
          type="button"
          className={styles.close}
          onClick={close}
          aria-label="Hide the résumé note"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <p className={styles.speaker}>
        {profile.name}
        <span className={styles.speakerRole}>{profile.role}</span>
      </p>

      <h2 className={styles.title}>{chapter.en}</h2>
      <p className={styles.line}>{chapter.zh}</p>

      {showFull && (
        <>
          {chapter.body?.map((paragraph) => (
            <p className={styles.body} key={paragraph}>
              {paragraph}
            </p>
          ))}

          <dl className={styles.meta}>
            {chapter.meta.map((row) => (
              <div className={styles.metaRow} key={row.k}>
                <dt>{row.k}</dt>
                <dd>{row.v}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      <div className={styles.foot}>
        {isNarrow && (
          <button
            type="button"
            className={styles.more}
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? "收起" : "阅读全文"}
          </button>
        )}
        <div className={styles.pager}>
          <button
            type="button"
            className={styles.step}
            onClick={() => goToChapter(index - 1)}
            disabled={index === 0}
            aria-label="Previous chapter"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 12h15M10 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.step}
            onClick={() => goToChapter(index + 1)}
            disabled={index === chapters.length - 1}
            aria-label="Next chapter"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M20 12H5M14 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <p className={styles.counter} aria-hidden="true">
          {chapter.no} / {String(chapters.length).padStart(2, "0")}
        </p>
      </div>
    </aside>
  );
};

export default SceneDialogue;
