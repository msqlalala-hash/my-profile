// Asset URLs in this project are written as root-absolute paths ("/textures/…"),
// which is what the original implementation assumes. GitHub Pages serves the app
// from a sub-path, so every runtime asset URL goes through `asset()` — it is a
// no-op at "/" and prefixes the base path on Pages. `import.meta.env.BASE_URL`
// ends with a slash, the stored paths start with one, hence the trim.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export const asset = (path) => (BASE ? `${BASE}${path}` : path);
