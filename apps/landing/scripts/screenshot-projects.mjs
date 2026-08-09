// Capture a fresh screenshot of each project website and write it back to the
// committed asset used by the Projects section.
//
// For every `src/projects/*.md` that has a `url`, this script:
//   1. opens the site in a dark-scheme 1280x800 Chromium viewport,
//   2. screenshots it,
//   3. composites the shot centered with X/Y padding on a muted random color,
//   4. writes a 16:9 (1280x720) .webp to the file's `imageUrl` path.
//
// If a site fails to load, that project is skipped so its committed screenshot
// stays in place as a fallback.

import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";
import { chromium } from "playwright";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = resolve(__dirname, "../src/projects");

// Capture viewport used for the browser screenshot.
const VIEWPORT = { width: 1280, height: 800 };
// Final output canvas. 16:9 to match the `aspect-video` project card box, so
// the committed image is not stretched when displayed.
const OUTPUT = { width: 1280, height: 720 };
// Fraction of each axis the colored pad takes. The screenshot fills the rest.
// Split evenly between the two sides of that axis.
const PAD_X = 0.2;
const PAD_Y = 0.2;
// Corner radius (px) applied to the inner screenshot.
const CORNER_RADIUS = 24;
// Wait for the load event, then a short settle so fonts/paint finish.
const SETTLE_MS = 1500;
const NAV_TIMEOUT_MS = 20000;

/** Muted random solid color, kept dark so a dark screenshot sits comfortably. */
function randomMutedColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 25 + Math.floor(Math.random() * 20); // 25-45%
  const lightness = 18 + Math.floor(Math.random() * 12); // 18-30%
  const { r, g, b } = hslToRgb(hue, saturation, lightness);
  return { r, g, b, alpha: 1 };
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
  };
}

/** Composite the screenshot centered on a random muted canvas, output webp. */
async function padOnRandomColor(screenshotBuffer, outPath) {
  const { width, height } = OUTPUT;
  const innerW = Math.round(width * (1 - PAD_X));
  const innerH = Math.round(height * (1 - PAD_Y));

  // Rounded-rect mask so the screenshot has soft corners over the pad color.
  const mask = Buffer.from(
    `<svg width="${innerW}" height="${innerH}"><rect width="${innerW}" height="${innerH}" rx="${CORNER_RADIUS}" ry="${CORNER_RADIUS}"/></svg>`,
  );

  // `cover` scales the capture to fill the inner box and center-crops the
  // overflow, so the screenshot keeps its true proportions (no stretching).
  const inner = await sharp(screenshotBuffer)
    .resize(innerW, innerH, { fit: "cover", position: "top" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  await sharp({
    create: { width, height, channels: 4, background: randomMutedColor() },
  })
    .composite([
      {
        input: inner,
        top: Math.round((height - innerH) / 2),
        left: Math.round((width - innerW) / 2),
      },
    ])
    .webp({ quality: 80 })
    .toFile(outPath);
}

async function main() {
  const files = (await readdir(PROJECTS_DIR)).filter((f) => f.endsWith(".md"));

  const targets = [];
  for (const file of files) {
    const full = resolve(PROJECTS_DIR, file);
    const { data } = matter(await readFile(full, "utf8"));
    if (!data.url || !data.imageUrl) continue;
    targets.push({
      name: data.name ?? file,
      url: data.url,
      // imageUrl is relative to the .md file's directory.
      outPath: resolve(PROJECTS_DIR, data.imageUrl),
    });
  }

  if (targets.length === 0) {
    console.log("No projects with url + imageUrl found.");
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: "dark",
    deviceScaleFactor: 2,
  });

  // Pre-seed the cookie-consent choice so the consent banner (which renders
  // only when the key is unset, e.g. blog.ninprd.com's CookieConsentBanner)
  // never appears in the screenshot. Runs before any page script on load.
  await context.addInitScript(() => {
    try {
      localStorage.setItem("cookie-consent", "rejected");
    } catch {
      // Ignore storage access errors (e.g. sandboxed pages).
    }
  });

  let ok = 0;
  for (const target of targets) {
    const page = await context.newPage();
    try {
      await page.goto(target.url, {
        waitUntil: "load",
        timeout: NAV_TIMEOUT_MS,
      });
      await page.waitForTimeout(SETTLE_MS);
      const shot = await page.screenshot({ type: "png" });
      await padOnRandomColor(shot, target.outPath);
      console.log(`✓ ${target.name} -> ${target.url}`);
      ok++;
    } catch (err) {
      console.warn(
        `✗ ${target.name} (${target.url}) failed, keeping committed image: ${err.message}`,
      );
    } finally {
      await page.close();
    }
  }

  await context.close();
  await browser.close();

  console.log(`\nDone. ${ok}/${targets.length} screenshots refreshed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
