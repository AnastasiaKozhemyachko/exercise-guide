import type { Workout } from "../data/types";
const normalize = (s: string) =>
  s.toLocaleLowerCase("ru").replace(/ё/g, "е").trim();
export function workoutEnglish(w: Workout) {
  return w.nameEn || w.originalTitle || w.title;
}
export interface WorkoutFilters {
  muscle?: string;
  type?: string;
  equipment?: string;
}
/** Preserve source order. Filters use explicit metadata, never title heuristics. */
export function searchWorkouts(
  items: Workout[],
  query: string,
  filters: WorkoutFilters = {},
): Workout[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return items.filter(
    (w) =>
      words.every((word) =>
        normalize(
          [w.title, workoutEnglish(w), w.source, ...(w.aliases || [])].join(
            " ",
          ),
        ).includes(word),
      ) &&
      (!filters.muscle || w.muscleGroups?.includes(filters.muscle as never)) &&
      (!filters.type || w.workoutTypes?.includes(filters.type as never)) &&
      (!filters.equipment || w.equipment?.includes(filters.equipment as never)),
  );
}
export function presentOptions<T extends string>(
  allowed: readonly T[],
  present: readonly string[],
) {
  return allowed
    .filter((value) => present.includes(value))
    .map((value) => ({ value, label: value }));
}
