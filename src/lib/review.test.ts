import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import JSZip from "jszip";
import { exercises } from "./content";
import {
  reviewReport,
  createReviewZip,
  exportResults,
  importResults,
  parseStoredReview,
  type ReviewState,
} from "./review";
const note = "Первая строка: колено → вправо\n\n  Вторая строка с пробелами.  ";
const state: ReviewState = {
  [exercises[0].id]: { status: "approved", note: "" },
  [exercises[1].id]: { status: "changes_requested", note },
};
it("экспортирует все статусы и комментарий дословно, не меняя оценки", () => {
  const report = reviewReport(exercises, state);
  expect(report).toContain("## Одобрено");
  expect(report).toContain("## Нужны исправления");
  expect(report).toContain("## Не проверено");
  expect(report).toContain(note);
  expect(report).toContain("Не изменяй одобренные карточки");
  for (const e of exercises) expect(report).toContain(`ID: ${e.id}`);
  expect(state[exercises[1].id].note).toBe(note);
});
it("переносит JSON между браузерами без потери комментариев", () => {
  const exported = exportResults(exercises, state);
  const restored = importResults(JSON.stringify(exported), exercises);
  expect(restored[exercises[1].id]).toEqual(state[exercises[1].id]);
  expect(Object.keys(restored)).toHaveLength(13);
  expect(
    parseStoredReview(JSON.stringify({ version: 1, results: restored })),
  ).toEqual(restored);
  expect(() =>
    importResults('{"version":1,"exercises":[{"id":"unknown"}]}', exercises),
  ).toThrow();
});
it("ZIP содержит реальные PNG, корректные пути, JSON и весь отчёт", async () => {
  const items = exercises.slice(0, 2);
  const blob = await createReviewZip(items, state, async (url) => {
    const data = readFileSync(new URL(`../../public${url}`, import.meta.url));
    return data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    ) as ArrayBuffer;
  });
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  expect(
    await zip.file("technique-review/review-report.md")!.async("string"),
  ).toContain(note);
  const json = JSON.parse(
    await zip.file("technique-review/review-results.json")!.async("string"),
  );
  for (const e of json.exercises) {
    const data = await zip
      .file(`technique-review/${e.imageFile}`)!
      .async("uint8array");
    expect(data.length).toBeGreaterThan(1_000_000);
    expect(data.slice(0, 4)).toEqual(new Uint8Array([137, 80, 78, 71]));
  }
  expect(json.exercises[1].note).toBe(note);
});
it("не экспортирует HTML вместо отсутствующего изображения", async () => {
  await expect(
    createReviewZip(
      exercises.slice(0, 1),
      {},
      async () => new TextEncoder().encode("<html>not an image</html>").buffer,
    ),
  ).rejects.toThrow("PNG");
});
