"use client";
import { useEffect, useRef } from "react";

interface BinaryBackgroundProps {
  className?: string;
}

export const BinaryBackground: React.FC<BinaryBackgroundProps> = ({
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const fontSize = 18;
    const spacing = fontSize * 1.2; // Większe odstępy między znakami
    const columns = Math.ceil(
      canvas.width / (spacing * (window.devicePixelRatio || 1))
    );
    const rows = Math.ceil(
      canvas.height / (spacing * (window.devicePixelRatio || 1))
    );

    // Tablica 2D do przechowywania znaków
    const chars: string[][] = [];
    const changeRates: number[][] = [];
    const active: boolean[][] = []; // Które komórki są aktywne (losowe kształty)

    // Inicjalizacja tablicy znaków - tylko część komórek jest aktywna
    for (let i = 0; i < columns; i++) {
      chars[i] = [];
      changeRates[i] = [];
      active[i] = [];
      for (let j = 0; j < rows; j++) {
        // ~40% komórek jest aktywnych, tworząc losowe kształty
        active[i][j] = Math.random() < 0.4;
        if (active[i][j]) {
          chars[i][j] = Math.random() > 0.5 ? "1" : "0";
          changeRates[i][j] = Math.random() * 0.02 + 0.01; // Różne szybkości zmiany
        } else {
          chars[i][j] = "";
          changeRates[i][j] = 0;
        }
      }
    }

    let lastTime = 0;
    const draw = (currentTime: number) => {
      if (!canvas) return;

      const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
      const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

      // Czyszczenie z lekkim fade dla efektu "trail"
      ctx.fillStyle = "rgba(10, 10, 10, 0.1)";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Szare znaki, żeby nie zlewały się z napisami
      ctx.fillStyle = "rgba(100, 100, 100, 0.08)";
      ctx.font = `${fontSize}px "Courier New", monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Rysowanie tylko aktywnych znaków (losowe kształty)
      for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
          if (!active[i][j] || !chars[i][j]) continue;

          const x = i * spacing;
          const y = j * spacing;

          ctx.fillText(chars[i][j], x, y);

          // Zmiana znaków z różnymi szybkościami
          if (Math.random() < changeRates[i][j] * (deltaTime / 16)) {
            chars[i][j] = Math.random() > 0.5 ? "1" : "0";
          }
        }
      }

      // Gradienty góra-dół (fade out na górze i dole)
      const gradientHeight = canvasHeight * 0.15; // 15% wysokości na gradient
      const topGradient = ctx.createLinearGradient(0, 0, 0, gradientHeight);
      topGradient.addColorStop(0, "rgba(10, 10, 10, 1)");
      topGradient.addColorStop(1, "rgba(10, 10, 10, 0)");

      const bottomGradient = ctx.createLinearGradient(
        0,
        canvasHeight - gradientHeight,
        0,
        canvasHeight
      );
      bottomGradient.addColorStop(0, "rgba(10, 10, 10, 0)");
      bottomGradient.addColorStop(1, "rgba(10, 10, 10, 1)");

      ctx.fillStyle = topGradient;
      ctx.fillRect(0, 0, canvasWidth, gradientHeight);

      ctx.fillStyle = bottomGradient;
      ctx.fillRect(
        0,
        canvasHeight - gradientHeight,
        canvasWidth,
        gradientHeight
      );

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`binary-background ${className}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};
