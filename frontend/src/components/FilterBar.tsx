import type { FilterChipData } from "../types";
import { FilterChip } from "./FilterChip";

export function FilterBar({
  chips,
  onRemove,
  onUpdate,
}: {
  chips: FilterChipData[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, chip: FilterChipData) => void;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <FilterChip
          key={chip.id}
          chip={chip}
          onRemove={onRemove}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
