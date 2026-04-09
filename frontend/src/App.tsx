import { FilterBar } from "./components/FilterBar";
import { ResultsList } from "./components/ResultsList";
import { SearchBar } from "./components/SearchBar";
import { useSearch } from "./hooks/useSearch";

function App() {
  const { chips, sort, results, loading, addChip, removeChip, setSort } =
    useSearch();

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
          <FilterBar chips={chips} onRemove={removeChip} />
        </div>

        <ResultsList
          results={results}
          loading={loading}
          sort={sort}
          onSortChange={setSort}
        />
      </div>
    </div>
  );
}

export default App;
