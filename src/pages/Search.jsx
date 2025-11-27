import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`
      );
      setResults(res.data.results);
    } catch (err) {
      console.error("Error searching movies:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1724] text-white px-6 py-20">
      <h1 className="text-3xl font-bold mb-6 text-center text-red-500">
        Search Movies 🔍
      </h1>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex justify-center items-center mb-8"
      >
        <input
          type="text"
          placeholder="Search for a movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-2/3 md:w-1/2 px-4 py-2 rounded-l-lg bg-gray-800 text-white outline-none"
        />
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-r-lg"
        >
          <i className="fas fa-search"></i>
        </button>
      </form>

      {/* Loading */}
      {loading && <p className="text-center text-gray-400">Searching...</p>}

      {/* Results */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {results.map((movie) => (
          <div
            key={movie.id}
            onClick={() => navigate(`/movie/${movie.id}`)}
            className="relative cursor-pointer hover:scale-105 transition duration-300"
          >
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="rounded-xl shadow-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gray-800 flex items-center justify-center rounded-xl">
                <span className="text-gray-500 text-sm">No Image</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent p-2 rounded-b-xl">
              <p className="text-sm font-semibold truncate">{movie.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && results.length === 0 && query && (
        <p className="text-center text-gray-400 mt-10">
          No movies found for “{query}”.
        </p>
      )}
    </div>
  );
}
