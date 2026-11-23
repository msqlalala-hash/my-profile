/*
 * Mr. Panda — Hand-drawn Papercraft Portfolio.
 *
 * Source / implementation authority (MIT, Codrops demo source):
 *   https://github.com/andrewwoan/mr-pandas-psychologically-safe-portfolio
 *   https://www.mr-pandas-psychologically-safe-portfolio.com/
 * Credit: Andrew Woan.
 *
 * Reference pack (visual QA only — never rendered by the app):
 *   https://showcase.foxora.studio/thumbnails/curated-codrops-papercraft-portfolio.webp
 *   https://showcase.foxora.studio/motion/codrops-papercraft-portfolio.webp
 *   https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2025/12/handpaper-400x300.jpg
 * Frame: 960 × 610 (aspect 1.5738).
 *
 * Résumé copy lives in src/data/cv.js.
 */
import "./App.scss";
import Experience from "./Experience/Experience";
import IntroScreen from "./components/IntroScreen/IntroScreen";
import SiteChrome from "./components/SiteChrome/SiteChrome";
import SceneDialogue from "./components/SceneDialogue/SceneDialogue";
import SceneBoundary, { supportsWebGL } from "./components/SceneBoundary/SceneBoundary";

function App() {
  const webgl = supportsWebGL();

  return (
    <>
      <IntroScreen />
      <main id="experience" className="stage">
        <h2 className="sr-only">The paper wall</h2>
        <p className="sr-only">
          A hand-drawn papercraft world. Use the arrow keys, page up and page
          down, the scroll wheel, or drag up and down to travel along the paper
          wall. The navigation controls sit in the lower right corner.
        </p>
        {webgl ? (
          <SceneBoundary>
            <Experience />
          </SceneBoundary>
        ) : (
          <SceneBoundary.Fallback />
        )}
      </main>
      <SiteChrome />
      <SceneDialogue />
    </>
  );
}

export default App;
