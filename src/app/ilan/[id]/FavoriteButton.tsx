"use client";

import { useState } from "react";
import { toggleFavoriteAction } from "@/app/actions/property";

export function FavoriteButton({ propertyId, isFavorited }: { propertyId: string; isFavorited: boolean }) {
  const [favorited, setFavorited] = useState(isFavorited);

  const handleClick = async () => {
    const result = await toggleFavoriteAction(propertyId);
    if ("favorited" in result && result.favorited !== undefined) {
      setFavorited(result.favorited);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
        favorited
          ? "bg-red-50 border-red-200 text-red-500"
          : "bg-gray-50 border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200"
      }`}
    >
      <svg
        className="w-6 h-6"
        fill={favorited ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
