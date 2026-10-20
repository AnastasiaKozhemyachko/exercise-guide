import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { exercises, workouts, workoutFixtures } from "../lib/content";
import { useTitle } from "../lib/useTitle";
import { NotFound } from "./NotFound";
export function WorkoutDetail({ fixture = false }: { fixture?: boolean }) {
  const { slug } = useParams();
  const workout = (fixture ? workoutFixtures : workouts).find(
    (w) => w.slug === slug,
  );
  useTitle(workout?.title ?? "Тренировка не найдена");
  if (!workout) return <NotFound />;
  const sequence = [...workout.exercises].sort((a, b) => a.order - b.order);
  return (
    <div className="page workout-detail">
      <Link className="back-link" to="/workouts">
        <ArrowLeft size={16} /> Все тренировки
      </Link>
      {fixture && (
        <div className="review-notice">
          <strong>Демонстрационный пример</strong>
          <p>
            Состав и порядок ниже созданы для проверки интерфейса. Это не разбор
            видео HASfit и не готовая тренировка.
          </p>
        </div>
      )}
      <div className="eyebrow">
        {fixture ? "ПРИМЕР СТРУКТУРЫ" : "ТРЕНИРОВКА"}
      </div>
      <h1>{workout.title}</h1>
      {workout.source && <p className="workout-source">{workout.source}</p>}
      <p className="page-intro">{workout.description}</p>
      {workout.status === "needs-review" && !fixture && (
        <div className="review-notice">
          Подборка требует проверки. Не используй её как готовую программу.
        </div>
      )}
      <section className="sequence-section">
        <div className="section-heading">
          <h2>Последовательность упражнений</h2>
          <span className="count-badge">{sequence.length}</span>
        </div>
        <ol className="sequence-list">
          {sequence.map((o) => {
            const e = exercises.find((e) => e.id === o.exerciseId)!;
            return (
              <li key={o.id}>
                <Link to={`/exercises/${e.slug}`}>
                  <span className="sequence-number">
                    {String(o.order).padStart(2, "0")}
                  </span>
                  <span>
                    <strong>{e.nameRu}</strong>
                    <small>{e.nameEn}</small>
                  </span>
                  <ArrowUpRight size={21} />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
