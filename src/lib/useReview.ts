import { useEffect, useState } from "react";
import {
  parseStoredReview,
  reviewStorageKey,
  type ReviewState,
} from "./review";
export function useReview() {
  const [initial] = useState(() => {
    try {
      return {
        results: parseStoredReview(localStorage.getItem(reviewStorageKey)),
        error: "",
      };
    } catch {
      return {
        results: {} as ReviewState,
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
          setResults(parseStoredReview(e.newValue));
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
