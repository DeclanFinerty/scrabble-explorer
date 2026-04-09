import { useCallback, useEffect, useMemo, useState } from "react";
import { searchWords } from "../api/client";
import type { FilterChipData, SearchResponse, SortMode, WordResult } from "../types";
import { useDebounce } from "./useDebounce";

const DISPLAY_LIMIT = 100;

export function useSearch() {
  const [chips, setChips] = useState<FilterChipData[]>([]);
  const [sort, setSort] = useState<SortMode>("score");
  const [descending, setDescending] = useState(true);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const debouncedChips = useDebounce(chips, 250);
  const debouncedSort = useDebounce(sort, 250);
  const debouncedDesc = useDebounce(descending, 250);

  const addChip = useCallback((chip: FilterChipData) => {
    const SINGLETON_TYPES = new Set(["starting_with", "ending_with"]);
    setChips((prev) => {
      const filtered = SINGLETON_TYPES.has(chip.filter.type)
        ? prev.filter((c) => c.filter.type !== chip.filter.type)
        : prev;
      return [...filtered, chip];
    });
  }, []);

  const removeChip = useCallback((id: string) => {
    setChips((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateChip = useCallback((id: string, updated: FilterChipData) => {
    setChips((prev) => prev.map((c) => (c.id === id ? updated : c)));
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
    if (debouncedChips.length === 0) {
      setResults(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const filters = debouncedChips.map((c) => c.filter);
    searchWords(filters, debouncedSort, debouncedDesc, 10000).then(
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
  }, [debouncedChips, debouncedSort, debouncedDesc]);

  // All words for charts (full result set from API)
  const allWords: WordResult[] = results?.words ?? [];

  // Display-limited slice for the results list
  const displayResults = useMemo<SearchResponse | null>(() => {
    if (!results) return null;
    return {
      ...results,
      words: results.words.slice(0, DISPLAY_LIMIT),
    };
  }, [results]);

  return { chips, sort, descending, allWords, displayResults, loading, addChip, removeChip, updateChip, toggleSort };
}
