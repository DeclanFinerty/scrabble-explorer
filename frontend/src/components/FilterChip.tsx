import type { FilterChipData } from "../types";

const TYPE_COLORS: Record<string, string> = {
  has_letters: "bg-emerald-100 text-emerald-800 border-emerald-300",
  has_substring: "bg-teal-100 text-teal-800 border-teal-300",
  not_containing: "bg-red-100 text-red-800 border-red-300",
  from_letters_only: "bg-cyan-100 text-cyan-800 border-cyan-300",
  starting_with: "bg-blue-100 text-blue-800 border-blue-300",
  ending_with: "bg-blue-100 text-blue-800 border-blue-300",
  length: "bg-amber-100 text-amber-800 border-amber-300",
  letter_at: "bg-violet-100 text-violet-800 border-violet-300",
  matching_pattern: "bg-violet-100 text-violet-800 border-violet-300",
  min_score: "bg-orange-100 text-orange-800 border-orange-300",
};

export function FilterChip({
  chip,
  onRemove,
  onUpdate,
}: {
  chip: FilterChipData;
  onRemove: (id: string) => void;
  onUpdate?: (id: string, chip: FilterChipData) => void;
}) {
  const colors =
    TYPE_COLORS[chip.filter.type] ?? "bg-gray-100 text-gray-800 border-gray-300";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${colors}`}
    >
      {chip.label}
      {chip.filter.type === "letter_at" && onUpdate && (
        <span className="inline-flex items-center gap-0.5 ml-0.5">
          <span className="text-xs opacity-70">pos</span>
          <input
            type="number"
            min={0}
            max={14}
            value={chip.filter.position ?? 0}
            onChange={(e) => {
              const pos = Math.max(0, Math.min(14, parseInt(e.target.value) || 0));
              onUpdate(chip.id, {
                ...chip,
                filter: { ...chip.filter, position: pos },
                label: `${chip.filter.letter} at position ${pos}`,
              });
            }}
            className="w-8 rounded border border-current/20 bg-transparent px-1 py-0 text-center text-xs font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </span>
      )}
      <button
        onClick={() => onRemove(chip.id)}
        className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10 cursor-pointer"
        aria-label={`Remove ${chip.label}`}
      >
        &times;
      </button>
    </span>
  );
}
