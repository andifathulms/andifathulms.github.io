'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface CardPreviewProps {
  hero: string;
  images: string[];
  alt: string;
  sizes: string;
}

/**
 * Card thumbnail that shows the hero image at rest and cross-fades through the
 * project's screenshots while hovered — signalling these are real, running apps.
 * Screenshots load only on first hover (never eagerly), and cycling is disabled
 * for reduced-motion users and where there are no screenshots.
 */
export default function CardPreview({ hero, images, alt, sizes }: CardPreviewProps) {
  const [hovering, setHovering] = useState(false);
  const [armed, setArmed] = useState(false);
  const [index, setIndex] = useState(0);

  const canCycle = images.length > 0;

  const onEnter = () => {
    if (!canCycle) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setArmed(true); // begin loading screenshots on first hover
    setHovering(true);
  };
  const onLeave = () => {
    setHovering(false);
    setIndex(0);
  };

  useEffect(() => {
    if (!hovering || !canCycle) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 1100);
    return () => window.clearInterval(id);
  }, [hovering, canCycle, images.length]);

  return (
    <div className="absolute inset-0" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {hero ? (
        <Image
          src={hero}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-[1.04] group-hover:opacity-90"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-xs text-cream/20">no image</span>
        </div>
      )}

      {armed &&
        images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            aria-hidden="true"
            fill
            sizes={sizes}
            loading="lazy"
            className={`object-cover transition-opacity duration-500 ${
              hovering && index === i ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
    </div>
  );
}
