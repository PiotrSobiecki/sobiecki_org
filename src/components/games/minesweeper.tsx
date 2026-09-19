"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";

const ROWS = 12;
const COLS = 12;
const CELL_SIZE = 30;
const MINE_COUNT = 25;

type Cell = {
  revealed: boolean;
  mine: boolean;
  flagged: boolean;
  adjacentMines: number;
};

type Status = "playing" | "lost" | "won";

// Otwarcie zgłasza navbar; komponent nasłuchuje, zamiast wieszać się na window.
const openListeners = new Set<() => void>();

export const openMinesweeper = (): void => {
  openListeners.forEach((listener) => listener());
};

const neighbours = (row: number, col: number): [number, number][] => {
  const result: [number, number][] = [];
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      if (r === 0 && c === 0) continue;
      const nextRow = row + r;
      const nextCol = col + c;
      if (nextRow < 0 || nextRow >= ROWS || nextCol < 0 || nextCol >= COLS) continue;
      result.push([nextRow, nextCol]);
    }
  }
  return result;
};

const createBoard = (): Cell[][] => {
  const mines = new Set<number>();
  while (mines.size < MINE_COUNT) {
    mines.add(Math.floor(Math.random() * ROWS * COLS));
  }

  const board: Cell[][] = Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => ({
      revealed: false,
      mine: mines.has(row * COLS + col),
      flagged: false,
      adjacentMines: 0,
    }))
  );

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col].mine) continue;
      board[row][col].adjacentMines = neighbours(row, col).filter(
        ([r, c]) => board[r][c].mine
      ).length;
    }
  }

  return board;
};

const drawBoard = (ctx: CanvasRenderingContext2D, board: Cell[][]): void => {
  ctx.clearRect(0, 0, COLS * CELL_SIZE, ROWS * CELL_SIZE);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = board[row][col];
      const x = col * CELL_SIZE;
      const y = row * CELL_SIZE;

      ctx.fillStyle = cell.revealed ? "#ddd" : "#999";
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

      if (cell.revealed && cell.mine) {
        ctx.fillStyle = "red";
        ctx.fillText("💣", x + 10, y + 20);
      } else if (cell.revealed && cell.adjacentMines > 0) {
        ctx.fillStyle = "black";
        ctx.fillText(String(cell.adjacentMines), x + 10, y + 20);
      } else if (cell.flagged) {
        ctx.fillStyle = "blue";
        ctx.fillText("🚩", x + 10, y + 20);
      }
    }
  }
};

const revealCell = (board: Cell[][], row: number, col: number): void => {
  const cell = board[row][col];
  if (cell.revealed || cell.flagged) return;

  cell.revealed = true;
  if (cell.mine || cell.adjacentMines > 0) return;

  neighbours(row, col).forEach(([r, c]) => revealCell(board, r, c));
};

const hasWon = (board: Cell[][]): boolean =>
  board.flat().filter((cell) => cell.revealed && !cell.mine).length ===
  ROWS * COLS - MINE_COUNT;

const statusStyle: CSSProperties = {
  textAlign: "center",
  fontSize: "20px",
  fontWeight: "bold",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  padding: "10px",
  backgroundColor: "white",
  border: "2px solid black",
  borderRadius: "5px",
};

let topZIndex = 1000;

function GameWindow({ onClose }: { onClose: () => void }) {
  const windowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("playing");

  // Jeden AbortController na okno: zamknięcie odpina też listenery dokumentu.
  useEffect(() => {
    const element = windowRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!element || !canvas || !ctx) return;

    const controller = new AbortController();
    const { signal } = controller;
    const board = createBoard();
    let finished = false;

    drawBoard(ctx, board);

    const cellAt = (event: MouseEvent): [number, number] => [
      Math.floor(event.offsetY / CELL_SIZE),
      Math.floor(event.offsetX / CELL_SIZE),
    ];

    const inBounds = (row: number, col: number) =>
      row >= 0 && row < ROWS && col >= 0 && col < COLS;

    canvas.addEventListener(
      "click",
      (event) => {
        const [row, col] = cellAt(event);
        if (finished || !inBounds(row, col)) return;

        revealCell(board, row, col);
        if (board[row][col].mine) {
          finished = true;
          setStatus("lost");
        } else if (hasWon(board)) {
          finished = true;
          setStatus("won");
        }
        drawBoard(ctx, board);
      },
      { signal }
    );

    canvas.addEventListener(
      "contextmenu",
      (event) => {
        event.preventDefault();
        const [row, col] = cellAt(event);
        if (finished || !inBounds(row, col) || board[row][col].revealed) return;

        board[row][col].flagged = !board[row][col].flagged;
        drawBoard(ctx, board);
      },
      { signal }
    );

    const header = element.querySelector(".window-header");
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header?.addEventListener(
      "mousedown",
      (event) => {
        const pointer = event as MouseEvent;
        if ((pointer.target as HTMLElement).closest("button")) return;
        const box = element.getBoundingClientRect();
        dragging = true;
        offsetX = pointer.clientX - box.left;
        offsetY = pointer.clientY - box.top;
        element.style.zIndex = String(++topZIndex);
        pointer.preventDefault();
      },
      { signal }
    );

    document.addEventListener(
      "mousemove",
      (event) => {
        if (!dragging) return;
        element.style.left = `${event.clientX - offsetX}px`;
        element.style.top = `${event.clientY - offsetY}px`;
      },
      { signal }
    );

    document.addEventListener(
      "mouseup",
      () => {
        dragging = false;
      },
      { signal }
    );

    return () => controller.abort();
  }, []);

  return (
    <div className="window" ref={windowRef} style={{ display: "block" }}>
      <div className="window-header">
        Minesweeper
        <button className="button" aria-label="Zamknij Sapera" onClick={onClose}>
          X
        </button>
      </div>
      <div className="window-content" style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          data-minesweeper-canvas=""
          width={COLS * CELL_SIZE}
          height={ROWS * CELL_SIZE}
        />
        {status === "lost" && (
          <div data-game-status="" style={{ ...statusStyle, color: "red" }}>
            Game Over!
          </div>
        )}
        {status === "won" && (
          <div data-win-status="" style={{ ...statusStyle, color: "green" }}>
            You Win!
          </div>
        )}
      </div>
    </div>
  );
}

export function Minesweeper() {
  const [windowIds, setWindowIds] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);
  const nextId = useRef(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const open = () => setWindowIds((ids) => [...ids, nextId.current++]);
    openListeners.add(open);
    return () => {
      openListeners.delete(open);
      setWindowIds([]);
    };
  }, []);

  const close = useCallback((id: number) => {
    setWindowIds((ids) => ids.filter((openId) => openId !== id));
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      {windowIds.map((id) => (
        <GameWindow key={id} onClose={() => close(id)} />
      ))}
    </>,
    document.body
  );
}
