import { Select } from "../components/Select";
import { presentOptions } from "../lib/catalog";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Dumbbell,
  Leaf,
  Search,
  X,
} from "lucide-react";
import { Thumbnail } from "../components/InstructionImage";
import { exercises, filterExercises } from "../lib/content";
import {
  exerciseTypes,
  muscleGroups,
  equipmentTypes,
  type Exercise,
} from "../data/types";
import { useTitle } from "../lib/useTitle";
function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <Link className="exercise-card" to={`/exercises/${exercise.slug}`}>
      <div className="card-image">
        <Thumbnail exercise={exercise} />
        <span className="image-tag">
          <Dumbbell size={13} />
          {exercise.exerciseType}
        </span>
        <span className="card-open" aria-hidden="true">
          <ArrowUpRight size={20} />
        </span>
      </div>
      <div className="card-copy">
        <h2>{exercise.nameEn}</h2>
        <p className="secondary-name">{exercise.nameRu}</p>
        <div className="muscle-tags">
          {exercise.muscleGroups.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
export function Library() {
  useTitle("Библиотека упражнений");
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const muscle = params.get("muscle") ?? "";
  const type = params.get("type") ?? "";
  const equipment = params.get("equipment") || "";
  const filtered = useMemo(
    () => filterExercises(exercises, query, muscle, type, equipment),
    [query, muscle, type, equipment],
  );
  const active = !!(query || muscle || type || equipment);
  function setFilter(key: string, value: string) {
    setParams(
      (previous) => {
        const p = new URLSearchParams(previous);
        p.delete("sort");
        value ? p.set(key, value) : p.delete(key);
        return p;
      },
      { replace: true },
    );
  }
  return (
    <div className="page library-page">
      <section className="library-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-dot" />
            ЛИЧНАЯ БИБЛИОТЕКА УПРАЖНЕНИЙ
          </div>
          <h1>
            Знай движение.
            <br />
            <span>Чувствуй разницу.</span>
          </h1>
          <p>
            Наглядная техника, понятные подсказки
            <br className="desktop-break" /> и внимание к каждому движению.
          </p>
          <button
            onClick={() =>
              document
                .getElementById("catalog")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="hero-link"
          >
            Найти своё упражнение <ArrowDown size={16} />
          </button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-grid" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-center">
            <Leaf size={57} strokeWidth={1} />
          </div>
          <span className="art-label art-label-top">
            <span />
            Сначала — техника
          </span>
          <span className="art-label art-label-bottom">
            Потом — уверенность <Check size={15} />
          </span>
          <span className="art-number">01 / ОСНОВЫ ДВИЖЕНИЯ</span>
        </div>
      </section>
      <div className="principles">
        <span>
          <BookOpen size={17} />
          Техника в одной карточке
        </span>
        <span>
          <Dumbbell size={17} />
          Для домашних тренировок
        </span>
        <span>
          <Leaf size={17} />В своём темпе
        </span>
      </div>
      <section id="catalog" className="catalog-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">ИЗУЧАЙ И ПРАКТИКУЙ</div>
            <h2>
              Библиотека упражнений{" "}
              <span className="count-badge">{exercises.length}</span>
            </h2>
          </div>
          <p>Каждое движение — по полочкам</p>
        </div>
        <div className="filter-panel">
          <div className="search-field">
            <Search size={20} />
            <input
              type="search"
              aria-label="Поиск упражнений"
              placeholder="Название на русском или английском"
              value={query}
              onChange={(e) => setFilter("q", e.target.value)}
            />
            {query && (
              <button
                aria-label="Очистить поиск"
                onClick={() => setFilter("q", "")}
              >
                <X size={17} />
              </button>
            )}
          </div>
          <Select
            label="Тип упражнения"
            value={type}
            options={[
              { value: "", label: "Все типы" },
              ...presentOptions(
                exerciseTypes,
                exercises.map((e) => e.exerciseType),
              ),
            ]}
            onChange={(value) => setFilter("type", value)}
          />
          <Select
            label="Оборудование"
            value={equipment}
            options={[
              { value: "", label: "Любое оборудование" },
              ...presentOptions(
                equipmentTypes,
                exercises.flatMap((e) => e.equipment || []),
              ),
            ]}
            onChange={(value) => setFilter("equipment", value)}
          />
        </div>
        <div className="muscle-filters" role="group" aria-label="Группа мышц">
          <button
            className={!muscle ? "selected" : ""}
            aria-pressed={!muscle}
            onClick={() => setFilter("muscle", "")}
          >
            Все мышцы
          </button>
          {muscleGroups.map((m) => (
            <button
              key={m}
              className={muscle === m ? "selected" : ""}
              aria-pressed={muscle === m}
              onClick={() => setFilter("muscle", m)}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="results-bar">
          <span role="status">Найдено упражнений: {filtered.length}</span>
          {active && (
            <button className="text-button" onClick={() => setParams({})}>
              <X size={14} /> Сбросить фильтры
            </button>
          )}
        </div>
        {filtered.length ? (
          <div className="exercise-grid">
            {filtered.map((e) => (
              <ExerciseCard key={e.id} exercise={e} />
            ))}
            <div className="library-note">
              <span className="note-icon">
                <Leaf size={25} strokeWidth={1.4} />
              </span>
              <h3>
                Меньше спешки.
                <br /> Больше понимания.
              </h3>
              <p>
                Библиотека растёт постепенно. Новые упражнения появятся здесь
                вместе с подробными карточками техники.
              </p>
              <span className="eyebrow">КАЧЕСТВО ВАЖНЕЕ КОЛИЧЕСТВА</span>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <Search size={30} strokeWidth={1.3} />
            <h3>Такого упражнения пока нет</h3>
            <p>Попробуй другое название или убери часть фильтров.</p>
            <button className="primary-button" onClick={() => setParams({})}>
              Сбросить фильтры <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>
      <section className="bottom-note">
        <span className="note-icon">
          <BookOpen size={22} />
        </span>
        <div>
          <h3>Карточка вместо десятка подсказок</h3>
          <p>
            Положение тела, направление движения и частые ошибки — в одной
            наглядной иллюстрации.
          </p>
        </div>
        <ArrowUpRight size={24} />
      </section>
    </div>
  );
}
