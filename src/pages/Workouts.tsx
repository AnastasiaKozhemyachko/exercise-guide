import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Dumbbell } from "lucide-react";
import { workouts, workoutFixtures } from "../lib/content";
import type { Workout } from "../data/types";
import { useTitle } from "../lib/useTitle";
function WorkoutCard({
  workout,
  fixture = false,
}: {
  workout: Workout;
  fixture?: boolean;
}) {
  return (
    <Link
      className="workout-card"
      to={`${fixture ? "/examples/workouts" : "/workouts"}/${workout.slug}`}
    >
      <div className="workout-cover">
        {workout.coverImage ? (
          <img src={workout.coverImage} alt="" loading="lazy" />
        ) : (
          <div className="workout-cover-pattern">
            <Dumbbell size={52} strokeWidth={1} />
          </div>
        )}
        <span className="image-tag">
          {fixture ? "ПРИМЕР · НЕ ТРЕНИРОВКА" : "ПОДБОРКА УПРАЖНЕНИЙ"}
        </span>
      </div>
      <div className="card-copy">
        <span className="eyebrow">
          {fixture
            ? "ДЕМОНСТРАЦИОННЫЕ ДАННЫЕ"
            : workout.source || "ЛИЧНАЯ ПОДБОРКА"}
        </span>
        <h2>{workout.title}</h2>
        <p>{workout.description}</p>
        <span className="workout-card-link">
          {fixture ? "Посмотреть структуру" : "Открыть тренировку"}
          <ArrowRight size={17} />
        </span>
      </div>
    </Link>
  );
}
export function Workouts() {
  useTitle("Тренировки");
  const [showExample, setShowExample] = useState(false);
  return (
    <div className="page workouts-page">
      <div className="eyebrow">
        <span className="tiny-dot" />
        ДВИЖЕНИЯ ВМЕСТЕ
      </div>
      <h1>Твои тренировки</h1>
      <p className="page-intro">
        Знакомые упражнения в нужной последовательности.
        <br />
        Открой карточку, когда захочется уточнить технику.
      </p>
      {workouts.length ? (
        <div className="workout-grid">
          {workouts.map((w) => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      ) : (
        <div className="workout-empty">
          <div className="note-icon">
            <Dumbbell size={28} strokeWidth={1.3} />
          </div>
          <h2>Здесь будет твоя первая тренировка</h2>
          <p>
            Подтверждённые подборки ещё не добавлены.
            <br />
            Порядок упражнений HASfit пока не проверен по видео.
          </p>
          <Link className="primary-button" to="/">
            Изучить упражнения <ArrowRight size={17} />
          </Link>
        </div>
      )}
      <section className="example-section">
        <div>
          <span className="eyebrow">ДЛЯ ЗНАКОМСТВА С ФОРМАТОМ</span>
          <h2>Как выглядит подборка</h2>
          <p>Отдельный пример структуры данных. Не программа для выполнения.</p>
        </div>
        <button
          className="secondary-button"
          aria-expanded={showExample}
          onClick={() => setShowExample((v) => !v)}
        >
          {showExample ? "Скрыть пример" : "Показать пример"}
          <ChevronRight className={showExample ? "rotate" : ""} size={17} />
        </button>
      </section>
      {showExample && (
        <div className="workout-grid fixture-grid">
          {workoutFixtures.map((w) => (
            <WorkoutCard key={w.id} workout={w} fixture />
          ))}
        </div>
      )}
    </div>
  );
}
