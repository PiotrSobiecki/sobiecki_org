"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import useReducedMotion from "@/hooks/useReducedMotion";

type BackgroundVideoProps = {
  src: string;
  poster: string;
  className?: string;
  style?: CSSProperties;
};

export function BackgroundVideo({
  src,
  poster,
  className,
  style,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  // Plik pobiera się dopiero, gdy sekcja wchodzi w kadr, a poza kadrem
  // odtwarzanie stoi. Przy wyłączonym ruchu zostaje sam plakat.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reducedMotion) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }
        if (!video.src) video.src = src;
        void video.play().catch(() => {});
      },
      { threshold: 0.05 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src, reducedMotion]);

  return (
    <video
      ref={videoRef}
      className={className}
      style={style}
      poster={poster}
      preload="none"
      muted
      loop
      playsInline
      aria-hidden="true"
    />
  );
}
