document.addEventListener("DOMContentLoaded", () => {
  const ROWS = 6;
  const COLS = 7;
  let board = [];
  let currentPlayer = 1; // 1 = Player, 2 = AI
  let gameActive = false;
  let aiLevel = "medium";
  let winningCells = []; // To store winning piece coordinates

  // Predefined GIF backgrounds – use relative paths (place your GIFs in your project folder)
  const backgroundGifs = [
    "back1.gif",
    "back2.gif",
    "back3.gif",
    "back4.gif",
    "back5.gif",
    "back6.gif"
  ];
  let currentBgIndex = 0;

  // Set initial background to the first GIF
  document.getElementById("background").style.backgroundImage = `url(${backgroundGifs[currentBgIndex]})`;

  const app = document.getElementById("app");

  // Start Screen Layout (Title Page)
  const startScreen = document.createElement("div");
  startScreen.id = "start-screen";
  startScreen.innerHTML = `
      <h1>Connect Four</h1>
      <button id="change-background">Change Background</button>
      <p style="color: white;">Select AI Difficulty:</p>
      <button class="difficulty easy" data-level="easy">Easy</button>
      <button class="difficulty medium" data-level="medium">Medium</button>
      <button class="difficulty hard" data-level="hard">Hard</button>
      <h2 id="rules-title">Rules</h2>
      <p id="rules-text">
        Connect Four is a two-player connection game in which players take turns dropping colored discs from the top into a seven-column, six-row grid. The pieces fall straight down, occupying the lowest available space within the column. The objective is to connect four discs of your own color vertically, horizontally, or diagonally before your opponent.
      </p>
  `;
  app.appendChild(startScreen);

  // Set a random color to the title on load
  function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }
  const title = startScreen.querySelector("h1");
  title.style.color = getRandomColor();

  // Change Background button event (only on title page)
  document.getElementById("change-background").addEventListener("click", () => {
    // Cycle through predefined background GIFs
    currentBgIndex = (currentBgIndex + 1) % backgroundGifs.length;
    document.getElementById("background").style.backgroundImage = `url(${backgroundGifs[currentBgIndex]})`;
  });

  // Game Layout (appears after selecting difficulty)
  const gameLayout = document.createElement("div");
  gameLayout.id = "game-layout";
  gameLayout.style.display = "none";
  gameLayout.innerHTML = `
      <div id="message" style="color: white;"></div>
      <div id="board"></div>
      <button id="restart">Restart Game</button>
      <button id="exit">Exit</button>
  `;
  app.appendChild(gameLayout);

  // Difficulty buttons event – vertical layout with fixed colors and shake animation
  document.querySelectorAll(".difficulty").forEach(button => {
      button.addEventListener("click", (event) => {
          aiLevel = event.target.dataset.level;
          
          // Determine shake animation class and duration based on difficulty
          let shakeClass = "";
          let shakeDuration = 500;
          if (aiLevel === "easy") {
              shakeClass = "shake-easy";
              shakeDuration = 500;
          } else if (aiLevel === "medium") {
              shakeClass = "shake-medium";
              shakeDuration = 700;
          } else if (aiLevel === "hard") {
              shakeClass = "shake-hard";
              shakeDuration = 900;
          }
          // Add shake animation to the app container
          app.classList.add(shakeClass);
          setTimeout(() => {
              app.classList.remove(shakeClass);
              // Switch to game layout after the shake animation
              startScreen.style.display = "none";
              gameLayout.style.display = "block";
              gameActive = true;
              currentPlayer = 1;
              winningCells = [];
              createBoard();
              // Clear any previous win message
              document.getElementById("message").innerText = "";
          }, shakeDuration);
      });
  });

  // Restart button resets the board
  gameLayout.querySelector("#restart").addEventListener("click", () => {
      gameActive = true;
      currentPlayer = 1;
      winningCells = [];
      createBoard();
      document.getElementById("message").innerText = "";
  });

  // Exit button returns to the title page
  gameLayout.querySelector("#exit").addEventListener("click", () => {
      gameLayout.style.display = "none";
      startScreen.style.display = "block";
  });

  function createBoard() {
      const boardElement = document.getElementById("board");
      boardElement.innerHTML = "";
      board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

      for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
              const cell = document.createElement("div");
              cell.classList.add("cell");
              cell.dataset.row = r;
              cell.dataset.col = c;
              cell.addEventListener("click", handleMove);
              boardElement.appendChild(cell);
          }
      }
  }

  function handleMove(event) {
      if (!gameActive || currentPlayer !== 1) return;
      const col = parseInt(event.target.dataset.col);
      let row = getAvailableRow(col);
      if (row === -1) return;
      dropPiece(row, col, 1);
  }

  function dropPiece(row, col, player) {
      let pos = 0;
      const interval = setInterval(() => {
          if (pos < row) {
              updateBoard();
              board[pos][col] = player;
              updateBoard();
              board[pos][col] = 0;
              pos++;
          } else {
              clearInterval(interval);
              board[row][col] = player;
              updateBoard();
              if (checkWin(player)) {
                  gameActive = false;
                  // Display win message on the page (white text)
                  const messageElem = document.getElementById("message");
                  messageElem.innerText = player === 1 ? "Conquered" : "GAME OVER";
                  return;
              }
              // Check for draw/stalemate
              if (isBoardFull()) {
                  gameActive = false;
                  document.getElementById("message").innerText = "Stalemate";
                  return;
              }
              if (player === 1) {
                  currentPlayer = 2;
                  setTimeout(makeAIMove, 500);
              } else {
                  currentPlayer = 1;
              }
          }
      }, 50);
  }

  function makeAIMove() {
      if (!gameActive) return;
      let col;
      if (aiLevel === "hard") {
          col = hardMove();
      } else if (aiLevel === "medium") {
          col = mediumMove();
      } else {
          col = easyMove();
      }
      let row = getAvailableRow(col);
      if (row !== -1) {
          dropPiece(row, col, 2);
      }
  }

  function getAvailableRow(col) {
      for (let r = ROWS - 1; r >= 0; r--) {
          if (board[r][col] === 0) return r;
      }
      return -1;
  }

  // Check if the board is full (draw condition)
  function isBoardFull() {
      for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
              if (board[r][c] === 0) {
                  return false;
              }
          }
      }
      return true;
  }

  // Update the board display and highlight winning pieces
  function updateBoard() {
      document.querySelectorAll(".cell").forEach(cell => {
          const r = parseInt(cell.dataset.row);
          const c = parseInt(cell.dataset.col);
          if (board[r][c] === 1) {
              cell.style.backgroundColor = "red";
          } else if (board[r][c] === 2) {
              cell.style.backgroundColor = "yellow";
          } else {
              cell.style.backgroundColor = "white";
          }
          // Highlight winning cells with an extra class
          if (winningCells.some(pos => pos.r === r && pos.c === c)) {
              cell.classList.add("win");
          } else {
              cell.classList.remove("win");
          }
      });
  }

  // Check for a win and record the winning cells if found
  function checkWin(player) {
      for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
              let winLine = checkDirection(r, c, 1, 0, player) ||
                            checkDirection(r, c, 0, 1, player) ||
                            checkDirection(r, c, 1, 1, player) ||
                            checkDirection(r, c, 1, -1, player);
              if (winLine) {
                  winningCells = winLine;
                  return true;
              }
          }
      }
      return false;
  }

  // Check one direction – returns array of winning cell positions if win, otherwise null
  function checkDirection(row, col, dr, dc, player) {
      let cells = [];
      for (let i = 0; i < 4; i++) {
          let r = row + i * dr;
          let c = col + i * dc;
          if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) {
              return null;
          }
          cells.push({ r, c });
      }
      return cells;
  }

  // Helper function to check win without side effects during simulation
  function checkWinNoSideEffects(player) {
      let saved = winningCells.slice();
      let result = checkWin(player);
      winningCells = saved;
      return result;
  }

  // AI Move Strategies
  function easyMove() {
      let availableCols = [];
      for (let c = 0; c < COLS; c++) {
          if (getAvailableRow(c) !== -1) {
              availableCols.push(c);
          }
      }
      return availableCols[Math.floor(Math.random() * availableCols.length)];
  }

  function mediumMove() {
      // Medium AI: try to block the opponent if possible, else choose a random move.
      let block = findWinningMove(1);
      if (block !== null) return block;
      return easyMove();
  }

  function hardMove() {
      // Hard AI: first try to win, then block the opponent, then random.
      let winMove = findWinningMove(2);
      if (winMove !== null) return winMove;
      let block = findWinningMove(1);
      if (block !== null) return block;
      return easyMove();
  }

  // Function to find a winning move for a given player
  function findWinningMove(player) {
      for (let c = 0; c < COLS; c++) {
          let row = getAvailableRow(c);
          if (row !== -1) {
              board[row][c] = player;
              if (checkWinNoSideEffects(player)) {
                  board[row][c] = 0;
                  return c;
              }
              board[row][c] = 0;
          }
      }
      return null;
  }
});
