import { useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { ResultsList } from './components/ResultsList';
import { searchTrains, type SearchParams, type SearchResponse } from './api';

function App() {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await searchTrains(params);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neo-peach bg-[radial-gradient(#FF69B4_1px,transparent_1px)] [background-size:20px_20px] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold bg-neo-pink text-white inline-block px-8 py-3 border-3 border-neo-black shadow-neo-lg transform -rotate-2">
            RAILWAY OPTIMIZER
          </h1>
          <p className="mt-6 text-xl font-bold bg-white text-neo-black inline-block px-6 py-2 border-3 border-neo-black transform rotate-1 shadow-neo-sm">
            ✨ Find the perfect route. Direct or Break Journey. ✨
          </p>
        </header>

        <main>
          <SearchForm onSearch={handleSearch} isLoading={loading} />

          {error && (
            <div className="mt-8 bg-red-100 border-3 border-neo-black p-4 text-red-900 font-bold text-xl shadow-neo flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          {results && <ResultsList options={results.options} />}
        </main>

      </div>
    </div>
  );
}

export default App;
