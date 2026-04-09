import { useEffect, useState } from "react";
import { getWordInfo } from "../api/client";
import type { WordInfoResponse } from "../types";
import { LETTER_VALUES as VALUES } from "../types";
import { WordFamilyTree } from "./WordFamilyTree";

function LetterBreakdown({ word }: { word: string }) {
  return (
    <div className="flex gap-1">
      {word.split("").map((letter, i) => {
        const pts = VALUES[letter] ?? 0;
        return (
          <div
            key={i}
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-amber-300 bg-amber-50 font-mono text-lg font-bold text-amber-900"
          >
            {letter}
            <span className="absolute bottom-0.5 right-1 text-[9px] font-medium text-amber-600">
              {pts}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function WordCard({
  word,
  onWordClick,
  onClose,
}: {
  word: string;
  onWordClick: (word: string) => void;
  onClose: () => void;
}) {
  const [info, setInfo] = useState<WordInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getWordInfo(word).then(
      (data) => {
        setInfo(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [word]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-3 animate-pulse">
          <div className="h-6 w-32 rounded bg-gray-100" />
          <div className="h-10 w-64 rounded bg-gray-100" />
          <div className="h-4 w-48 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-2xl font-bold tracking-wider text-gray-900">
              {info.word}
            </h2>
            {info.valid ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                Valid
              </span>
            ) : (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                Invalid
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {info.length} letters &middot; {info.score} points
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition-colors"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6 px-6 py-5">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Letter breakdown
          </h3>
          <LetterBreakdown word={info.word} />
        </div>

        {info.family && (
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Word family
            </h3>
            <WordFamilyTree family={info.family} onWordClick={onWordClick} />
          </div>
        )}
      </div>
    </div>
  );
}
