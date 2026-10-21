import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";
import { assetUrl } from "../lib/assetUrl";
import { workouts } from "../lib/content";
import { searchWorkouts, workoutEnglish, presentOptions } from "../lib/catalog";
import { muscleGroups, exerciseTypes, equipmentTypes } from "../data/types";
import { Select } from "../components/Select";
import { useTitle } from "../lib/useTitle";
export function Workouts() {
  useTitle("Тренировки");
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const muscle = params.get("muscle") || "";
  const type = params.get("type") || "";
  const equipment = params.get("equipment") || "";
  const filtered = searchWorkouts(workouts, query, { muscle, type, equipment });
  const active = !!(query || muscle || type || equipment);
  function update(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete("sort");
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
          label="Направление тренировки"
          value={muscle}
          options={[
            { value: "", label: "Все направления" },
            ...presentOptions(
              muscleGroups,
              workouts.flatMap((w) => w.muscleGroups || []),
            ),
          ]}
          onChange={(value) => update("muscle", value)}
        />
        <Select
          label="Тип тренировки"
          value={type}
          options={[
            { value: "", label: "Все типы" },
            ...presentOptions(
              exerciseTypes,
              workouts.flatMap((w) => w.workoutTypes || []),
            ),
          ]}
          onChange={(value) => update("type", value)}
        />
        <Select
          label="Оборудование"
          value={equipment}
          options={[
            { value: "", label: "Любое оборудование" },
            ...presentOptions(
              equipmentTypes,
              workouts.flatMap((w) => w.equipment || []),
            ),
          ]}
          onChange={(value) => update("equipment", value)}
        />
      </div>
      <div className="results-bar">
        <span role="status">Найдено тренировок: {filtered.length}</span>
        {active && (
          <button className="text-button" onClick={() => setParams({})}>
            Сбросить фильтры
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
          <button className="primary-button" onClick={() => setParams({})}>
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
}
