import { useCallback, useEffect, useState } from "react";
import { searchWords } from "../api/client";
import type { FilterChipData, SearchResponse, SortMode } from "../types";
import { useDebounce } from "./useDebounce";

export function useSearch() {
  const [chips, setChips] = useState<FilterChipData[]>([]);
  const [sort, setSort] = useState<SortMode>("score");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const debouncedChips = useDebounce(chips, 250);
  const debouncedSort = useDebounce(sort, 250);

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

  useEffect(() => {
    if (debouncedChips.length === 0) {
      setResults(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const filters = debouncedChips.map((c) => c.filter);
    searchWords(filters, debouncedSort).then(
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
  }, [debouncedChips, debouncedSort]);

  return { chips, sort, results, loading, addChip, removeChip, updateChip, setSort };
}
