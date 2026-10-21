import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
export interface SelectOption {
  value: string;
  label: string;
}
export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const id = useId();
  const selected = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  function choose(index: number) {
    onChange(options[index].value);
    setOpen(false);
    trigger.current?.focus();
  }
  return (
    <div ref={root} className="custom-select">
      <button
        ref={trigger}
        className="select-trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          setActive(selected);
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setActive(selected);
            setOpen(true);
          }
        }}
      >
        <span>
          <small>{label}</small>
          {options[selected]?.label}
        </span>
        <ChevronDown size={16} className={open ? "rotate-select" : ""} />
      </button>
      {open && (
        <div
          ref={list}
          role="listbox"
          aria-label={label}
          id={id}
          tabIndex={-1}
          className="select-options"
          aria-activedescendant={`${id}-${active}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setActive(
                (v) =>
                  (v + (e.key === "ArrowDown" ? 1 : -1) + options.length) %
                  options.length,
              );
            }
            if (e.key === "Home" || e.key === "End") {
              e.preventDefault();
              setActive(e.key === "Home" ? 0 : options.length - 1);
            }
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              choose(active);
            }
            if (e.key === "Escape") {
              e.preventDefault();
              setOpen(false);
              trigger.current?.focus();
            }
            if (e.key === "Tab") setOpen(false);
          }}
        >
          {options.map((o, index) => (
            <div
              role="option"
              id={`${id}-${index}`}
              aria-selected={value === o.value}
              className={active === index ? "option-active" : ""}
              key={o.value}
              onPointerMove={() => setActive(index)}
              onClick={() => choose(index)}
            >
              {o.label}
              {o.value === value && <Check size={15} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
