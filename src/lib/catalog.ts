import type { Exercise, Workout } from "../data/types";
export type NameLanguage = "en" | "ru";
const normalize = (s: string) =>
  s.toLocaleLowerCase("ru").replace(/ё/g, "е").trim();
export function workoutEnglish(w: Workout) {
  return w.nameEn || w.originalTitle || w.title;
}
export function searchWorkouts(
  items: Workout[],
  query: string,
  language: NameLanguage,
): Workout[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const collator = new Intl.Collator(language, {
    sensitivity: "base",
    numeric: true,
  });
  return items
    .filter((w) =>
      words.every((word) =>
        normalize(
          [w.title, workoutEnglish(w), w.source, ...(w.aliases || [])].join(
            " ",
          ),
        ).includes(word),
      ),
    )
    .sort((a, b) =>
      collator.compare(
        language === "en" ? workoutEnglish(a) : a.title,
        language === "en" ? workoutEnglish(b) : b.title,
      ),
    );
}
export function sortExercises(items: Exercise[], language: NameLanguage) {
  const collator = new Intl.Collator(language, { sensitivity: "base" });
  return [...items].sort((a, b) =>
    collator.compare(
      language === "en" ? a.nameEn : a.nameRu,
      language === "en" ? b.nameEn : b.nameRu,
    ),
  );
}
export const sortOptions = [
  { value: "en", label: "По английскому · A–Z" },
  { value: "ru", label: "По русскому · А–Я" },
];
