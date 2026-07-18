import React, { useState, useEffect } from 'react';

function App() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Live Public API se data lane ke liye
  useEffect(() => {
    fetchCountriesData();
  }, []);

  const fetchCountriesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://restcountries.com/v3.1/all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch data from the server.');
      }
      
      const data = await response.json();
      // Alphabetical order mein sort karne ke liye
      const sortedData = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
      
      setCountries(sortedData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please check your internet connection.');
      setLoading(false);
    }
  };

  // Search filter mechanism
  const filteredCountries = countries.filter(country =>
    country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 antialiased font-sans">
      {/* Header & Search Bar */}
      <header className="bg-zinc-800/80 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-700 px-4 py-5 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-black text-emerald-500 tracking-tight">
            🌍 Global Country Finder
          </h1>
          <div className="w-full sm:w-72 relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country by name..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        
        {/* 1. Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-400 font-medium text-sm">Fetching live data from Public API... 🌐</p>
          </div>
        )}

        {/* 2. Error State */}
        {error && !loading && (
          <div className="max-w-md mx-auto bg-red-950/30 border border-red-800 rounded-2xl p-6 text-center shadow-xl mt-10">
            <span className="text-4xl block mb-2">⚠️</span>
            <h3 className="text-lg font-bold text-red-400 mb-2">Connection Failed</h3>
            <p className="text-zinc-400 text-xs mb-5">{error}</p>
            <button onClick={fetchCountriesData} className="bg-red-800 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition cursor-pointer">
              🔄 Try Again
            </button>
          </div>
        )}

        {/* 3. Success Data Display */}
        {!loading && !error && (
          <div>
            <p className="text-zinc-400 text-xs mb-6 font-medium">
              Showing <span className="text-emerald-500 font-bold">{filteredCountries.length}</span> countries
            </p>

            {filteredCountries.length === 0 && (
              <div className="text-center py-20">
                <p className="text-zinc-500 text-sm font-medium">No countries found matching your search.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCountries.map((country, index) => (
                <div key={country.cca3 || index} className="bg-zinc-800 rounded-2xl border border-zinc-700/60 overflow-hidden shadow-md flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
                  <div className="h-40 w-full bg-zinc-700/30 overflow-hidden border-b border-zinc-700/60">
                    <img src={country.flags?.png || country.flags?.svg} alt={country.name.common} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <h4 className="font-extrabold text-zinc-100 text-base mb-3 tracking-tight">{country.name.common}</h4>
                    <div className="space-y-1.5 text-xs text-zinc-400">
                      <div className="flex justify-between"><span>Capital:</span><span className="font-bold text-zinc-200">{country.capital ? country.capital[0] : 'N/A'}</span></div>
                      <div className="flex justify-between"><span>Region:</span><span className="font-medium text-zinc-300">{country.region || 'N/A'}</span></div>
                      <div className="flex justify-between"><span>Population:</span><span className="font-mono text-zinc-200">{country.population?.toLocaleString() || '0'}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
