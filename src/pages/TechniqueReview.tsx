import { useRef, useState } from "react";
import { Check, ClipboardCopy, Download, Upload } from "lucide-react";
import { exercises, workouts } from "../lib/content";
import { assetUrl } from "../lib/assetUrl";
import { useTitle } from "../lib/useTitle";
import { useReview } from "../lib/useReview";
import {
  reviewFor,
  reviewStatuses,
  reviewReport,
  createReviewZip,
  importResults,
  type ReviewStatus,
} from "../lib/review";
import { ImageViewer } from "../components/ImageViewer";
import { Thumbnail } from "../components/InstructionImage";
import { Select } from "../components/Select";
export function TechniqueReview() {
  useTitle("Проверка техники");
  const { results, update, storageError } = useReview();
  const [filter, setFilter] = useState("queue");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [manualReport, setManualReport] = useState("");
  const importer = useRef<HTMLInputElement>(null);
  const filtered = exercises.filter(
    (e) =>
      filter === "all" ||
      (filter === "queue"
        ? reviewFor(results, e.id).status !== "approved"
        : reviewFor(results, e.id).status === filter),
  );
  const viewingIndex = exercises.findIndex((e) => e.id === viewingId);
  const viewing = exercises[viewingIndex];
  const counts = Object.fromEntries(
    Object.keys(reviewStatuses).map((status) => [
      status,
      exercises.filter((e) => reviewFor(results, e.id).status === status)
        .length,
    ]),
  );
  function change(
    id: string,
    patch: Partial<{ status: ReviewStatus; note: string }>,
  ) {
    update((old) => ({
      ...old,
      [id]: {
        ...reviewFor(old, id),
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    }));
  }
  async function copy() {
    const report = reviewReport(exercises, results);
    try {
      await navigator.clipboard.writeText(report);
      setManualReport("");
      setMessage("Результаты проверки скопированы. Можно вставить в ChatGPT.");
    } catch {
      setManualReport(report);
      setMessage(
        "Браузер не разрешил копирование. Выдели и скопируй весь отчёт в поле ниже.",
      );
    }
  }
  async function download() {
    setBusy(true);
    setMessage("Собираем ZIP с оригиналами карточек…");
    try {
      const blob = await createReviewZip(exercises, results);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "technique-review.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setMessage("ZIP готов: карточки, отчёт и JSON. Оценки сохранены.");
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Не удалось создать ZIP. Попробуй ещё раз.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page review-page">
      <div className="eyebrow">ЛИЧНАЯ ПРОВЕРКА / TECHNIQUE REVIEW</div>
      <h1>Проверка техники</h1>
      <p className="page-intro">
        Посмотри карточки, отметь подходящие и собери замечания для ChatGPT.
        Отметки хранятся только в этом браузере.
      </p>
      <p className="review-context">
        Это AI-иллюстрации. Твоя оценка — личное решение, а не профессиональная
        сертификация техники.
      </p>
      <div className="review-progress" aria-live="polite">
        {exercises.length} карточек <span>·</span> {counts.approved} проверено{" "}
        <span>·</span> {counts.changes_requested} исправить <span>·</span>{" "}
        {counts.pending} осталось
      </div>
      <div className="review-actions">
        <button className="primary-button" onClick={copy}>
          <ClipboardCopy size={17} />
          Скопировать результаты проверки
        </button>
        <button className="secondary-button" disabled={busy} onClick={download}>
          <Download size={17} />
          {busy ? "Собираем ZIP…" : "Скачать ZIP для ChatGPT"}
        </button>
        <button
          className="text-button"
          onClick={() => importer.current?.click()}
        >
          <Upload size={15} />
          Импортировать JSON
        </button>
        <input
          ref={importer}
          hidden
          type="file"
          accept=".json,application/json"
          aria-label="Импорт результатов проверки"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const imported = importResults(await file.text(), exercises);
              update((old) => ({ ...old, ...imported }));
              setMessage("Оценки и комментарии импортированы.");
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Не удалось импортировать JSON.",
              );
            }
            e.target.value = "";
          }}
        />
      </div>
      {storageError && (
        <p className="review-storage-error" role="alert">
          {storageError}
        </p>
      )}
      <p role="status" className="review-feedback">
        {message}
      </p>
      {manualReport && (
        <textarea
          className="manual-report"
          aria-label="Отчёт для копирования"
          readOnly
          value={manualReport}
          onFocus={(e) => e.target.select()}
        />
      )}
      <div className="review-filter-row">
        <Select
          label="Статус проверки"
          value={filter}
          options={[
            { value: "queue", label: "Требуют проверки" },
            { value: "all", label: "Все карточки" },
            ...Object.entries(reviewStatuses).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
          onChange={setFilter}
        />
      </div>
      <div className="review-grid">
        {filtered.map((e) => {
          const review = reviewFor(results, e.id);
          return (
            <article
              className="review-card"
              key={e.id}
              aria-label={`Проверка: ${e.nameEn}`}
            >
              <button
                className="review-image"
                aria-label={`Рассмотреть: ${e.nameEn}`}
                onClick={() => setViewingId(e.id)}
              >
                <Thumbnail exercise={e} />
              </button>
              <div className="review-card-body">
                <h2>{e.nameEn}</h2>
                <p className="secondary-name">{e.nameRu}</p>
                <span className={`review-state state-${review.status}`}>
                  {review.status === "approved" && <Check size={13} />}{" "}
                  {reviewStatuses[review.status]}
                </span>
                <div
                  className="review-choices"
                  role="group"
                  aria-label={`Оценка: ${e.nameEn}`}
                >
                  {(["approved", "changes_requested", "pending"] as const).map(
                    (status) => (
                      <button
                        key={status}
                        aria-pressed={review.status === status}
                        onClick={() => change(e.id, { status })}
                      >
                        {reviewStatuses[status]}
                      </button>
                    ),
                  )}
                </div>
                {review.status === "changes_requested" && (
                  <label className="review-comment">
                    Что исправить
                    <textarea
                      value={review.note}
                      onChange={(event) =>
                        change(e.id, { note: event.target.value })
                      }
                      placeholder="Опиши ошибки: неправильное положение колена, стрелка указывает не туда, неверная анатомия, ошибка в подписи..."
                    />
                  </label>
                )}
                {review.status !== "approved" && (
                  <details className="source-review">
                    <summary>Замечания к исходной карточке</summary>
                    <p>{e.reviewNote}</p>
                    <ul>
                      {e.reviewIssues?.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <h2>
            {filter === "queue" &&
            counts.pending === 0 &&
            counts.changes_requested === 0
              ? "Все карточки проверены ✓"
              : "С таким статусом пока нет карточек"}
          </h2>
          <button className="secondary-button" onClick={() => setFilter("all")}>
            Показать все
          </button>
        </div>
      )}
      <details className="maintenance-notes">
        <summary>Информация о последовательностях тренировок</summary>
        {workouts.map((w) => (
          <div key={w.id}>
            <strong>{w.title}</strong>
            <p>{w.reviewNote}</p>
          </div>
        ))}
      </details>
      {viewing && (
        <ImageViewer
          src={assetUrl(viewing.instructionImage)}
          title={`${viewing.nameEn} · ${viewing.nameRu}`}
          alt={`Карточка техники: ${viewing.nameEn} (${viewing.nameRu})`}
          position={`${viewingIndex + 1} / ${exercises.length}`}
          onClose={() => setViewingId(null)}
          onPrevious={
            viewingIndex > 0
              ? () => setViewingId(exercises[viewingIndex - 1].id)
              : undefined
          }
          onNext={
            viewingIndex < exercises.length - 1
              ? () => setViewingId(exercises[viewingIndex + 1].id)
              : undefined
          }
        />
      )}
    </div>
  );
}
