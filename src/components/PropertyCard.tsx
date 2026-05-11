"use client";

import Link from "next/link";
import { formatPrice, timeAgo } from "@/lib/utils";
import { toggleFavoriteAction } from "@/app/actions/property";
import { useState } from "react";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    currency: string;
    type: string;
    category: string;
    city: string;
    district: string;
    area: number | null;
    rooms: string | null;
    bathrooms: number | null;
    createdAt: Date | string;
    images: { url: string; isVideo: boolean }[];
    user: { name: string; avatar: string | null };
  };
  isFavorited?: boolean;
  showFavorite?: boolean;
}

export function PropertyCard({ property, isFavorited = false, showFavorite = true }: PropertyCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [imageIndex, setImageIndex] = useState(0);

  const images = property.images.filter((img) => !img.isVideo);
  const mainImage = images[imageIndex]?.url || "/placeholder-property.svg";

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleFavoriteAction(property.id);
    if ("favorited" in result && result.favorited !== undefined) {
      setFavorited(result.favorited);
    }
  };

  return (
    <Link href={`/ilan/${property.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-blue-200">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-property.svg";
            }}
          />

          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
              property.type === "satilik" ? "bg-emerald-500" : "bg-orange-500"
            }`}>
              {property.type === "satilik" ? "Satılık" : "Kiralık"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-700 backdrop-blur-sm">
              {property.category.charAt(0).toUpperCase() + property.category.slice(1)}
            </span>
          </div>

          {showFavorite && (
            <button
              onClick={handleFavorite}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            >
              <svg
                className={`w-5 h-5 transition-colors ${favorited ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                fill={favorited ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {images.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImageIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${i === imageIndex ? "bg-white w-4" : "bg-white/60"}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {property.title}
            </h3>
          </div>

          <p className="text-2xl font-bold text-blue-600 mb-2">
            {formatPrice(property.price, property.currency)}
            {property.type === "kiralik" && <span className="text-sm font-normal text-gray-500">/ay</span>}
          </p>

          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.district}, {property.city}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
            {property.rooms && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {property.rooms}
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
                {property.bathrooms} Banyo
              </span>
            )}
            {property.area && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
                {property.area} m²
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs overflow-hidden">
                {property.user.avatar ? (
                  <img src={property.user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  property.user.name.charAt(0)
                )}
              </div>
              <span className="text-xs text-gray-500">{property.user.name}</span>
            </div>
            <span className="text-xs text-gray-400">{timeAgo(property.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
