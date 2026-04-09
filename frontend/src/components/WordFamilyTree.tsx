import { useState } from "react";
import type { WordFamily } from "../types";

const INITIAL_SHOW = 5;

function BranchGroup({
  title,
  items,
  onWordClick,
}: {
  title: string;
  items: { word: string; affix: string; score: number }[];
  onWordClick: (word: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, INITIAL_SHOW);
  const remaining = items.length - INITIAL_SHOW;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </h4>
        {remaining > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
          >
            {expanded ? "Show less" : `+${remaining} more`}
          </button>
        )}
      </div>
      <div className="space-y-0.5">
        {visible.map((item) => (
          <button
            key={item.word}
            onClick={() => onWordClick(item.word)}
            className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-gray-50 cursor-pointer"
          >
            <span className="font-mono text-gray-300 group-hover:text-gray-400">
              ├─
            </span>
            <span className="font-mono font-semibold tracking-wide text-gray-700 group-hover:text-indigo-600">
              {item.word}
            </span>
            <span className="text-xs text-gray-400">
              +{item.affix}
            </span>
            <span className="ml-auto text-xs text-gray-400">
              {item.score} pts
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function WordFamilyTree({
  family,
  onWordClick,
}: {
  family: WordFamily;
  onWordClick: (word: string) => void;
}) {
  const extensions = family.extensions.map((e) => ({
    word: e.word,
    affix: e.suffix,
    score: e.score,
  }));

  const prefixes = family.prefixes.map((p) => ({
    word: p.word,
    affix: p.prefix,
    score: p.score,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="rounded bg-indigo-100 px-2.5 py-1 font-mono text-sm font-bold text-indigo-700">
          {family.root}
        </span>
        <span className="text-xs text-gray-400">root word</span>
      </div>

      <BranchGroup
        title="Extensions"
        items={extensions}
        onWordClick={onWordClick}
      />
      <BranchGroup
        title="Prefixes"
        items={prefixes}
        onWordClick={onWordClick}
      />

      {extensions.length === 0 && prefixes.length === 0 && (
        <p className="text-sm text-gray-400 italic">No family members found</p>
      )}
    </div>
  );
}
