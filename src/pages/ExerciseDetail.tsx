import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Dumbbell, Leaf } from "lucide-react";
import { InstructionImage } from "../components/InstructionImage";
import { exercises, workouts, getExerciseById } from "../lib/content";
import { useTitle } from "../lib/useTitle";
import { NotFound } from "./NotFound";
export function ExerciseDetail() {
  const { slug } = useParams();
  const exercise = exercises.find((e) => e.slug === slug);
  useTitle(exercise?.nameRu ?? "Упражнение не найдено");
  if (!exercise) return <NotFound />;
  const related = workouts.filter((w) =>
    w.exercises.some((o) => getExerciseById(o.exerciseId)?.id === exercise.id),
  );
  return (
    <div className="page detail-page">
      <Link className="back-link" to="/">
        <ArrowLeft size={16} /> Все упражнения
      </Link>
      <div className="detail-heading">
        <div>
          <div className="eyebrow">БИБЛИОТЕКА / ТЕХНИКА УПРАЖНЕНИЯ</div>
          <h1>{exercise.nameRu}</h1>
          <p className="english-name">{exercise.nameEn}</p>
        </div>
        <span className="detail-type">
          <Dumbbell size={17} />
          {exercise.exerciseType}
        </span>
      </div>
      {exercise.status === "needs-review" ? (
        <>
          <div className="review-notice" role="note">
            <strong>Черновик · техника требует проверки</strong>
            <p>{exercise.reviewNote}</p>
            {exercise.imageOrigin === "ai-generated-illustration" && (
              <p>
                AI-иллюстрация, не кадр из видео. Дизайн не означает
                подтверждения техники.
              </p>
            )}
            {exercise.reviewIssues?.length ? (
              <ul>
                {exercise.reviewIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            ) : null}
          </div>
          {exercise.reviewPreview ? (
            <details className="draft-preview" key={exercise.id}>
              <summary>Посмотреть черновик карточки</summary>
              <InstructionImage exercise={exercise} />
            </details>
          ) : (
            <p className="image-caption">
              Инструкция появится после подтверждения упражнения.
            </p>
          )}
        </>
      ) : (
        <InstructionImage key={exercise.id} exercise={exercise} />
      )}
      <div className="safety-note">
        <Leaf size={20} />
        <p>
          Работай в комфортной амплитуде. При резкой или нарастающей боли
          остановись. Карточка помогает изучать движение, но не заменяет
          индивидуальную оценку специалиста.
        </p>
      </div>
      {related.length > 0 && (
        <section className="related">
          <h2>В тренировках</h2>
          {related.map((w) => (
            <Link key={w.id} to={`/workouts/${w.slug}`}>
              {w.title}
              <ArrowRight size={16} />
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
