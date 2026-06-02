"use client";

import { useState } from "react";

export default function ProductGallery({
  images,
  emoji,
  name,
  badge,
}: {
  images: string[];
  emoji: string;
  name: string;
  badge?: string | null;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface2 to-bg text-[140px]">
        {badge && <span className="absolute left-5 top-5 rounded-full bg-volt px-3 py-1.5 text-sm font-extrabold uppercase text-bg">{badge}</span>}
        {emoji}
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-surface2">
        {badge && <span className="absolute left-5 top-5 z-10 rounded-full bg-volt px-3 py-1.5 text-sm font-extrabold uppercase text-bg">{badge}</span>}
        <img src={images[active]} alt={name} className="h-full w-full object-cover" />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`aspect-square h-20 flex-none overflow-hidden rounded-lg border ${i === active ? "border-volt" : "border-line"}`}
            >
              <img src={src} alt={`${name} ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
