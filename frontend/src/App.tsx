import { useState } from "react";
import { FilterBar } from "./components/FilterBar";
import { RackInput } from "./components/RackInput";
import { RackResults } from "./components/RackResults";
import { ResultsList } from "./components/ResultsList";
import { SearchBar } from "./components/SearchBar";
import { WordCard } from "./components/WordCard";
import { useRack } from "./hooks/useRack";
import { useSearch } from "./hooks/useSearch";

type Tab = "search" | "rack";

function App() {
  const [tab, setTab] = useState<Tab>("search");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const search = useSearch();
  const rack = useRack();

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
  };

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

            <ResultsList
              results={search.results}
              loading={search.loading}
              sort={search.sort}
              onSortChange={search.setSort}
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
              onSortChange={rack.setSort}
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
