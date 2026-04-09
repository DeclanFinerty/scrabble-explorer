import type { FilterChipData, SearchFilter } from "../types";

interface Suggestion {
  label: string;
  filter: SearchFilter;
}

function generateSuggestions(input: string): Suggestion[] {
  const trimmed = input.trim().toUpperCase();
  if (!trimmed) return [];

  const suggestions: Suggestion[] = [];

  // Pattern with dots (e.g., "..G", "A.Z.E")
  if (/^[A-Z.]+$/.test(trimmed) && trimmed.includes(".")) {
    suggestions.push({
      label: `Matching pattern ${trimmed}`,
      filter: { type: "matching_pattern", value: trimmed },
    });
  }

  // Pure number → length and min score
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    suggestions.push(
      { label: `Length = ${n}`, filter: { type: "length", min: n, max: n } },
      { label: `Length >= ${n}`, filter: { type: "length", min: n } },
      { label: `Length <= ${n}`, filter: { type: "length", max: n } },
      { label: `Min score ${n}`, filter: { type: "min_score", value: String(n) } }
    );
    return suggestions;
  }

  // Number range "3-7" → length range
  const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    suggestions.push({
      label: `Length ${min}–${max}`,
      filter: { type: "length", min, max },
    });
    return suggestions;
  }

  // Letters only
  if (/^[A-Z]+$/.test(trimmed)) {
    suggestions.push(
      { label: `Containing ${trimmed}`, filter: { type: "containing", value: trimmed } },
      { label: `Starting with ${trimmed}`, filter: { type: "starting_with", value: trimmed } },
      { label: `Ending with ${trimmed}`, filter: { type: "ending_with", value: trimmed } },
      { label: `Not containing ${trimmed}`, filter: { type: "not_containing", value: trimmed } }
    );

    // Single letter → also offer letter_at
    if (trimmed.length === 1) {
      suggestions.push({
        label: `Letter ${trimmed} at position...`,
        filter: { type: "letter_at", position: 0, letter: trimmed },
      });
    }
  }

  return suggestions;
}

let chipIdCounter = 0;

export function FilterSuggestions({
  input,
  onSelect,
}: {
  input: string;
  onSelect: (chip: FilterChipData) => void;
}) {
  const suggestions = generateSuggestions(input);
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
      {suggestions.map((s, i) => (
        <button
          key={i}
          className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 cursor-pointer transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect({
              id: String(++chipIdCounter),
              filter: s.filter,
              label: s.label,
            });
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
