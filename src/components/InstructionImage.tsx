import { assetUrl } from "../lib/assetUrl";
import { useEffect, useRef, useState } from "react";
import { ImageOff, Maximize2, Minus, Plus, X } from "lucide-react";
import type { Exercise } from "../data/types";

export function ImagePlaceholder({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`image-placeholder ${compact ? "compact" : ""}`}>
      <div className="placeholder-mark">
        <ImageOff size={compact ? 30 : 38} strokeWidth={1.2} />
      </div>
      <span className="eyebrow">КАРТОЧКА ТЕХНИКИ · V1</span>
      <strong>Иллюстрация недоступна</strong>
      <p>
        Не удалось загрузить изображение карточки. Попробуй обновить страницу.
      </p>
    </div>
  );
}
export function Thumbnail({ exercise }: { exercise: Exercise }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <ImagePlaceholder compact />
  ) : (
    <img
      className="exercise-thumbnail"
      src={assetUrl(exercise.thumbnail)}
      alt={exercise.imageAlt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
export function InstructionImage({ exercise }: { exercise: Exercise }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  function close() {
    dialog.current?.close();
    setOpen(false);
    setZoom(100);
    trigger.current?.focus();
  }
  return (
    <section
      className="instruction-section"
      aria-label="Иллюстрированная техника"
    >
      <div className="instruction-toolbar">
        <span>
          <span className="tiny-dot" />
          {exercise.status === "needs-review"
            ? "ЧЕРНОВИК КАРТОЧКИ V1"
            : "КАРТОЧКА ТЕХНИКИ V1"}
        </span>
        <button
          ref={trigger}
          className="text-button"
          disabled={!ready || failed}
          onClick={() => setOpen(true)}
        >
          <Maximize2 size={16} /> Увеличить
        </button>
      </div>
      <div className="instruction-paper">
        {failed ? (
          <ImagePlaceholder />
        ) : (
          <button
            className="image-button"
            aria-label="Открыть карточку крупнее"
            disabled={!ready}
            onClick={() => setOpen(true)}
          >
            <img
              src={assetUrl(exercise.instructionImage)}
              alt={exercise.imageAlt}
              onLoad={() => setReady(true)}
              onError={() => setFailed(true)}
            />
          </button>
        )}
      </div>
      <p className="image-caption">
        {failed
          ? "Карточка не загрузилась. Попробуй обновить страницу."
          : "Исходная карточка · без обрезки и изменения пропорций. Нажмите, чтобы рассмотреть детали."}
      </p>
      {open && (
        <dialog
          ref={dialog}
          className="zoom-dialog"
          aria-label="Увеличенная карточка техники"
          onCancel={(e) => {
            e.preventDefault();
            close();
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="zoom-toolbar">
            <strong>
              {exercise.status === "needs-review" ? "Черновик · " : ""}
              {exercise.nameRu}
            </strong>
            <div>
              <button
                aria-label="Уменьшить"
                disabled={zoom <= 100}
                onClick={() => setZoom((v) => Math.max(100, v - 25))}
              >
                <Minus size={20} />
              </button>
              <output aria-live="polite">{zoom}%</output>
              <button
                aria-label="Увеличить масштаб"
                disabled={zoom >= 250}
                onClick={() => setZoom((v) => Math.min(250, v + 25))}
              >
                <Plus size={20} />
              </button>
              <button aria-label="Закрыть изображение" onClick={close}>
                <X size={22} />
              </button>
            </div>
          </div>
          <div
            className="zoom-scroll"
            tabIndex={0}
            aria-label="Область прокрутки изображения"
          >
            <img
              src={assetUrl(exercise.instructionImage)}
              alt={exercise.imageAlt}
              style={{ width: `${zoom}%` }}
            />
          </div>
        </dialog>
      )}
    </section>
  );
}
