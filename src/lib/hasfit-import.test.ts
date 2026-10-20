import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import sourceExercises from "../../docs/hasfit-source/exercises.json";
import sourceWorkout from "../../docs/hasfit-source/workout.json";
import imageHashes from "../../docs/hasfit-source/image-sha256.json";
import {
  exercises,
  workouts,
  getExerciseById,
  validateContent,
} from "./content";

describe("импорт предоставленного пакета HASfit", () => {
  it("сохраняет все исходные ID, названия, категории и статусы источника", () => {
    for (const source of sourceExercises) {
      const e = exercises.find((e) => e.id === source.id)!;
      expect(e).toBeDefined();
      expect(e.nameRu).toBe(source.nameRu);
      expect(e.nameEn).toBe(source.nameEn);
      expect(e.muscleGroups).toEqual(
        expect.arrayContaining(source.muscleGroups),
      );
      expect(e.sourceStatus).toBe(source.status);
      expect(e.status).toBe("needs-review");
    }
  });
  it("точно сохраняет 25 вхождений, порядок, повторы и ID тренировки", () => {
    const w = workouts.find((w) => w.id === sourceWorkout.id)!;
    expect(w.exercises).toEqual(sourceWorkout.exercises);
    expect(w.verificationStatus).toBe("sequence-unverified");
    expect(w.originalTitle).toBe(sourceWorkout.title);
  });
  it("сохраняет прежние ссылки приседа и алиасы без дубликата", () => {
    expect(exercises.filter((e) => e.slug === "db-squat")).toHaveLength(1);
    expect(getExerciseById("ex-db-squat")).toBe(getExerciseById("db-squat"));
    expect(getExerciseById("db-squat")?.aliases).toContain("скват");
  });
  it("исправляет перепутанные ссылки по заголовкам и позам на карточках", () => {
    expect(getExerciseById("one-leg-hip-up")?.instructionImage).toBe(
      "/images/hasfit/03_pendulum_march.png",
    );
    expect(getExerciseById("pendulum-march")?.instructionImage).toBe(
      "/images/hasfit/02_one_leg_hip_up.png",
    );
  });
  it("сохраняет все 13 полноразмерных PNG без изменения байтов", () => {
    for (const [name, hash] of Object.entries(imageHashes)) {
      const bytes = readFileSync(
        new URL(`../../public/images/hasfit/${name}`, import.meta.url),
      );
      expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(hash);
      expect(bytes.readUInt32BE(16)).toBeGreaterThanOrEqual(1000);
    }
  });
  it("не допускает выдавать непроверенный порядок за подтверждённый", () => {
    expect(
      validateContent(exercises, [{ ...workouts[0], status: "verified" }]).some(
        (e) => e.includes("неподтверждённая"),
      ),
    ).toBe(true);
    expect(getExerciseById("v-sit-reach")?.reviewIssues?.join(" ")).toContain(
      "сгибание",
    );
  });
});
