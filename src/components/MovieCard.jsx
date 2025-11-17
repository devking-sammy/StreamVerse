import React from "react";
import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
  const poster = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  return (
    <Link to={`/movie/${movie.id}`}>
      <div className="bg-gray-900 p-2 rounded-lg shadow-md hover:scale-105 transition">
        <img
          src={poster}
          alt={movie.title}
          className="rounded-lg mb-2 w-full h-72 object-cover"
        />
        <h3 className="font-semibold text-lg truncate">{movie.title}</h3>
      </div>
    </Link>
  );
}
