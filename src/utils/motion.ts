export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const REDUCED_MOTION_CLASS = "reduce-motion";
export const REDUCED_MOTION_STORAGE_KEY = "sobiecki:reduce-motion";

// Ruch wyłącza ustawienie systemowe albo przełącznik w widgecie dostępności.
export const isMotionReduced = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia(REDUCED_MOTION_QUERY).matches ||
    document.documentElement.classList.contains(REDUCED_MOTION_CLASS)
  );
};

// Wywołuje callback przy zmianie ustawienia systemowego i klasy na <html>.
export const onMotionPreferenceChange = (handler: () => void): (() => void) => {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  const observer = new MutationObserver(handler);

  media.addEventListener("change", handler);
  observer.observe(document.documentElement, { attributeFilter: ["class"] });

  return () => {
    media.removeEventListener("change", handler);
    observer.disconnect();
  };
};
