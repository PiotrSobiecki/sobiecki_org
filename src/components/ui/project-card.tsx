"use client";
import { CSSProperties, useMemo, useState, useCallback } from "react";

interface ProjectCardProps {
  name: string;
  description: string;
  url: string;
  style?: CSSProperties;
  className?: string;
}

export function ProjectCard({
  name,
  description,
  url,
  style,
  className = "",
}: ProjectCardProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  // Generujemy statyczną siatkę punktów tylko raz
  const gridSize = 30;
  const cardWidth = 400;
  const cardHeight = 360;

  const staticGrid = useMemo(() => {
    const points = [];
    for (let y = 0; y <= cardHeight; y += gridSize) {
      for (let x = 0; x <= cardWidth; x += gridSize) {
        points.push({ x, y });
      }
    }
    return points;
  }, []);

  // Obliczamy efekty tylko dla aktualnej pozycji myszy
  const gridPoints = useMemo(() => {
    if (!isHovered) return [];

    return staticGrid.map(({ x, y }) => {
      const dx = x - mousePos.x;
      const dy = y - mousePos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 120;
      const effect = Math.max(0, 1 - distance / maxDistance);

      const pushStrength = effect * 8;
      const offsetX = distance > 0 ? (dx / distance) * pushStrength : 0;
      const offsetY = distance > 0 ? (dy / distance) * pushStrength : 0;

      return {
        x: x + offsetX,
        y: y + offsetY,
        scale: 1 + effect * 2.5,
        color:
          effect > 0
            ? `rgba(147, 51, 234, ${effect})`
            : "rgba(255, 255, 255, 0.15)",
      };
    });
  }, [isHovered, mousePos.x, mousePos.y, staticGrid]);

  return (
    <article
      className={`project-card ${className}`.trim()}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <svg
          className="project-card__grid"
          viewBox="0 0 400 360"
          preserveAspectRatio="none"
        >
          {gridPoints.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={2 * point.scale}
              fill={point.color}
              style={{
                transition: "all 0.1s ease-out",
              }}
            />
          ))}
        </svg>
      )}
      <div className="project-card__content">
        <p className="project-card__label">Projekt</p>
        <h3>{name}</h3>
        <p className="project-card__description">{description}</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="btn btn_secondary"
        >
          Odwiedź stronę
        </a>
      </div>
    </article>
  );
}
