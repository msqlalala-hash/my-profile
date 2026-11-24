# 😊 Mr. Panda's Psychologically Safe Portfolio 🐼

### ▶ **[打开成品 · Live demo](https://msqlalala-hash.github.io/my-profile/)**

手绘纸艺 3D 作品集（实时 WebGL 渲染，非视频）。滚轮 / 拖动 / 方向键沿纸墙穿行，每个场景贴出一张简历便签。

> 部署在 GitHub Pages：`gh-pages` 分支存放构建产物，源码在 `main`。首次打开需下载约 16MB 模型与贴图。

> 原版站点：[mr-pandas-psychologically-safe-portfolio.com](https://www.mr-pandas-psychologically-safe-portfolio.com/) ｜ [Article](https://tympanus.net/codrops/2025/12/30/the-increasing-importance-of-psychological-safety-and-self-awareness-for-creative-work/?_thumbnail_id=107253) ｜ [Tutorial](https://www.youtube.com/watch?v=zyWD2E8AHCg&feature=youtu.be)

This repo contains code of Mr. Panda's Portfolio for a Codrops article!! It's a concept portfolio website created with [Blender](https://www.blender.org/), [Three.js](https://threejs.org/), and [Krita](https://krita.org/en/). Let's fight back against toxicity in the creative industry.

![Page screenshot](public/media/og-image.webp?raw=true "Page What")

# Credits!!! 💖

- [Intro Screen Font](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- [Notebook Paper Material](https://superhivemarket.com/products/crafty-asset-pack)
- [On a stick idea](https://x.com/mesqme)
- [Dragon Reference Image](https://studycli.org/chinese-culture/chinese-dragons/)
- [Tracing Kpop Demon Hunters Image](https://media-cldnry.s-nbcnews.com/image/upload/t_fit-1000w,f_auto,q_auto:best/rockcms/2025-07/250709-Kpop-Demon-Hunters-vl-256p-ea5850.jpg)
- [Egyption Artifact Reference Image One](https://www.teacherspayteachers.com/Product/Egyptian-Artifacts-Clipart-Set-1-4283355)
- [Egyption Artifact Reference Image Two](https://media.istockphoto.com/id/1188022995/vector/egyptian-artifacts-vector-illustration-a-set-of-sacred-symbols-and-decorations-of-ancient.jpg?s=612x612&w=0&k=20&c=K0eAV0wofNJhBxAXtAZOQHHHUiiUMGUcucgx5tvIzyc=)

# Extra info

- Won [FWA of the day!](https://thefwa.com/cases/mr-pandas-psychologically-safe-portfolio).
- Won [SOTD on Awwwards!](https://www.awwwards.com/sites/mr-pandas-paper-portfolio).

# Areas of improvement / things to do

- Repetitive code could be cleaned up lol
- Generate hitboxes for hovered items that way it won't leave the area and flicker back constantly.
- Add some cool burning paper shader effects.
- Add a night mode.
- Use texture atlases/spritesheets for animations.
- More easter eggs.
- Try making one that go forwards and diagonal or rotates camera upside down.
- Try making different scenes and cute paper animations like a campfire.
- Better loading screen.
- Text box so the panda says some stuff. ✅ (see "Résumé notes" below)
- Adjust curve for mobile devices. ✅ (see "Camera framing" below)

---

# Résumé notes — how to put your own CV in

Every scene now speaks. As the camera reaches a new stretch of the paper wall, a
taped index card appears in the lower-right (a compact note on phones, tap
"阅读全文" to expand) with one chapter of the CV, in Mr. Panda's voice.

All content lives in one file: **`src/data/cv.js`**. Nothing else needs editing.

```js
export const profile = {
  name: "Mr. Panda",              // shown as the speaker
  role: "Human Resources Executive",
  tab: "Résumé",                  // label of the tab when the note is hidden
};

export const chapters = [
  {
    id: "intro",
    no: "01",
    range: [0, 0.13],             // progress along the wall: 0 = opening paper
    en: "Hello, I'm Mr. Panda.",  // English headline (matches the wall copy)
    zh: "我把简历贴在了这面纸上……",  // one line of voice
    body: ["段落一", "段落二"],     // Chinese detail paragraphs
    meta: [{ k: "Based in", v: "Shanghai, China" }],
  },
  // …02–05
];
```

Chapter → scene mapping, measured from the camera path:

| # | `range` | What the camera parks in front of |
|---|---------|-----------------------------------|
| 01 | `0 – 0.13` | Welcome wall: airplane, panda on the bicycle, ABOUT ME note |
| 02 | `0.13 – 0.31` | Cherry blossom, waterfall, pagoda, samurai panda |
| 03 | `0.31 – 0.53` | Pirate ship, desert island, camel, the "Work Experience" note |
| 04 | `0.53 – 0.73` | Pyramid, "Featured Work" publications, the haunted house |
| 05 | `0.73 – 1.00` | "Reach out anytime", the closing single sheet |

The shipped text is placeholder content taken from the wall's own fictional CV
(Panda Corp / Ape Inc.) so the demo reads coherently — replace it with yours.

## Camera framing

Desktop keeps the measured reference framing (fov 35, zoom 1). Portrait and
tablet widen the projection and pan along the wall — `src/lib/framing.js` — so
the focal subject survives on narrow screens instead of being cropped. Both
anchors are commented in that file.

## Interactions

- Wheel / trackpad / touch drag / mouse drag → travel along the wall (loops).
- Keyboard: `↓ → PageDown Space` forward, `↑ ← PageUp` back, `Home` / `End`.
- Corner buttons step one scene; the chapter card's arrows jump a chapter.
- Hover the airplane, the `intro` / `about` notes, hire-me sheets and the camel
  to pull them off the wall (original scene graph behaviour, untouched).
- `Esc` hides the résumé note; the `RÉSUMÉ` tab brings it back (focus returns).
- `prefers-reduced-motion: reduce` → the scene freezes on a composed frame and
  the camera jumps instead of easing; no idle wobble.

## Deploy (GitHub Pages)

The live site is served from the `gh-pages` branch at
`https://msqlalala-hash.github.io/my-profile/`. Runtime asset URLs are written as
root-absolute paths (`/textures/…`), so they go through `asset()` in
`src/lib/asset.js`, which prefixes `import.meta.env.BASE_URL` — a no-op at `/`,
`/my-profile/` on Pages. `BrowserRouter` uses the same base.

```bash
npx vite build --base=/my-profile/ --outDir pages-build
# copy pages-build/* to the root of the gh-pages branch, then push
```

## Reconstruction notes

Rebuilt from the Codrops source repository as the implementation authority:

- Source: https://github.com/andrewwoan/mr-pandas-psychologically-safe-portfolio
- Live: https://www.mr-pandas-psychologically-safe-portfolio.com/
- Credit: Andrew Woan — Codrops, MIT licence (`LICENSE.md`).

Reference pack recorded for visual QA **only** — these URLs are never rendered
by the app (no `img` / `video` / `source` / CSS background / texture / iframe):

```
poster:        https://showcase.foxora.studio/thumbnails/curated-codrops-papercraft-portfolio.webp
motion:        https://showcase.foxora.studio/motion/codrops-papercraft-portfolio.webp
originalVisual:https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2025/12/handpaper-400x300.jpg?x48895
frame:         960 × 610 (aspect 1.5738)
```

Intentional additions on top of the untouched scene graph: the résumé card, the
corner navigation, skip link, `<main>` landmark, WebGL fallback and reduced-motion
handling. Primary visual, materials, shaders, models and copy are the source's.

