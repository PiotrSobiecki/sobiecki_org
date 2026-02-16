import { CSSProperties } from "react";

type RevealStyleOptions = {
  delay?: number;
  offset?: number;
  duration?: string;
};

export const getRevealStyle = (
  isVisible: boolean,
  { delay = 0, offset = 40, duration = "0.9s" }: RevealStyleOptions = {}
): CSSProperties => ({
  opacity: isVisible ? 1 : 0,
  transform: `translateY(${isVisible ? 0 : offset}px)`,
  transition: `opacity ${duration} ease, transform ${duration} ease`,
  transitionDelay: isVisible ? `${delay}ms` : "0ms",
});
