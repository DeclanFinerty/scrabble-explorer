import { useCallback, useEffect, useState } from "react";
import { solveRack } from "../api/client";
import type { RackResponse, SortMode } from "../types";
import { useDebounce } from "./useDebounce";

export function useRack() {
  const [letters, setLetters] = useState<string[]>(Array(7).fill(""));
  const [sort, setSort] = useState<SortMode>("score");
  const [descending, setDescending] = useState(true);
  const [results, setResults] = useState<RackResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const filledLetters = letters.filter((l) => l !== "");
  const debouncedLetters = useDebounce(filledLetters, 300);
  const debouncedSort = useDebounce(sort, 300);
  const debouncedDesc = useDebounce(descending, 300);

  const setLetter = useCallback((index: number, value: string) => {
    setLetters((prev) => {
      const next = [...prev];
      next[index] = value.toUpperCase();
      return next;
    });
  }, []);

  const clearRack = useCallback(() => {
    setLetters(Array(7).fill(""));
    setResults(null);
  }, []);

  const toggleSort = useCallback((s: SortMode) => {
    if (s === sort) {
      setDescending((prev) => !prev);
    } else {
      setSort(s);
      setDescending(true);
    }
  }, [sort]);

  useEffect(() => {
    if (debouncedLetters.length === 0) {
      setResults(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    solveRack(debouncedLetters, debouncedSort, debouncedDesc).then(
      (data) => {
        if (!cancelled) {
          setResults(data);
          setLoading(false);
        }
      },
      () => {
        if (!cancelled) setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [debouncedLetters, debouncedSort, debouncedDesc]);

  return { letters, sort, descending, results, loading, setLetter, toggleSort, clearRack };
}
