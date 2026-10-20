import { readFileSync, existsSync } from "node:fs";
const exercises = JSON.parse(
  readFileSync(new URL("../src/data/exercises.json", import.meta.url), "utf8"),
);
const workouts = JSON.parse(
  readFileSync(new URL("../src/data/workouts.json", import.meta.url), "utf8"),
);
const paths = new Set([
  ...exercises.flatMap((e) => [e.thumbnail, e.instructionImage]),
  ...workouts.map((w) => w.coverImage).filter(Boolean),
]);
const missing = [...paths].filter(
  (p) => !existsSync(new URL(`../public${p}`, import.meta.url)),
);
if (missing.length) {
  console.error("Отсутствуют исходные изображения:\n" + missing.join("\n"));
  process.exitCode = 1;
} else console.log(`Все изображения доступны (${paths.size}).`);
