import { useState } from "react";
import type { WordResult } from "../types";

type SortBy = "frequency" | "alpha";

export function LetterFrequency({ words }: { words: WordResult[] }) {
  const [sortBy, setSortBy] = useState<SortBy>("frequency");

  const freq: Record<string, number> = {};
  for (const w of words) {
    for (const ch of w.word) {
      freq[ch] = (freq[ch] || 0) + 1;
    }
  }

  let entries = Object.entries(freq);
  if (sortBy === "frequency") {
    entries.sort((a, b) => b[1] - a[1]);
  } else {
    entries.sort((a, b) => a[0].localeCompare(b[0]));
  }

  const maxFreq = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Letter frequency
        </h4>
        <button
          onClick={() => setSortBy(sortBy === "frequency" ? "alpha" : "frequency")}
          className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
        >
          {sortBy === "frequency" ? "A-Z" : "By count"}
        </button>
      </div>
      <div className="space-y-0.5">
        {entries.map(([letter, count]) => (
          <div key={letter} className="flex items-center gap-1.5">
            <span className="w-4 text-center text-xs font-bold text-gray-600 font-mono">
              {letter}
            </span>
            <div className="flex-1 h-3.5 rounded-sm bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-sm bg-emerald-400 transition-all duration-300"
                style={{ width: `${(count / maxFreq) * 100}%` }}
              />
            </div>
            <span className="w-7 text-right text-[10px] text-gray-400 font-mono">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
