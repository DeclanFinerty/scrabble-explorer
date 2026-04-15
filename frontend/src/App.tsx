import { useEffect, useState } from "react";
import { FilterBar } from "./components/FilterBar";
import { LengthDistribution } from "./components/LengthDistribution";
import { LetterFrequency } from "./components/LetterFrequency";
import { RackInput } from "./components/RackInput";
import { RackResults } from "./components/RackResults";
import { ResultsList } from "./components/ResultsList";
import { ScoreDistribution } from "./components/ScoreDistribution";
import { SearchBar } from "./components/SearchBar";
import { WordCard } from "./components/WordCard";
import { useRack } from "./hooks/useRack";
import { useSearch } from "./hooks/useSearch";

type Tab = "search" | "rack";

function App() {
  const [tab, setTab] = useState<Tab>("search");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [chartsOpen, setChartsOpen] = useState(false);

  const search = useSearch();
  const rack = useRack();

  useEffect(() => setSelectedWord(null), [tab]);
  useEffect(() => setSelectedWord(null), [search.displayResults]);
  useEffect(() => setSelectedWord(null), [rack.letters]);

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
  };

  const hasResults = search.allWords.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Scrabble Explorer
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Search, filter, and explore the Scrabble dictionary
          </p>
        </header>

        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setTab("search")}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                tab === "search"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Search
            </button>
            <button
              onClick={() => setTab("rack")}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                tab === "rack"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Rack Solver
            </button>
          </div>
        </div>

        {tab === "search" && (
          <>
            <div className="space-y-3">
              <SearchBar onAddChip={search.addChip} />
              <FilterBar
                chips={search.chips}
                onRemove={search.removeChip}
                onUpdate={search.updateChip}
              />
            </div>

            {selectedWord && (
              <div className="mt-6">
                <WordCard
                  word={selectedWord}
                  onWordClick={handleWordClick}
                  onClose={() => setSelectedWord(null)}
                />
              </div>
            )}

            {hasResults && (
              <div className="mt-4">
                <button
                  onClick={() => setChartsOpen(!chartsOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                >
                  <svg
                    className={`h-4 w-4 transition-transform ${chartsOpen ? "rotate-90" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Charts
                </button>
                {chartsOpen && (
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <ScoreDistribution words={search.allWords} />
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <LengthDistribution words={search.allWords} />
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:col-span-2">
                      <LetterFrequency words={search.allWords} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <ResultsList
              results={search.displayResults}
              loading={search.loading}
              sort={search.sort}
              descending={search.descending}
              onToggleSort={search.toggleSort}
              onWordClick={handleWordClick}
              selectedWord={selectedWord}
            />
          </>
        )}

        {tab === "rack" && (
          <>
            <RackInput
              letters={rack.letters}
              onSetLetter={rack.setLetter}
              onClear={rack.clearRack}
            />

            {selectedWord && (
              <div className="mt-6">
                <WordCard
                  word={selectedWord}
                  onWordClick={handleWordClick}
                  onClose={() => setSelectedWord(null)}
                />
              </div>
            )}

            <RackResults
              results={rack.results}
              loading={rack.loading}
              sort={rack.sort}
              descending={rack.descending}
              onToggleSort={rack.toggleSort}
              onWordClick={handleWordClick}
              selectedWord={selectedWord}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
