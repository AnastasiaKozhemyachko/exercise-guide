import { useEffect, useState } from "react";
import {
  parseStoredReview,
  migrateConfirmedApprovals,
  reviewStorageKey,
  type ReviewState,
} from "./review";
export function useReview() {
  const [initial] = useState(() => {
    try {
      const old = parseStoredReview(localStorage.getItem(reviewStorageKey));
      const results = migrateConfirmedApprovals(old);
      if (JSON.stringify(old) !== JSON.stringify(results))
        localStorage.setItem(
          reviewStorageKey,
          JSON.stringify({ version: 1, results }),
        );
      return { results, error: "" };
    } catch {
      return {
        results: migrateConfirmedApprovals({}),
        error:
          "Не удалось прочитать сохранённые оценки. Экспортируй результаты этой сессии, прежде чем закрывать страницу.",
      };
    }
  });
  const [results, setResults] = useState<ReviewState>(initial.results);
  const [storageError, setStorageError] = useState(initial.error);
  function update(next: ReviewState | ((old: ReviewState) => ReviewState)) {
    setResults((old) => {
      const value = typeof next === "function" ? next(old) : next;
      try {
        localStorage.setItem(
          reviewStorageKey,
          JSON.stringify({ version: 1, results: value }),
        );
        setStorageError("");
      } catch {
        setStorageError(
          "Браузер не разрешил сохранить оценки. Скачай ZIP, чтобы не потерять результаты.",
        );
      }
      return value;
    });
  }
  useEffect(() => {
    const listener = (e: StorageEvent) => {
      if (e.key === reviewStorageKey) {
        try {
          const old = parseStoredReview(e.newValue);
          const results = migrateConfirmedApprovals(old);
          if (JSON.stringify(old) !== JSON.stringify(results))
            localStorage.setItem(
              reviewStorageKey,
              JSON.stringify({ version: 1, results }),
            );
          setResults(results);
        } catch {
          setStorageError("Не удалось прочитать изменения из другой вкладки.");
        }
      }
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);
  return { results, update, storageError };
}
