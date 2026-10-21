import approvalData from "../data/review-approvals.json";
import JSZip from "jszip";
import type { Exercise } from "../data/types";
import { assetUrl } from "./assetUrl";
export const reviewStatuses = {
  pending: "Пока не проверено",
  approved: "Всё хорошо",
  changes_requested: "Нужны исправления",
} as const;
export type ReviewStatus = keyof typeof reviewStatuses;
export interface CardReview {
  status: ReviewStatus;
  note: string;
  updatedAt?: string;
  approvalRevision?: string;
}
export type ReviewState = Record<string, CardReview>;
export const reviewStorageKey = "exercise-guide.technique-review.v1";
export const approvalRevision = approvalData.revision;
const approvals: Record<
  string,
  { status: "approved"; clearPreviousNote: boolean }
> = approvalData.approvals as Record<
  string,
  { status: "approved"; clearPreviousNote: boolean }
>;
function confirmedApproval(id: string): CardReview | undefined {
  return approvals[id]
    ? { status: "approved", note: "", approvalRevision }
    : undefined;
}
/** One-time owner confirmation. Later decisions carrying this revision stay editable. */
export function migrateConfirmedApprovals(
  state: ReviewState,
  fillMissing = true,
): ReviewState {
  const next = { ...state };
  for (const [id, approval] of Object.entries(approvals)) {
    const old = state[id];
    if ((!fillMissing && !old) || old?.approvalRevision === approvalRevision)
      continue;
    next[id] = {
      ...old,
      status: "approved",
      note: approval.clearPreviousNote ? "" : old?.note || "",
      approvalRevision,
    };
  }
  return next;
}
export function reviewFor(state: ReviewState, id: string): CardReview {
  return state[id] || confirmedApproval(id) || { status: "pending", note: "" };
}
export function parseStoredReview(value: string | null): ReviewState {
  if (!value) return {};
  const data = JSON.parse(value);
  if (
    data.version !== 1 ||
    typeof data.results !== "object" ||
    !data.results ||
    Array.isArray(data.results)
  )
    throw Error("Неверный формат сохранённых данных");
  const result: ReviewState = {};
  for (const [id, entry] of Object.entries(data.results)) {
    const v = entry as CardReview;
    if (
      !v ||
      !Object.hasOwn(reviewStatuses, v.status) ||
      typeof v.note !== "string"
    )
      throw Error("Повреждены данные проверки");
    result[id] = {
      status: v.status,
      note: v.note,
      ...(typeof v.updatedAt === "string" ? { updatedAt: v.updatedAt } : {}),
      ...(typeof v.approvalRevision === "string"
        ? { approvalRevision: v.approvalRevision }
        : {}),
    };
  }
  return result;
}
export function reviewReport(
  exercises: Exercise[],
  state: ReviewState,
): string {
  const groups: [ReviewStatus, string][] = [
    ["approved", "Одобрено"],
    ["changes_requested", "Нужны исправления"],
    ["pending", "Не проверено"],
  ];
  const parts = [
    "# Результаты проверки карточек",
    "Исправь только карточки из раздела 'Нужны исправления', сохраняя утверждённый стиль Exercise Card v1. Не изменяй одобренные карточки. Для непроверенных карточек не придумывай исправления.",
    "Оценки — личные решения пользователя, не профессиональная биомеханическая сертификация.",
  ];
  for (const [status, title] of groups) {
    parts.push(`## ${title}`);
    const entries = exercises.filter(
      (e) => reviewFor(state, e.id).status === status,
    );
    if (!entries.length) parts.push("Нет карточек.");
    for (const e of entries) {
      parts.push(
        `### ${e.nameEn} / ${e.nameRu}\nID: ${e.id}\nИзображение в ZIP: cards/${e.id}.png`,
      );
      if (status === "changes_requested")
        parts.push(
          "Комментарий пользователя (дословно):\n" +
            reviewFor(state, e.id).note,
        );
    }
  }
  return parts.join("\n\n") + "\n";
}
export function exportResults(
  exercises: Exercise[],
  state: ReviewState,
  imageFiles?: Map<string, string>,
) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    exercises: exercises.map((e) => ({
      id: e.id,
      nameRu: e.nameRu,
      nameEn: e.nameEn,
      ...reviewFor(state, e.id),
      imageFile: imageFiles?.get(e.instructionImage) || `cards/${e.id}.png`,
      sourceImage: e.instructionImage,
    })),
  };
}
export function importResults(
  text: string,
  exercises: Exercise[],
): ReviewState {
  const data = JSON.parse(text);
  if (data.version !== 1 || !Array.isArray(data.exercises))
    throw Error("Нужен review-results.json из экспорта проверки");
  const ids = new Set(exercises.map((e) => e.id));
  const result: ReviewState = {};
  for (const entry of data.exercises) {
    if (
      !entry ||
      typeof entry.id !== "string" ||
      !ids.has(entry.id) ||
      Object.hasOwn(result, entry.id) ||
      !Object.hasOwn(reviewStatuses, entry.status) ||
      typeof entry.note !== "string"
    )
      throw Error("JSON содержит неизвестные карточки или некорректные оценки");
    result[entry.id] = {
      status: entry.status,
      note: entry.note,
      ...(typeof entry.updatedAt === "string"
        ? { updatedAt: entry.updatedAt }
        : {}),
      ...(typeof entry.approvalRevision === "string"
        ? { approvalRevision: entry.approvalRevision }
        : {}),
    };
  }
  return migrateConfirmedApprovals(result, false);
}
export async function createReviewZip(
  exercises: Exercise[],
  state: ReviewState,
  fetchImage: (url: string) => Promise<ArrayBuffer> = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw Error("Не удалось загрузить изображение");
    return response.arrayBuffer();
  },
): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder("technique-review")!;
  const imageFiles = new Map<string, string>();
  for (const e of exercises) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.id))
      throw Error("Недопустимый ID карточки");
    if (imageFiles.has(e.instructionImage)) continue;
    const bytes = await fetchImage(assetUrl(e.instructionImage));
    const header = new Uint8Array(bytes, 0, Math.min(8, bytes.byteLength));
    if (
      header.length !== 8 ||
      ![137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => header[i] === v)
    )
      throw Error(
        `Не удалось получить PNG карточки «${e.nameRu}». ZIP не создан.`,
      );
    const filename = `cards/${e.id}.png`;
    imageFiles.set(e.instructionImage, filename);
    root.file(filename, bytes);
  }
  // The current library has one unique image per ID. Shared assets are stored once.
  let report = reviewReport(exercises, state);
  for (const e of exercises)
    report = report.replace(
      `Изображение в ZIP: cards/${e.id}.png`,
      `Изображение в ZIP: ${imageFiles.get(e.instructionImage)}`,
    );
  root.file("review-report.md", report);
  root.file(
    "review-results.json",
    JSON.stringify(exportResults(exercises, state, imageFiles), null, 2),
  );
  return zip.generateAsync({ type: "blob", compression: "STORE" });
}
