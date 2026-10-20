import { describe, expect, it } from "vitest";
import {
  exercises,
  workouts,
  workoutFixtures,
  filterExercises,
  validateContent,
  getExerciseById,
} from "./content";
import type { Exercise } from "../data/types";

describe("целостность контента", () => {
  it("проверяет реальные данные и отдельные примеры", () => {
    expect(
      validateContent(exercises, [...workouts, ...workoutFixtures]),
    ).toEqual([]);
    expect(exercises).toHaveLength(13);
    expect(workouts).toHaveLength(1);
    expect(workouts[0].exercises).toHaveLength(25);
    expect(workouts[0].verificationStatus).toBe("sequence-unverified");
    expect(exercises.every((e) => e.status === "needs-review")).toBe(true);
    expect(getExerciseById("ex-db-squat")?.id).toBe("db-squat");
    expect(workoutFixtures[0].status).toBe("needs-review");
  });
  it("сохраняет повторные упражнения с разными id вхождений", () => {
    expect(workoutFixtures[0].exercises).toHaveLength(2);
    expect(
      new Set(workoutFixtures[0].exercises.map((o) => o.exerciseId)).size,
    ).toBe(1);
    expect(validateContent(exercises, workoutFixtures)).toEqual([]);
  });
  it("отклоняет неизвестное упражнение, повтор id и пропуск порядка", () => {
    const w = structuredClone(workoutFixtures);
    w[0].exercises[1] = {
      ...w[0].exercises[0],
      exerciseId: "missing",
      order: 4,
    };
    const errors = validateContent(exercises, w);
    expect(errors.some((e) => e.includes("неизвестное"))).toBe(true);
    expect(errors.some((e) => e.includes("повтор id"))).toBe(true);
    expect(errors.some((e) => e.includes("непрерывным"))).toBe(true);
  });
  it("отклоняет дубликаты slug и неверные категории", () => {
    expect(
      validateContent([...exercises, { ...exercises[0], id: "other" }], []),
    ).not.toEqual([]);
    expect(
      validateContent([{ ...exercises[0], muscleGroups: ["unknown"] }], []),
    ).not.toEqual([]);
  });
  it("требует пояснения для неподтверждённой техники", () => {
    expect(
      validateContent(
        [{ ...exercises[0], status: "needs-review", reviewNote: undefined }],
        [],
      ),
    ).not.toEqual([]);
  });
  it("отклоняет опасные пути изображений", () => {
    expect(
      validateContent(
        [{ ...exercises[0], instructionImage: "/images/../private.png" }],
        [],
      ),
    ).not.toEqual([]);
  });
});
describe("поиск и фильтры", () => {
  it.each([
    "ПРИСЕД",
    "db SQUAT",
    "  dumbbell  squat ",
    "скват",
    "приседания с гантелями",
  ])("находит по запросу %s", (query) => {
    expect(
      filterExercises([exercises[0]], query, "", "").map((e) => e.id),
    ).toEqual(["db-squat"]);
  });
  it("нормализует е и ё", () => {
    const item = { ...exercises[0], aliases: ["подъём"] };
    expect(filterExercises([item], "подъем", "", "")).toHaveLength(1);
  });
  it("применяет пересечение фильтров", () => {
    const other: Exercise = {
      ...exercises[0],
      id: "other",
      muscleGroups: ["Спина"],
      exerciseType: "Мобильность",
    };
    expect(
      filterExercises([exercises[0], other], "squat", "Ноги", "Силовые"),
    ).toEqual([exercises[0]]);
    expect(filterExercises([exercises[0]], "", "Спина", "")).toEqual([]);
    expect(filterExercises([exercises[0]], "", "Ноги", "Разминка")).toEqual([]);
    expect(filterExercises(exercises, "неизвестное", "", "")).toEqual([]);
  });
});
