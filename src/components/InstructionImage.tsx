import { useEffect, useState } from "react";
import { ImageOff, Maximize2 } from "lucide-react";
import type { Exercise } from "../data/types";
import { assetUrl } from "../lib/assetUrl";
import { ImageViewer } from "./ImageViewer";
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
      alt={`Карточка: ${exercise.nameRu} (${exercise.nameEn})`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
export function InstructionImage({
  exercise,
  navigation,
}: {
  exercise: Exercise;
  navigation?: { previous?: () => void; next?: () => void; position: string };
}) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setReady(false);
    setFailed(false);
  }, [exercise.instructionImage]);
  const alt = `Карточка техники: ${exercise.nameRu} (${exercise.nameEn})`;
  return (
    <section
      className="instruction-section"
      aria-label="Иллюстрированная техника"
    >
      <div className="instruction-toolbar">
        <span>
          <span className="tiny-dot" />
          КАРТОЧКА ТЕХНИКИ V1
        </span>
        <button
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
              alt={alt}
              onLoad={() => setReady(true)}
              onError={() => setFailed(true)}
            />
          </button>
        )}
      </div>
      <p className="image-caption">
        {failed
          ? "Карточка не загрузилась. Попробуй обновить страницу."
          : "Нажми на карточку, чтобы рассмотреть детали."}
      </p>
      {open && (
        <ImageViewer
          src={assetUrl(exercise.instructionImage)}
          title={exercise.nameRu}
          alt={alt}
          onClose={() => setOpen(false)}
          position={navigation?.position}
          onPrevious={navigation?.previous}
          onNext={navigation?.next}
        />
      )}
    </section>
  );
}
