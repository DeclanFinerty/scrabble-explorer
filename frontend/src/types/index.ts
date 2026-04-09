export type FilterType =
  | "containing"
  | "not_containing"
  | "starting_with"
  | "ending_with"
  | "length"
  | "letter_at"
  | "matching_pattern"
  | "min_score";

export type SortMode = "score" | "length" | "alphabetical";

export interface SearchFilter {
  type: FilterType;
  value?: string;
  min?: number;
  max?: number;
  position?: number;
  letter?: string;
}

export interface WordResult {
  word: string;
  score: number;
  length: number;
}

export interface SearchResponse {
  words: WordResult[];
  total_count: number;
  filters_applied: number;
}

export interface FilterChipData {
  id: string;
  filter: SearchFilter;
  label: string;
}
