"use client";
import type { ReactNode } from "react";
import useRevealOnIntersect from "@/hooks/useRevealOnIntersect";
import { getRevealStyle } from "@/utils/reveal";

type RevealSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  className?: string;
  background?: ReactNode;
  children: (isVisible: boolean) => ReactNode;
};

export function RevealSection({
  id,
  eyebrow,
  title,
  intro,
  className,
  background,
  children,
}: RevealSectionProps) {
  // Próg 0, bo wysoka sekcja (13 kart na telefonie) nie osiąga progu procentowego.
  const { ref, isVisible } = useRevealOnIntersect({
    threshold: 0,
    rootMargin: "0px 0px -10% 0px",
  });

  return (
    <section
      id={id}
      className={className}
      ref={ref}
      aria-labelledby={`${id}-title`}
    >
      {background}
      <div className="container">
        <div
          className="section-header"
          style={getRevealStyle(isVisible, { offset: 35, duration: "1s" })}
        >
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`}>{title}</h2>
          {intro && <p>{intro}</p>}
        </div>
        {children(isVisible)}
      </div>
    </section>
  );
}
