import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Minus, Plus, X } from "lucide-react";
export interface ImageViewerProps {
  src: string;
  title: string;
  alt: string;
  position?: string;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}
export function ImageViewer({
  src,
  title,
  alt,
  position,
  onClose,
  onPrevious,
  onNext,
}: ImageViewerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef(document.activeElement as HTMLElement | null);
  const scroll = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [failed, setFailed] = useState(false);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const callbacks = useRef({ onClose, onPrevious, onNext });
  callbacks.current = { onClose, onPrevious, onNext };
  useEffect(() => {
    const focus = returnFocus.current;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      if (focus?.isConnected) focus.focus();
    };
  }, []);
  useEffect(() => {
    setZoom(100);
    setFailed(false);
    scroll.current?.scrollTo(0, 0);
  }, [src]);
  return (
    <dialog
      ref={dialog}
      className="zoom-dialog"
      aria-label="Просмотр карточки"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          e.stopPropagation();
          (e.key === "ArrowLeft"
            ? callbacks.current.onPrevious
            : callbacks.current.onNext)?.();
        }
      }}
    >
      <div className="zoom-toolbar">
        <div className="viewer-title">
          <strong>{title}</strong>
          {position && <span aria-live="polite">{position}</span>}
        </div>
        <div>
          {position && (
            <>
              <button
                aria-label="Предыдущая карточка"
                disabled={!onPrevious}
                onClick={onPrevious}
              >
                <ArrowLeft size={18} />
              </button>
              <button
                aria-label="Следующая карточка"
                disabled={!onNext}
                onClick={onNext}
              >
                <ArrowRight size={18} />
              </button>
            </>
          )}
          <button
            aria-label="Уменьшить"
            disabled={zoom <= 100}
            onClick={() => setZoom((v) => Math.max(100, v - 25))}
          >
            <Minus size={18} />
          </button>
          <output aria-live="polite">{zoom}%</output>
          <button
            aria-label="Увеличить масштаб"
            disabled={zoom >= 300}
            onClick={() => setZoom((v) => Math.min(300, v + 25))}
          >
            <Plus size={18} />
          </button>
          <button aria-label="Закрыть изображение" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>
      <div
        ref={scroll}
        className={`zoom-scroll ${zoom > 100 ? "is-zoomed" : ""}`}
        tabIndex={0}
        aria-label="Область прокрутки изображения"
        style={{ touchAction: zoom > 100 ? "none" : "pan-y" }}
        onPointerDown={(e) => {
          if (e.button !== 0 || !scroll.current) return;
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            left: scroll.current.scrollLeft,
            top: scroll.current.scrollTop,
          };
          if (zoom > 100) e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (zoom > 100 && drag.current && scroll.current) {
            scroll.current.scrollLeft =
              drag.current.left - e.clientX + drag.current.x;
            scroll.current.scrollTop =
              drag.current.top - e.clientY + drag.current.y;
          }
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onPointerUp={(e) => {
          const start = drag.current;
          drag.current = null;
          if (
            zoom === 100 &&
            start &&
            Math.abs(e.clientX - start.x) > 65 &&
            Math.abs(e.clientY - start.y) < 65
          )
            (e.clientX > start.x ? onPrevious : onNext)?.();
        }}
      >
        {failed ? (
          <p className="viewer-error">
            Не удалось загрузить карточку. Закрой просмотр и попробуй ещё раз.
          </p>
        ) : (
          <img
            src={src}
            alt={alt}
            draggable={false}
            onError={() => setFailed(true)}
            style={{ width: `${zoom}%` }}
          />
        )}
      </div>
    </dialog>
  );
}
