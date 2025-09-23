import { useEffect } from "react";

export function Minesweeper() {
  useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = `
      function openMinesweeper() {
        const gameWindow = document.createElement("div");
        gameWindow.classList.add("window");
      
        gameWindow.innerHTML = \`
          <div class="window-header">
            Minesweeper
            <button class="button" onclick="closeMinesweeperWindow(this.parentElement.parentElement)">X</button>
          </div>
          <div class="window-content" style="position: relative;">
            <canvas id="minesweeperCanvas" width="240" height="240"></canvas>
            <div id="gameStatus" style="
                text-align: center; 
                font-size: 20px; 
                color: red; 
                font-weight: bold;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 10px;
                background-color: white;
                border: 2px solid black;
                border-radius: 5px;
                display: none;">
            Game Over!
            </div>
            <div id="winStatus" style="
                text-align: center; 
                font-size: 20px; 
                color: green; 
                font-weight: bold;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 10px;
                background-color: white;
                border: 2px solid black;
                border-radius: 5px;
                display: none;">
            You Win!
            </div>
          </div>
        \`;
      
        document.body.appendChild(gameWindow);
        makeWindowDraggable(gameWindow);
        gameWindow.style.display = "block";
        startMinesweeper();
      }
      
      function closeMinesweeperWindow(window) {
        window.style.display = "none";
        window.remove();
      }
      
      function makeWindowDraggable(win) {
        let isDragging = false;
        let offsetX, offsetY;
      
        const header = win.querySelector(".window-header");
      
        header.addEventListener("mousedown", (e) => {
          isDragging = true;
          offsetX = e.clientX - win.getBoundingClientRect().left;
          offsetY = e.clientY - win.getBoundingClientRect().top;
          win.style.zIndex = 1000;
          e.preventDefault();
        });
      
        document.addEventListener("mousemove", (e) => {
          if (isDragging) {
            win.style.left = \`\${e.clientX - offsetX}px\`;
            win.style.top = \`\${e.clientY - offsetY}px\`;
          }
        });
      
        document.addEventListener("mouseup", () => {
          isDragging = false;
        });
      }
      
      function startMinesweeper() {
        const canvas = document.getElementById("minesweeperCanvas");
        const ctx = canvas.getContext("2d");
        const rows = 12;
        const cols = 12;
        const cellSize = 30;
        const mineCount = 25;
        const board = [];
        const mines = new Set();
        let gameOver = false;
      
        canvas.width = cols * cellSize;
        canvas.height = rows * cellSize;
      
        function drawBoard() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const cell = board[row][col];
              ctx.fillStyle = cell.revealed ? "#ddd" : "#999";
              ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
              ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
      
              if (cell.revealed && cell.mine) {
                ctx.fillStyle = "red";
                ctx.fillText("💣", col * cellSize + 10, row * cellSize + 20);
              } else if (cell.revealed && cell.adjacentMines > 0) {
                ctx.fillStyle = "black";
                ctx.fillText(
                  cell.adjacentMines,
                  col * cellSize + 10,
                  row * cellSize + 20
                );
              } else if (cell.flagged) {
                ctx.fillStyle = "blue";
                ctx.fillText("🚩", col * cellSize + 10, row * cellSize + 20);
              }
            }
          }
        }
      
        function placeMines() {
          while (mines.size < mineCount) {
            const minePosition = Math.floor(Math.random() * rows * cols);
            mines.add(minePosition);
          }
        }
      
        function initializeBoard() {
          for (let row = 0; row < rows; row++) {
            board[row] = [];
            for (let col = 0; col < cols; col++) {
              board[row][col] = {
                revealed: false,
                mine: mines.has(row * cols + col),
                adjacentMines: 0,
                flagged: false,
              };
            }
          }
        }
      
        function calculateAdjacentMines() {
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              if (board[row][col].mine) continue;
              let adjacent = 0;
              for (let r = -1; r <= 1; r++) {
                for (let c = -1; c <= 1; c++) {
                  const newRow = row + r;
                  const newCol = col + c;
                  if (
                    newRow >= 0 &&
                    newRow < rows &&
                    newCol >= 0 &&
                    newCol < cols &&
                    board[newRow][newCol].mine
                  ) {
                    adjacent++;
                  }
                }
              }
              board[row][col].adjacentMines = adjacent;
            }
          }
        }
      
        function revealCell(row, col) {
          if (
            row < 0 ||
            row >= rows ||
            col < 0 ||
            col >= cols ||
            board[row][col].revealed ||
            board[row][col].flagged ||
            gameOver
          )
            return;
      
          board[row][col].revealed = true;
      
          if (board[row][col].mine) {
            gameOver = true;
            document.getElementById("gameStatus").style.display = "block";
            drawBoard();
            return;
          }
      
          if (board[row][col].adjacentMines === 0 && !board[row][col].mine) {
            for (let r = -1; r <= 1; r++) {
              for (let c = -1; c <= 1; c++) {
                revealCell(row + r, col + c);
              }
            }
          }
      
          checkWinCondition();
          drawBoard();
        }
      
        function checkWinCondition() {
          let nonMineCellsRevealed = 0;
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              if (!board[row][col].mine && board[row][col].revealed) {
                nonMineCellsRevealed++;
              }
            }
          }
      
          if (nonMineCellsRevealed === rows * cols - mineCount) {
            gameOver = true;
            document.getElementById("winStatus").style.display = "block";
          }
        }
      
        function flagCell(row, col) {
          if (!board[row][col].revealed && !gameOver) {
            board[row][col].flagged = !board[row][col].flagged;
            drawBoard();
          }
        }
      
        canvas.addEventListener("click", (event) => {
          if (gameOver) return;
          const x = event.offsetX;
          const y = event.offsetY;
          const col = Math.floor(x / cellSize);
          const row = Math.floor(y / cellSize);
          revealCell(row, col);
        });
      
        canvas.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          if (gameOver) return;
          const x = event.offsetX;
          const y = event.offsetY;
          const col = Math.floor(x / cellSize);
          const row = Math.floor(y / cellSize);
          flagCell(row, col);
        });
      
        placeMines();
        initializeBoard();
        calculateAdjacentMines();
        drawBoard();
      }
    `;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
