import type { RackResponse, RackWordResult, SortMode } from "../types";

function WordWithBlanks({ word: w }: { word: RackWordResult }) {
  const blanks = new Set(w.blank_positions);
  if (blanks.size === 0) {
    return (
      <span className="font-mono font-semibold tracking-wide text-gray-800">
        {w.word}
      </span>
    );
  }
  return (
    <span className="font-mono font-semibold tracking-wide">
      {w.word.split("").map((ch, i) => (
        <span
          key={i}
          className={blanks.has(i) ? "text-red-500" : "text-gray-800"}
          title={blanks.has(i) ? `${ch} (blank, 0 pts)` : undefined}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "score", label: "Score" },
  { value: "length", label: "Length" },
  { value: "alphabetical", label: "A-Z" },
];

function SortArrow({ active, descending }: { active: boolean; descending: boolean }) {
  if (!active) return null;
  return (
    <span className="ml-0.5 text-[10px]">{descending ? "\u25BC" : "\u25B2"}</span>
  );
}

export function RackResults({
  results,
  loading,
  sort,
  descending,
  onToggleSort,
  onWordClick,
  selectedWord,
}: {
  results: RackResponse | null;
  loading: boolean;
  sort: SortMode;
  descending: boolean;
  onToggleSort: (s: SortMode) => void;
  onWordClick: (word: string) => void;
  selectedWord: string | null;
}) {
  if (!results && !loading) {
    return (
      <div className="mt-8 text-center text-gray-400">
        <p className="text-lg">Enter letters above to find words</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          {loading && !results ? (
            "Solving..."
          ) : results ? (
            <>
              <span className="font-semibold text-gray-700">
                {results.total_count.toLocaleString()}
              </span>{" "}
              words found
            </>
          ) : null}
        </p>
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onToggleSort(opt.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                sort === opt.value
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {opt.label}
              <SortArrow active={sort === opt.value} descending={descending} />
            </button>
          ))}
        </div>
      </div>

      {loading && !results ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      ) : results ? (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          {results.words.map((w) => (
            <button
              key={w.word}
              onClick={() => onWordClick(w.word)}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors cursor-pointer ${
                selectedWord === w.word
                  ? "bg-indigo-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <WordWithBlanks word={w} />
                {w.bingo && (
                  <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fuchsia-700">
                    Bingo!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  <span className="font-medium text-gray-700">{w.score}</span>{" "}
                  pts
                </span>
                <span className="text-gray-300">|</span>
                <span>{w.length} letters</span>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
