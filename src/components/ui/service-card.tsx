"use client";
import { useRef, useEffect, useState } from "react";

// HTMLArticleElement is available in DOM types, but we'll use HTMLElement as fallback
type ArticleElement = HTMLElement;

interface ServiceCardProps {
  service: {
    title: string;
    description: string;
    category: string;
    accentImage?: string;
  };
  index: number;
  isVisible: boolean;
  delayStyle: React.CSSProperties;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  index,
  isVisible,
  delayStyle,
}) => {
  const cardRef = useRef<ArticleElement>(null);
  const [isCompactStack, setIsCompactStack] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsCompactStack(window.innerWidth <= 600);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const baseTop = isCompactStack ? 90 : 140;
  const verticalStep = isCompactStack ? 18 : 30;
  const horizontalStep = isCompactStack ? 8 : 15;

  const stickyTop = baseTop + index * verticalStep;
  const leftOffset = index * horizontalStep;

  return (
    <article
      ref={cardRef}
      className={`service-card service-card--stack ${
        isVisible ? "service-card--visible" : ""
      }`}
      style={{
        position: "sticky",
        top: `${stickyTop}px`,
        marginLeft: `${leftOffset}px`,
        marginBottom: "100px",
        transformOrigin: "center top",
        backgroundImage: `url(/images/cover.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...delayStyle,
      }}
    >
      {service.accentImage && (
        <div
          className="service-card__accent"
          style={{
            backgroundImage: `url(${service.accentImage})`,
          }}
        />
      )}
      <div className="service-card__overlay"></div>
      <div className="service-card__content">
        <span className="service-card__tag">{service.category}</span>
        <h3>{service.title}</h3>
        <p>{service.description}</p>
      </div>
    </article>
  );
};
