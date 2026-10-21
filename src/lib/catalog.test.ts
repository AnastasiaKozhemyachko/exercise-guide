import { expect, it } from "vitest";
import { searchWorkouts, workoutEnglish, presentOptions } from "./catalog";
import { workouts, exercises, filterExercises } from "./content";
import { equipmentTypes } from "../data/types";
it("ищет на обоих языках и сохраняет исходный порядок без сортировки", () => {
  expect(searchWorkouts(workouts, "LEG AND BUTT lower body")).toHaveLength(1);
  expect(searchWorkouts(workouts, "ноги ягодицы")).toHaveLength(1);
  const list = [
    { ...workouts[0], id: "z", nameEn: "Z workout" },
    { ...workouts[0], id: "a", nameEn: "A workout" },
  ];
  expect(searchWorkouts(list, "").map((w) => w.id)).toEqual(["z", "a"]);
  expect(workoutEnglish(workouts[0])).toBe(
    "30 Min Legs and Glutes Workout with Dumbbells at Home Leg and Butt Lower Body Workout with Weights",
  );
});
it("фильтрует по явным данным, не выводит категории из названия", () => {
  expect(
    searchWorkouts(workouts, "", {
      muscle: "Ягодицы",
      type: "Силовые",
      equipment: "Гантели",
    }),
  ).toHaveLength(1);
  expect(searchWorkouts(workouts, "", { muscle: "Грудь" })).toEqual([]);
  expect(searchWorkouts(workouts, "", { type: "Мобильность" })).toEqual([]);
  expect(searchWorkouts(workouts, "", { equipment: "Другое" })).toEqual([]);
  expect(
    searchWorkouts([{ ...workouts[0], equipment: undefined }], "dumbbells", {
      equipment: "Гантели",
    }),
  ).toEqual([]);
  expect(
    filterExercises(exercises, "", "Ноги", "Силовые", "Гантели").map(
      (e) => e.id,
    ),
  ).toContain("db-short-step-lunge");
  expect(
    filterExercises(exercises, "", "Ноги", "Силовые", "Собственный вес").map(
      (e) => e.id,
    ),
  ).not.toContain("db-short-step-lunge");
  expect(
    presentOptions(
      equipmentTypes,
      exercises.flatMap((e) => e.equipment || []),
    ).map((o) => o.value),
  ).toEqual(["Гантели", "Собственный вес"]);
});
