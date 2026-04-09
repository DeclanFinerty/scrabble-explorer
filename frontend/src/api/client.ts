import type { SearchFilter, SearchResponse, SortMode, WordInfoResponse } from "../types";

export async function searchWords(
  filters: SearchFilter[],
  sort: SortMode = "score",
  limit: number = 100
): Promise<SearchResponse> {
  const resp = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filters, sort, limit }),
  });
  if (!resp.ok) throw new Error(`Search failed: ${resp.status}`);
  return resp.json();
}

export async function getWordInfo(word: string): Promise<WordInfoResponse> {
  const resp = await fetch(`/api/word/${encodeURIComponent(word)}`);
  if (!resp.ok) throw new Error(`Word lookup failed: ${resp.status}`);
  return resp.json();
}
