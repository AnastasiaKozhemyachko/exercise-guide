import { useEffect, useRef } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft, ArrowRight, Dumbbell } from "lucide-react";
import { InstructionImage } from "../components/InstructionImage";
import { Breadcrumbs } from "../components/Breadcrumbs";
import {
  exercises,
  workouts,
  workoutFixtures,
  getExerciseById,
} from "../lib/content";
import { occurrenceUrl } from "./WorkoutDetail";
import { useTitle } from "../lib/useTitle";
import { NotFound } from "./NotFound";
export function ExerciseDetail() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const exercise = exercises.find((e) => e.slug === slug);
  const workout = [...workouts, ...workoutFixtures].find(
    (w) => w.slug === params.get("workout"),
  );
  const sequence = workout
    ? [...workout.exercises].sort((a, b) => a.order - b.order)
    : [];
  const index = sequence.findIndex(
    (o) =>
      o.id === params.get("occurrence") &&
      getExerciseById(o.exerciseId)?.id === exercise?.id,
  );
  const context = workout && index >= 0 ? workout : undefined;
  const url = (offset: number) => {
    const o = sequence[index + offset];
    const e = o && getExerciseById(o.exerciseId);
    return e && context ? occurrenceUrl(e.slug, context.slug, o.id) : undefined;
  };
  const previous = url(-1);
  const next = url(1);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  useTitle(exercise?.nameEn || "Упражнение не найдено");
  useEffect(() => {
    if (!context) return;
    function keys(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'input, textarea, select, button, [contenteditable="true"], dialog, [role="listbox"]',
        ) ||
        document.querySelector("dialog[open]") ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey
      )
        return;
      const destination =
        e.key === "ArrowLeft"
          ? previous
          : e.key === "ArrowRight"
            ? next
            : undefined;
      if (destination) {
        e.preventDefault();
        navigate(destination);
      }
    }
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [context, previous, next, navigate]);
  if (!exercise) return <NotFound />;
  const related = workouts.filter((w) =>
    w.exercises.some((o) => getExerciseById(o.exerciseId)?.id === exercise.id),
  );
  const back = context ? `/workouts/${context.slug}` : "/";
  return (
    <div className="page detail-page">
      <Link className="back-link" to={back}>
        <ArrowLeft size={16} />
        {context ? "Вернуться к тренировке" : "Все упражнения"}
      </Link>
      <Breadcrumbs
        items={[
          { label: "Библиотека", to: "/" },
          ...(context ? [{ label: "Тренировка", to: back }] : []),
          { label: exercise.nameEn },
        ]}
      />
      <div className="detail-heading">
        <div>
          <h1>{exercise.nameEn}</h1>
          <p className="secondary-name">{exercise.nameRu}</p>
        </div>
        <span className="detail-type">
          <Dumbbell size={17} />
          {exercise.exerciseType}
        </span>
      </div>
      {context && (
        <nav className="occurrence-navigation" aria-label="Карточки тренировки">
          {previous ? (
            <Link
              className="secondary-button"
              aria-label="Предыдущее упражнение"
              to={previous}
            >
              <ArrowLeft size={18} />
              <span>Назад</span>
            </Link>
          ) : (
            <button
              className="secondary-button"
              aria-label="Предыдущее упражнение"
              disabled
            >
              <ArrowLeft size={18} />
              <span>Назад</span>
            </button>
          )}
          <span className="position-indicator" aria-live="polite">
            {index + 1} / {sequence.length}
          </span>
          {next ? (
            <Link
              className="secondary-button"
              aria-label="Следующее упражнение"
              to={next}
            >
              <span>Далее</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <button
              className="secondary-button"
              aria-label="Следующее упражнение"
              disabled
            >
              <span>Далее</span>
              <ArrowRight size={18} />
            </button>
          )}
        </nav>
      )}
      <div
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            touch.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
            };
            swiped.current = false;
          }
        }}
        onTouchEnd={(e) => {
          if (!touch.current || !e.changedTouches[0]) return;
          const dx = e.changedTouches[0].clientX - touch.current.x;
          const dy = e.changedTouches[0].clientY - touch.current.y;
          touch.current = null;
          if (Math.abs(dx) > 65 && Math.abs(dy) < 65) {
            const destination = dx > 0 ? previous : next;
            if (destination) {
              swiped.current = true;
              navigate(destination);
            }
          }
        }}
        onClickCapture={(e) => {
          if (swiped.current) {
            e.preventDefault();
            e.stopPropagation();
            swiped.current = false;
          }
        }}
      >
        <InstructionImage
          exercise={exercise}
          navigation={
            context
              ? {
                  position: `${index + 1} / ${sequence.length}`,
                  previous: previous ? () => navigate(previous) : undefined,
                  next: next ? () => navigate(next) : undefined,
                }
              : undefined
          }
        />
      </div>
      {!context && related.length > 0 && (
        <section className="related">
          <h2>В тренировках</h2>
          {related.map((w) => (
            <Link key={w.id} to={`/workouts/${w.slug}`}>
              {w.nameEn || w.originalTitle || w.title}
              <ArrowRight size={16} />
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
