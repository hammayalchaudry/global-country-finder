import React, { useState, useEffect } from 'react';

function App() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCountriesData();
  }, []);

  const fetchCountriesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://restcountries.com/v3.1/all');
      
      if (!response.ok) {
        throw new Error('Primary server unreachable.');
      }
      
      const data = await response.json();
      if (Array.isArray(data)) {
        processCountries(data);
      } else {
        throw new Error('Format error.');
      }
    } catch (err) {
      // Direct Fallback to rich open-source global dataset if main API is blocked locally
      try {
        const fallbackRes = await fetch('https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-population.json');
        const populationData = await fallbackRes.json();
        
        const richRes = await fetch('https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json');
        const richData = await richRes.json();
        
        if (Array.isArray(richData) && Array.isArray(populationData)) {
          const combined = richData.map(r => {
            const match = populationData.find(p => p.country?.toLowerCase() === r.name?.common?.toLowerCase());
            return {
              cca3: r.cca3,
              cca2: r.cca2,
              name: { common: r.name?.common },
              population: match ? match.population : (r.population || 0),
              region: r.region || 'Global',
              capital: r.capital && r.capital.length > 0 ? r.capital : ['N/A'],
              flags: { png: r.cca2 ? `https://flagcdn.com/w320/${r.cca2.toLowerCase()}.png` : '' }
            };
          }).sort((a, b) => a.name.common.localeCompare(b.name.common));
          
          setCountries(combined);
          setLoading(false);
          return;
        }
      } catch(e) {}

      setError('Connection failed. Please check your internet connection.');
      setLoading(false);
    }
  };

  const processCountries = (data) => {
    const sortedData = data.sort((a, b) => {
      const nameA = a.name?.common || '';
      const nameB = b.name?.common || '';
      return nameA.localeCompare(nameB);
    });
    setCountries(sortedData);
    setLoading(false);
  };

  const filteredCountries = countries.filter(country =>
    country.name?.common?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 antialiased font-sans">
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

      <main className="max-w-6xl mx-auto px-4 py-10">
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-400 font-medium text-sm">Syncing live stable database... 🌐</p>
          </div>
        )}

        {error && !loading && (
          <div className="max-w-md mx-auto bg-red-950/30 border border-red-800 rounded-2xl p-6 text-center shadow-xl mt-10">
            <span className="text-4xl block mb-2">⚠️</span>
            <h3 className="text-lg font-bold text-red-400 mb-2">Sync Failed</h3>
            <p className="text-zinc-400 text-xs mb-5">{error}</p>
            <button onClick={fetchCountriesData} className="bg-red-800 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition cursor-pointer">
              🔄 Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div>
            <p className="text-zinc-400 text-xs mb-6 font-medium">
              Showing <span className="text-emerald-500 font-bold">{filteredCountries.length}</span> countries
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCountries.map((country, index) => (
                <div key={country.cca3 || index} className="bg-zinc-800 rounded-2xl border border-zinc-700/60 overflow-hidden shadow-md flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
                  <div className="h-40 w-full bg-zinc-700/30 overflow-hidden border-b border-zinc-700/60">
                    <img 
                      src={country.flags?.png} 
                      alt={country.name?.common || 'Flag'} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/320x200?text=Flag+Unavailable'; }}
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <h4 className="font-extrabold text-zinc-100 text-base mb-3 tracking-tight">{country.name?.common || 'N/A'}</h4>
                    <div className="space-y-1.5 text-xs text-zinc-400">
                      <div className="flex justify-between"><span>Capital:</span><span className="font-bold text-zinc-200">{country.capital ? (Array.isArray(country.capital) ? country.capital[0] : country.capital) : 'N/A'}</span></div>
                      <div className="flex justify-between"><span>Region:</span><span className="font-medium text-zinc-300">{country.region || 'N/A'}</span></div>
                      <div className="flex justify-between"><span>Population:</span><span className="font-mono text-zinc-200">{country.population ? Number(country.population).toLocaleString() : 'N/A'}</span></div>
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
