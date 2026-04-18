import type { WordResult } from "../types";

export function LengthDistribution({ words }: { words: WordResult[] }) {
  const counts: Record<number, number> = {};
  for (const w of words) {
    counts[w.length] = (counts[w.length] || 0) + 1;
  }

  const lengths = Object.keys(counts)
    .map(Number)
    .sort((a, b) => a - b);

  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div>
      <div className="space-y-1.5">
        {lengths.map((len) => (
          <div key={len} className="flex items-center gap-2">
            <span className="w-5 text-right text-xs text-gray-500 font-mono">
              {len}
            </span>
            <div className="flex-1 h-5 rounded-sm bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-sm bg-amber-400 transition-all duration-300"
                style={{ width: `${(counts[len] / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-8 text-xs text-gray-400 font-mono">
              {counts[len]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
