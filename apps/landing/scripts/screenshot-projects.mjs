// Capture a fresh screenshot of each project website and write it back to the
// committed asset used by the Projects section.
//
// For every `src/projects/*.md` that has a `url`, this script:
//   1. opens the site in light and dark 1280x800 Chromium viewports,
//   2. screenshots each theme,
//   3. composites each shot centered with X/Y padding on a deterministic
//      muted color seeded by the project name,
//   4. writes a 16:9 (1280x720) .webp to the theme-specific image path.
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
const THEMES = [
  { name: "light", colorScheme: "light" },
  { name: "dark", colorScheme: "dark" },
];

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

/** Create a repeatable pseudo-random number generator from a string seed. */
function seededRandom(seed) {
  let state = 2166136261;

  for (const character of seed) {
    state ^= character.charCodeAt(0);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state = Math.imul(1664525, state) + 1013904223;
    return (state >>> 0) / 2 ** 32;
  };
}

/** Muted solid color derived from the project name, with theme-safe lightness. */
function mutedColorFor(projectName, theme) {
  const random = seededRandom(projectName);
  const hue = Math.floor(random() * 360);
  const saturation = 25 + Math.floor(random() * 20); // 25-45%
  const lightness =
    theme === "dark"
      ? 18 + Math.floor(random() * 12) // 18-30%
      : 70 + Math.floor(random() * 12); // 70-82%
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

/** Composite the screenshot centered on a seeded muted canvas, output webp. */
async function padOnColor(screenshotBuffer, outPath, projectName, theme) {
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
    create: {
      width,
      height,
      channels: 4,
      background: mutedColorFor(projectName, theme),
    },
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
    if (!data.url || !data.imageUrl || !data.darkImageUrl) {
      console.warn(
        `Skipping ${file}: url, imageUrl, and darkImageUrl are required.`,
      );
      continue;
    }
    targets.push({
      name: data.name ?? file,
      url: data.url,
      // imageUrl is the light image; both paths are relative to the .md file.
      outPaths: {
        light: resolve(PROJECTS_DIR, data.imageUrl),
        dark: resolve(PROJECTS_DIR, data.darkImageUrl),
      },
    });
  }

  if (targets.length === 0) {
    console.log("No projects with url + imageUrl found.");
    return;
  }

  const browser = await chromium.launch();
  const contexts = new Map();
  let ok = 0;

  try {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: VIEWPORT,
        colorScheme: theme.colorScheme,
        deviceScaleFactor: 2,
      });

      // Pre-seed the cookie-consent choice so the consent banner (which
      // renders only when the key is unset, e.g. blog.ninprd.com's
      // CookieConsentBanner) never appears in the screenshot. Runs before
      // any page script on load.
      await context.addInitScript(() => {
        try {
          localStorage.setItem("cookie-consent", "rejected");
        } catch {
          // Ignore storage access errors (e.g. sandboxed pages).
        }
      });

      contexts.set(theme.name, context);
    }

    for (const target of targets) {
      for (const theme of THEMES) {
        const context = contexts.get(theme.name);
        const page = await context.newPage();
        try {
          await page.goto(target.url, {
            waitUntil: "load",
            timeout: NAV_TIMEOUT_MS,
          });
          await page.waitForTimeout(SETTLE_MS);
          const shot = await page.screenshot({ type: "png" });
          await padOnColor(
            shot,
            target.outPaths[theme.name],
            target.name,
            theme.name,
          );
          console.log(`✓ ${target.name} (${theme.name}) -> ${target.url}`);
          ok++;
        } catch (err) {
          console.warn(
            `✗ ${target.name} (${theme.name}) failed, keeping committed image: ${err.message}`,
          );
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await Promise.all([...contexts.values()].map((context) => context.close()));
    await browser.close();
  }

  console.log(
    `\nDone. ${ok}/${targets.length * THEMES.length} theme screenshots refreshed.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
