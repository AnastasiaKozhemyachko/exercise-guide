export const muscleGroups = [
  "Ноги",
  "Ягодицы",
  "Спина",
  "Руки",
  "Пресс",
  "Грудь",
  "Плечи",
  "Всё тело",
] as const;
export const exerciseTypes = [
  "Силовые",
  "Разминка",
  "Растяжка",
  "Мобильность",
] as const;
export const equipmentTypes = ["Гантели", "Собственный вес", "Другое"] as const;
export type Equipment = (typeof equipmentTypes)[number];
export type MuscleGroup = (typeof muscleGroups)[number];
export type ExerciseType = (typeof exerciseTypes)[number];
export interface Exercise {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  aliases: string[];
  muscleGroups: MuscleGroup[];
  exerciseType: ExerciseType;
  equipment?: Equipment[];
  thumbnail: string;
  instructionImage: string;
  imageAlt: string;
  status: "verified" | "needs-review";
  reviewNote?: string;
  reviewIssues?: string[];
  reviewPreview?: boolean;
  imageOrigin?: "ai-generated-illustration";
  sourceStatus?:
    | "needs-technique-and-text-review"
    | "approved-design-reference";
  contentSource?: string;
  legacyIds?: string[];
}
export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  order: number;
}
export interface Workout {
  id: string;
  slug: string;
  title: string;
  source?: string;
  sourceUrl?: string;
  description: string;
  coverImage?: string;
  status: "verified" | "needs-review";
  exercises: WorkoutExercise[];
  originalTitle?: string;
  nameEn?: string;
  aliases?: string[];
  summary?: string;
  coverCredit?: string;
  muscleGroups?: MuscleGroup[];
  workoutTypes?: ExerciseType[];
  equipment?: Equipment[];
  reviewNote?: string;
  verificationStatus?: "sequence-unverified" | "sequence-verified";
}
