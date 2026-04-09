import { useState } from "react";
import { FilterBar } from "./components/FilterBar";
import { ResultsList } from "./components/ResultsList";
import { SearchBar } from "./components/SearchBar";
import { WordCard } from "./components/WordCard";
import { useSearch } from "./hooks/useSearch";

function App() {
  const { chips, sort, results, loading, addChip, removeChip, updateChip, setSort } =
    useSearch();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Scrabble Explorer
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Search, filter, and explore the Scrabble dictionary
          </p>
        </header>

        <div className="space-y-3">
          <SearchBar onAddChip={addChip} />
          <FilterBar chips={chips} onRemove={removeChip} onUpdate={updateChip} />
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
          results={results}
          loading={loading}
          sort={sort}
          onSortChange={setSort}
          onWordClick={handleWordClick}
          selectedWord={selectedWord}
        />
      </div>
    </div>
  );
}

export default App;
