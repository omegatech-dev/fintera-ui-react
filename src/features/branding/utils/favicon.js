/**
 * Browser tab favicon management.
 *
 * The configured brand logo is a horizontal wordmark (4:1 or wider), so it can
 * never work as a favicon — squeezing it into 16 px produces an illegible
 * strip (see OpenSpec `fix-branding-logo-refresh`). Instead:
 *
 * - Default branding keeps the bundled icons declared in `index.html`.
 * - Custom branding swaps them for a generated monogram: the first letter of
 *   the application name on the brand green, drawn on a 64×64 canvas so it
 *   stays crisp at 16/32 px.
 *
 * Keep `BUNDLED_ICONS` aligned with the `<link rel="icon">` tags in
 * `index.html` — these functions recreate them when branding reverts.
 */

// The design's brand green (Tailwind `success-400`); no `primary-400` scale exists.
const MONOGRAM_BACKGROUND = "#16A34A";
const MONOGRAM_SIZE = 64;

const MONOGRAM_SELECTOR = 'link[rel="icon"][data-monogram="true"]';
const BUNDLED_ICONS_SELECTOR = 'link[rel="icon"]:not([data-monogram="true"])';

const BUNDLED_ICONS = [
  { href: "/favicon.ico", sizes: "any" },
  { href: "/pwa-64x64.png", sizes: "64x64", type: "image/png" },
];

function drawMonogram(initial) {
  const canvas = document.createElement("canvas");
  canvas.width = MONOGRAM_SIZE;
  canvas.height = MONOGRAM_SIZE;
  const context = canvas.getContext && canvas.getContext("2d");
  if (!context) return null; // jsdom/tests or very old browsers

  context.fillStyle = MONOGRAM_BACKGROUND;
  if (typeof context.roundRect === "function") {
    context.beginPath();
    context.roundRect(0, 0, MONOGRAM_SIZE, MONOGRAM_SIZE, 14);
    context.fill();
  } else {
    context.fillRect(0, 0, MONOGRAM_SIZE, MONOGRAM_SIZE);
  }

  context.fillStyle = "#FFFFFF";
  context.font = `bold ${MONOGRAM_SIZE * 0.6}px Urbanist, Arial, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(initial, MONOGRAM_SIZE / 2, MONOGRAM_SIZE / 2 + 2);

  const href = canvas.toDataURL("image/png");
  return href && href !== "data:," ? href : null;
}

/**
 * Replace the bundled icon links with the monogram favicon.
 * Returns `false` (leaving the head untouched) when a canvas is unavailable.
 */
export function setMonogramFavicon(initial) {
  const href = drawMonogram(initial);
  if (!href) return false;

  document.querySelectorAll(BUNDLED_ICONS_SELECTOR).forEach((link) => link.remove());

  let link = document.querySelector(MONOGRAM_SELECTOR);
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.dataset.monogram = "true";
    document.head.appendChild(link);
  }
  link.type = "image/png";
  link.sizes = "any";
  link.href = href;
  return true;
}

/** Remove the monogram and bring back the bundled icons from `index.html`. */
export function restoreBundledFavicon() {
  document.querySelectorAll(MONOGRAM_SELECTOR).forEach((link) => link.remove());
  if (document.querySelector(BUNDLED_ICONS_SELECTOR)) return;

  for (const icon of BUNDLED_ICONS) {
    const link = document.createElement("link");
    link.rel = "icon";
    if (icon.type) link.type = icon.type;
    if (icon.sizes) link.sizes = icon.sizes;
    link.href = icon.href;
    document.head.appendChild(link);
  }
}
