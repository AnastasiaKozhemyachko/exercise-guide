import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";
import { assetUrl } from "../lib/assetUrl";
import { workouts } from "../lib/content";
import {
  searchWorkouts,
  workoutEnglish,
  sortOptions,
  type NameLanguage,
} from "../lib/catalog";
import { Select } from "../components/Select";
import { useTitle } from "../lib/useTitle";
export function Workouts() {
  useTitle("Тренировки");
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const language: NameLanguage = params.get("sort") === "ru" ? "ru" : "en";
  const filtered = searchWorkouts(workouts, query, language);
  function update(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        value ? next.set(key, value) : next.delete(key);
        return next;
      },
      { replace: true },
    );
  }
  return (
    <div className="page workouts-page">
      <div className="eyebrow">
        <span className="tiny-dot" />
        ДВИЖЕНИЯ ВМЕСТЕ
      </div>
      <h1>Твои тренировки</h1>
      <p className="page-intro">
        Выбери тренировку и листай карточки в её последовательности.
      </p>
      <div className="filter-panel workout-filters">
        <div className="search-field">
          <Search size={20} />
          <input
            type="search"
            aria-label="Поиск тренировок"
            placeholder="Название на русском или английском"
            value={query}
            onChange={(e) => update("q", e.target.value)}
          />
          {query && (
            <button aria-label="Очистить поиск" onClick={() => update("q", "")}>
              <X size={17} />
            </button>
          )}
        </div>
        <Select
          label="Сортировка тренировок"
          value={language}
          options={sortOptions}
          onChange={(value) => update("sort", value)}
        />
      </div>
      <div className="results-bar">
        <span role="status">Найдено тренировок: {filtered.length}</span>
        {query && (
          <button className="text-button" onClick={() => update("q", "")}>
            Сбросить поиск
          </button>
        )}
      </div>
      {filtered.length ? (
        <div className="workout-grid">
          {filtered.map((w) => (
            <Link
              key={w.id}
              className="workout-card"
              to={`/workouts/${w.slug}`}
            >
              <div className="workout-cover">
                {w.coverImage && (
                  <img
                    src={assetUrl(w.coverImage)}
                    alt={`Обложка библиотеки: ${w.title}`}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="card-copy">
                <span className="eyebrow">{w.source || "ЛИЧНАЯ ПОДБОРКА"}</span>
                <h2 className="workout-english">{workoutEnglish(w)}</h2>
                <p className="workout-russian">{w.title}</p>
                <p>{w.summary || w.description}</p>
                <span className="workout-card-link">
                  Открыть тренировку
                  <ArrowRight size={17} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={28} />
          <h2>Тренировки не найдены</h2>
          <p>Попробуй другое название или очисти поиск.</p>
          <button className="primary-button" onClick={() => update("q", "")}>
            Сбросить поиск
          </button>
        </div>
      )}
    </div>
  );
}
