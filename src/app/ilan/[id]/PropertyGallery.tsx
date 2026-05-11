"use client";

import { useState } from "react";

interface PropertyGalleryProps {
  images: { id: string; url: string; isVideo: boolean }[];
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>Görsel eklenmemiş</p>
        </div>
      </div>
    );
  }

  const currentImage = images[selectedIndex];

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div
          className="aspect-[16/9] bg-gray-100 rounded-2xl overflow-hidden relative cursor-pointer group"
          onClick={() => setFullscreen(true)}
        >
          {currentImage.isVideo ? (
            <video
              src={currentImage.url}
              controls
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <img
              src={currentImage.url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}

          <div className="absolute bottom-3 right-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setSelectedIndex(index)}
                className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  index === selectedIndex ? "border-blue-500 ring-2 ring-blue-200" : "border-transparent hover:border-gray-300"
                }`}
              >
                {img.isVideo ? (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                ) : (
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="max-w-5xl w-full px-4" onClick={(e) => e.stopPropagation()}>
            {currentImage.isVideo ? (
              <video src={currentImage.url} controls className="w-full max-h-[80vh] object-contain" />
            ) : (
              <img src={currentImage.url} alt="" className="w-full max-h-[80vh] object-contain" />
            )}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
