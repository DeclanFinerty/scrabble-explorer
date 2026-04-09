export type FilterType =
  | "has_letters"
  | "has_substring"
  | "not_containing"
  | "from_letters_only"
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

export interface FamilyExtension {
  word: string;
  suffix: string;
  score: number;
}

export interface FamilyPrefix {
  word: string;
  prefix: string;
  score: number;
}

export interface WordFamily {
  root: string;
  extensions: FamilyExtension[];
  prefixes: FamilyPrefix[];
}

export interface WordInfoResponse {
  word: string;
  valid: boolean;
  score: number;
  length: number;
  family: WordFamily | null;
}

export interface RackWordResult {
  word: string;
  score: number;
  length: number;
  bingo: boolean;
  blank_positions: number[];
}

export interface RackResponse {
  words: RackWordResult[];
  total_count: number;
}

// Letter point values (standard Scrabble)
export const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4,
  G: 2, H: 4, I: 1, J: 8, K: 5, L: 1,
  M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1,
  S: 1, T: 1, U: 1, V: 4, W: 4, X: 8,
  Y: 4, Z: 10,
};
