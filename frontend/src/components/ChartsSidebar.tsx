import { useState } from "react";
import type { WordResult } from "../types";
import { LengthDistribution } from "./LengthDistribution";
import { LetterFrequency } from "./LetterFrequency";
import { ScoreDistribution } from "./ScoreDistribution";

const SECTIONS = [
  { id: "score", label: "Score Distribution" },
  { id: "length", label: "Length Distribution" },
  { id: "letters", label: "Letter Frequency" },
] as const;

export function ChartsSidebar({ words }: { words: WordResult[] }) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <h2 className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Charts
      </h2>
      <div className="divide-y divide-gray-100">
        {SECTIONS.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => toggle(section.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {section.label}
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${open.has(section.id) ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {open.has(section.id) && (
              <div className="px-4 pt-2 pb-4">
                {section.id === "score" && <ScoreDistribution words={words} />}
                {section.id === "length" && <LengthDistribution words={words} />}
                {section.id === "letters" && <LetterFrequency words={words} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
