import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const favoritesRef = collection(db, "favorites");

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const snapshot = await getDocs(favoritesRef);
    // ✅ Use Firestore doc.id as unique ID to avoid duplicate keys
    const favs = snapshot.docs.map((d) => ({
      favId: d.id, // Firestore document ID
      ...d.data(),
    }));
    setFavorites(favs);
  };

  const removeFavorite = async (favId) => {
    await deleteDoc(doc(db, "favorites", favId)); // ✅ use Firestore doc ID
    setFavorites((prev) => prev.filter((f) => f.favId !== favId)); // instantly update UI
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-gray-400">
        <h2 className="text-3xl font-semibold mb-4">No Favorites Yet 😢</h2>
        <p className="text-gray-500 mb-8">
          Start adding movies to your favorites!
        </p>
        <button
          onClick={() => navigate("/home")}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg text-white font-semibold transition"
        >
          Go Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-6 md:px-12">
      <h1 className="text-4xl font-bold mb-10 text-center text-red-600">
        ❤️ Your Favorites
      </h1>

      {/* Movie Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {favorites.map((movie) => (
          <div
            key={movie.favId} // ✅ unique key per Firestore document
            className="group relative cursor-pointer transition-transform duration-300 hover:scale-105"
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
              alt={movie.title}
              className="rounded-2xl shadow-lg w-full h-auto"
              onClick={() => navigate(`/movie/${movie.movieId}`)} // ✅ use actual movie id here
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-center p-4 rounded-2xl">
              <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(movie.favId); // ✅ remove by Firestore ID
                }}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
