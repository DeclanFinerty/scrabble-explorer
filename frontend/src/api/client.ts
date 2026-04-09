import type { RackResponse, SearchFilter, SearchResponse, SortMode, WordInfoResponse } from "../types";

export async function searchWords(
  filters: SearchFilter[],
  sort: SortMode = "score",
  descending: boolean = true,
  limit: number = 100
): Promise<SearchResponse> {
  const resp = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filters, sort, descending, limit }),
  });
  if (!resp.ok) throw new Error(`Search failed: ${resp.status}`);
  return resp.json();
}

export async function getWordInfo(word: string): Promise<WordInfoResponse> {
  const resp = await fetch(`/api/word/${encodeURIComponent(word)}`);
  if (!resp.ok) throw new Error(`Word lookup failed: ${resp.status}`);
  return resp.json();
}

export async function solveRack(
  letters: string[],
  sort: SortMode = "score",
  descending: boolean = true,
  limit: number = 100
): Promise<RackResponse> {
  const resp = await fetch("/api/rack", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ letters, sort, descending, limit }),
  });
  if (!resp.ok) throw new Error(`Rack solve failed: ${resp.status}`);
  return resp.json();
}
