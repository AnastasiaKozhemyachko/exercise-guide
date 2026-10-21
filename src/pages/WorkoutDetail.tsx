import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getExerciseById, workouts, workoutFixtures } from "../lib/content";
import { workoutEnglish } from "../lib/catalog";
import { assetUrl } from "../lib/assetUrl";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useTitle } from "../lib/useTitle";
import { NotFound } from "./NotFound";
export function occurrenceUrl(
  slug: string,
  workout: string,
  occurrence: string,
) {
  return `/exercises/${slug}?${new URLSearchParams({ workout, occurrence })}`;
}
export function WorkoutDetail({ fixture = false }: { fixture?: boolean }) {
  const { slug } = useParams();
  const workout = (fixture ? workoutFixtures : workouts).find(
    (w) => w.slug === slug,
  );
  useTitle(workout ? workoutEnglish(workout) : "Тренировка не найдена");
  if (!workout) return <NotFound />;
  const sequence = [...workout.exercises].sort((a, b) => a.order - b.order);
  const first = getExerciseById(sequence[0].exerciseId)!;
  return (
    <div className="page workout-detail">
      <Link className="back-link" to="/workouts">
        <ArrowLeft size={16} /> Все тренировки
      </Link>
      <Breadcrumbs
        items={[
          { label: "Тренировки", to: "/workouts" },
          { label: workout.source || workout.title },
        ]}
      />
      {fixture && (
        <p className="review-notice">
          Демонстрационный пример структуры, не программа для выполнения.
        </p>
      )}
      <h1 className="workout-title">{workoutEnglish(workout)}</h1>
      <p className="workout-subtitle">{workout.title}</p>
      <p className="page-intro">{workout.summary || workout.description}</p>
      {workout.coverImage && (
        <figure className="workout-hero-cover">
          <img
            src={assetUrl(workout.coverImage)}
            alt={`Обложка библиотеки: ${workout.title}`}
          />
          {workout.coverCredit && (
            <figcaption>{workout.coverCredit}</figcaption>
          )}
        </figure>
      )}
      <Link
        className="primary-button"
        to={occurrenceUrl(first.slug, workout.slug, sequence[0].id)}
      >
        Открыть карточки
        <ArrowRight size={17} />
      </Link>
      <section className="sequence-section">
        <div className="section-heading">
          <h2>Последовательность упражнений</h2>
          <span className="count-badge">{sequence.length}</span>
        </div>
        <ol className="sequence-list">
          {sequence.map((o) => {
            const e = getExerciseById(o.exerciseId)!;
            return (
              <li key={o.id}>
                <Link to={occurrenceUrl(e.slug, workout.slug, o.id)}>
                  <span className="sequence-number">
                    {String(o.order).padStart(2, "0")}
                  </span>
                  <span>
                    <strong>{e.nameEn}</strong>
                    <small>{e.nameRu}</small>
                  </span>
                  <ArrowRight size={19} />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
