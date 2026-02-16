import { MutableRefObject, useEffect, useRef, useState } from "react";

type UseRevealOnIntersectOptions = {
  threshold?: number;
  rootMargin?: string;
};

const useRevealOnIntersect = ({
  threshold = 0.25,
  rootMargin = "0px",
}: UseRevealOnIntersectOptions = {}): {
  ref: MutableRefObject<HTMLElement | null>;
  isVisible: boolean;
} => {
  const elementRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = elementRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref: elementRef, isVisible };
};

export default useRevealOnIntersect;
