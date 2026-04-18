import type { WordResult } from "../types";

const BUCKETS = [
  { label: "1-4", min: 1, max: 4 },
  { label: "5-9", min: 5, max: 9 },
  { label: "10-14", min: 10, max: 14 },
  { label: "15-19", min: 15, max: 19 },
  { label: "20-24", min: 20, max: 24 },
  { label: "25+", min: 25, max: Infinity },
];

export function ScoreDistribution({ words }: { words: WordResult[] }) {
  const counts = BUCKETS.map((b) => ({
    ...b,
    count: words.filter((w) => w.score >= b.min && w.score <= b.max).length,
  }));

  const maxCount = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div>
      <div className="space-y-1.5">
        {counts.map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <span className="w-8 text-right text-xs text-gray-500 font-mono">
              {b.label}
            </span>
            <div className="flex-1 h-5 rounded-sm bg-gray-100 overflow-hidden">
              {b.count > 0 && (
                <div
                  className="h-full rounded-sm bg-indigo-400 transition-all duration-300"
                  style={{ width: `${(b.count / maxCount) * 100}%` }}
                />
              )}
            </div>
            <span className="w-8 text-xs text-gray-400 font-mono">
              {b.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
