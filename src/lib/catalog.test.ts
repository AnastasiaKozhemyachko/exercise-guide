import { expect, it } from "vitest";
import { searchWorkouts, workoutEnglish } from "./catalog";
import { workouts } from "./content";
const a = {
  ...workouts[0],
  id: "a",
  title: "Ягодицы",
  nameEn: "Arms",
  aliases: ["домашняя сила"],
};
const b = {
  ...workouts[0],
  id: "b",
  title: "Бёдра",
  nameEn: "Zumba",
  aliases: [],
};
it("ищет по русскому, полному английскому названию и алиасам без учёта регистра", () => {
  expect(
    searchWorkouts(workouts, "LEG AND BUTT lower body", "en"),
  ).toHaveLength(1);
  expect(searchWorkouts(workouts, "ноги ягодицы", "ru")).toHaveLength(1);
  expect(searchWorkouts([a], "ДОМАШНЯЯ", "en")).toEqual([a]);
  expect(searchWorkouts([a], "несуществующее", "en")).toEqual([]);
  expect(workoutEnglish(workouts[0])).toBe(
    "30 Min Legs and Glutes Workout with Dumbbells at Home Leg and Butt Lower Body Workout with Weights",
  );
});
it("сортирует по выбранному языку, не изменяя исходный массив", () => {
  const list = [b, a];
  expect(searchWorkouts(list, "", "en").map((w) => w.id)).toEqual(["a", "b"]);
  expect(searchWorkouts(list, "", "ru").map((w) => w.id)).toEqual(["b", "a"]);
  expect(list).toEqual([b, a]);
});
