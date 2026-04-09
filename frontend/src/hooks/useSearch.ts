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
    setChips((prev) => [...prev, chip]);
  }, []);

  const removeChip = useCallback((id: string) => {
    setChips((prev) => prev.filter((c) => c.id !== id));
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

  return { chips, sort, results, loading, addChip, removeChip, setSort };
}
