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
    examples?: string[];
    link?: { href: string; label: string };
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
      setIsCompactStack(window.innerWidth <= 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Na telefonie karta z listą przykładów bywa wyższa niż ekran pod nagłówkiem,
  // więc stos sticky zasłoniłby jej dół. Tam karty idą zwykłą kolumną.
  const stackStyle: React.CSSProperties = isCompactStack
    ? { position: "relative", marginBottom: "24px" }
    : {
        position: "sticky",
        top: `${140 + index * 20}px`,
        marginLeft: `${index * 10}px`,
        marginBottom: "100px",
      };

  return (
    <article
      ref={cardRef}
      className={`service-card service-card--stack ${
        isVisible ? "service-card--visible" : ""
      }`}
      style={{
        ...stackStyle,
        transformOrigin: "center top",
        backgroundImage: `url(/images/cover.jpg)`,
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
        {service.examples && (
          <ul className="service-card__examples">
            {service.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        )}
        {service.link && (
          <a href={service.link.href} className="btn btn_primary service-card__link">
            {service.link.label}
          </a>
        )}
      </div>
    </article>
  );
};
