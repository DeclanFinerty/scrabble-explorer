import { useState } from "react";
import type { FilterChipData } from "../types";
import { FilterSuggestions } from "./FilterSuggestions";

export function SearchBar({
  onAddChip,
}: {
  onAddChip: (chip: FilterChipData) => void;
}) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSelect = (chip: FilterChipData) => {
    onAddChip(chip);
    setInput("");
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Type letters, numbers, or patterns to add filters..."
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base shadow-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
      {focused && input.trim() && (
        <FilterSuggestions input={input} onSelect={handleSelect} />
      )}
    </div>
  );
}
