import rawExercises from "../data/exercises.json";
import rawWorkouts from "../data/workouts.json";
import rawFixtures from "../data/workouts.fixtures.json";
import {
  exerciseTypes,
  muscleGroups,
  type Exercise,
  type Workout,
} from "../data/types";

type RecordValue = Record<string, unknown>;
const isRecord = (v: unknown): v is RecordValue =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const nonempty = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;
const slug = (v: unknown) =>
  typeof v === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
const localImage = (v: unknown) =>
  typeof v === "string" &&
  /^\/images\/[a-zA-Z0-9_./-]+\.(png|jpe?g|webp|avif|svg)$/.test(v) &&
  !v.includes("..");
export function validateContent(
  exercises: unknown,
  workouts: unknown,
): string[] {
  const errors: string[] = [];
  if (!Array.isArray(exercises) || !Array.isArray(workouts))
    return ["Данные должны быть массивами"];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  exercises.forEach((e: unknown, i: number) => {
    if (!isRecord(e)) {
      errors.push(`Упражнение ${i}: неверная запись`);
      return;
    }
    for (const key of ["id", "nameRu", "nameEn", "imageAlt"])
      if (!nonempty(e[key])) errors.push(`Упражнение ${i}: ${key}`);
    if (!slug(e.slug)) errors.push(`Упражнение ${i}: slug`);
    if (ids.has(String(e.id)) || slugs.has(String(e.slug)))
      errors.push(`Дубликат упражнения ${e.id}`);
    ids.add(String(e.id));
    slugs.add(String(e.slug));
    if (!Array.isArray(e.aliases) || !e.aliases.every(nonempty))
      errors.push(`Упражнение ${i}: aliases`);
    if (
      !Array.isArray(e.muscleGroups) ||
      !e.muscleGroups.length ||
      !e.muscleGroups.every((m) => muscleGroups.includes(m))
    )
      errors.push(`Упражнение ${i}: muscleGroups`);
    if (!exerciseTypes.includes(e.exerciseType as never))
      errors.push(`Упражнение ${i}: exerciseType`);
    if (!localImage(e.thumbnail) || !localImage(e.instructionImage))
      errors.push(`Упражнение ${i}: путь изображения`);
    if (!["verified", "needs-review"].includes(String(e.status)))
      errors.push(`Упражнение ${i}: status`);
    if (e.status === "needs-review" && !nonempty(e.reviewNote))
      errors.push(`Упражнение ${i}: reviewNote`);
  });
  const workoutIds = new Set();
  const workoutSlugs = new Set();
  workouts.forEach((w: unknown, i: number) => {
    if (!isRecord(w)) {
      errors.push(`Тренировка ${i}: неверная запись`);
      return;
    }
    if (
      !nonempty(w.id) ||
      !slug(w.slug) ||
      !nonempty(w.title) ||
      !nonempty(w.description)
    )
      errors.push(`Тренировка ${i}: обязательные поля`);
    if (workoutIds.has(w.id) || workoutSlugs.has(w.slug))
      errors.push(`Дубликат тренировки ${w.id}`);
    workoutIds.add(w.id);
    workoutSlugs.add(w.slug);
    if (!["verified", "needs-review"].includes(String(w.status)))
      errors.push(`Тренировка ${i}: status`);
    if (w.coverImage !== undefined && !localImage(w.coverImage))
      errors.push(`Тренировка ${i}: coverImage`);
    if (
      w.sourceUrl !== undefined &&
      (typeof w.sourceUrl !== "string" || !/^https:\/\//.test(w.sourceUrl))
    )
      errors.push(`Тренировка ${i}: sourceUrl`);
    if (!Array.isArray(w.exercises) || !w.exercises.length) {
      errors.push(`Тренировка ${i}: нет упражнений`);
      return;
    }
    const occurrences = new Set();
    const orders = new Set();
    w.exercises.forEach((o: unknown) => {
      if (!isRecord(o)) {
        errors.push(`Тренировка ${i}: неверное вхождение`);
        return;
      }
      if (!nonempty(o.id) || occurrences.has(o.id))
        errors.push(`Тренировка ${i}: повтор id вхождения`);
      occurrences.add(o.id);
      if (!ids.has(String(o.exerciseId)))
        errors.push(`Тренировка ${i}: неизвестное упражнение ${o.exerciseId}`);
      if (
        !Number.isInteger(o.order) ||
        Number(o.order) < 1 ||
        orders.has(o.order)
      )
        errors.push(`Тренировка ${i}: неверный порядок`);
      orders.add(o.order);
    });
    if (w.exercises.some((_, index) => !orders.has(index + 1)))
      errors.push(`Тренировка ${i}: порядок должен быть непрерывным`);
  });
  return errors;
}
export const contentErrors = validateContent(rawExercises, [
  ...rawWorkouts,
  ...rawFixtures,
]);
export const exercises = rawExercises as Exercise[];
export const workouts = rawWorkouts as Workout[];
export const workoutFixtures = rawFixtures as Workout[];
export function filterExercises(
  items: Exercise[],
  query: string,
  muscle: string,
  type: string,
): Exercise[] {
  const normalize = (s: string) =>
    s.toLocaleLowerCase("ru").replace(/ё/g, "е").trim();
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return items.filter((e) => {
    const search = normalize([e.nameRu, e.nameEn, ...e.aliases].join(" "));
    return (
      words.every((word) => search.includes(word)) &&
      (!muscle || e.muscleGroups.includes(muscle as never)) &&
      (!type || e.exerciseType === type)
    );
  });
}
