let gridSize = 15;
let grid = [];
let words = {
  fase1: ["GATO", "CÃO", "PEIXE", "LEÃO", "URSO", "TIGRE", "CAVALO"],
  fase2: ["BRASILIA", "LISBOA", "MADRI", "PARIS", "ROMA", "LONDRES", "BERLIM", "MOSCOU"],
  fase3: ["ANA", "JOÃO", "MARIA", "CARLOS", "PEDRO", "FERNANDA", "PAULA", "RICARDO", "JULIA"]
};
let currentWords = [];
let foundWords = [];
let score = 0;
let fase = 1;

let selectedCells = [];
let cellSize = 40;

function setup() {
  createCanvas(600, 800);
  generateGrid();
  setupWords();
}

function draw() {
  background(255);
  drawGrid();
  drawWords();
  drawScore();
  highlightSelected();
}

function generateGrid() {
  grid = Array(gridSize)
    .fill()
    .map(() => Array(gridSize).fill(""));
}

function setupWords() {
  currentWords = words[`fase${fase}`];
  currentWords.forEach((word) => placeWord(word));
  fillGrid();
}

function placeWord(word) {
  let placed = false;
  while (!placed) {
    let dir = random(["horizontal", "vertical", "diagonal", "reverseHorizontal", "reverseVertical", "reverseDiagonal"]);
    let startX = floor(random(gridSize));
    let startY = floor(random(gridSize));
    if (canPlaceWord(word, startX, startY, dir)) {
      for (let i = 0; i < word.length; i++) {
        let x = startX + (dir.includes("horizontal") ? i : dir.includes("reverseHorizontal") ? -i : 0);
        let y = startY + (dir.includes("vertical") ? i : dir.includes("reverseVertical") ? -i : 0);
        if (dir.includes("diagonal")) {
          x = startX + i;
          y = startY + i;
        } else if (dir.includes("reverseDiagonal")) {
          x = startX - i;
          y = startY - i;
        }
        grid[y][x] = word[i];
      }
      placed = true;
    }
  }
}

function canPlaceWord(word, x, y, dir) {
  let dx = dir.includes("horizontal") ? 1 : dir.includes("reverseHorizontal") ? -1 : 0;
  let dy = dir.includes("vertical") ? 1 : dir.includes("reverseVertical") ? -1 : 0;

  if (dir.includes("diagonal")) {
    dx = 1;
    dy = 1;
  } else if (dir.includes("reverseDiagonal")) {
    dx = -1;
    dy = -1;
  }

  for (let i = 0; i < word.length; i++) {
    let nx = x + i * dx;
    let ny = y + i * dy;
    if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize || (grid[ny][nx] !== "" && grid[ny][nx] !== word[i])) {
      return false;
    }
  }
  return true;
}

function fillGrid() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid[y][x] === "") grid[y][x] = String.fromCharCode(65 + floor(random(26)));
    }
  }
}

function drawGrid() {
  textAlign(CENTER, CENTER);
  textSize(20);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (foundWords.some((word) => isPartOfWord(word, x, y))) {
        fill(144, 238, 144); // Verde para palavras encontradas
      } else if (selectedCells.some(([cx, cy]) => cx === x && cy === y)) {
        fill(173, 216, 230); // Azul para seleção
      } else {
        fill(255); // Branco padrão
      }
      stroke(0);
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
      fill(0);
      text(grid[y][x], x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
    }
  }
}

function drawWords() {
  textAlign(LEFT);
  textSize(16); // Tamanho menor para mais palavras
  fill(0);

  let offsetX = 20;
  let offsetY = 640; // Abaixo da grade
  let columnWidth = 150; // Ajusta a largura de cada coluna
  let rowSpacing = 20; // Espaçamento entre linhas

  text("Palavras:", offsetX, offsetY - rowSpacing);
  currentWords.forEach((word, index) => {
    let column = floor(index / 4); // Máximo de 4 palavras por coluna
    let row = index % 4; // Quantas linhas na coluna
    let x = offsetX + column * columnWidth;
    let y = offsetY + row * rowSpacing;
    if (foundWords.includes(word)) fill(100); // Cinza para palavras riscadas
    else fill(0);
    text(word, x, y);
  });
}

function drawScore() {
  textAlign(LEFT);
  textSize(20);
  fill(0);
  text(`Pontuação: ${score}`, 400, 780);
}

function highlightSelected() {
  if (selectedCells.length > 1) {
    noFill();
    stroke(0, 0, 255);
    strokeWeight(3);
    let [startX, startY] = selectedCells[0];
    let [endX, endY] = selectedCells[selectedCells.length - 1];
    rect(startX * cellSize, startY * cellSize, (endX - startX + 1) * cellSize, (endY - startY + 1) * cellSize);
  }
}

function mousePressed() {
  let x = floor(mouseX / cellSize);
  let y = floor(mouseY / cellSize);

  if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
    selectedCells = [[x, y]];
  }
}

function mouseDragged() {
  let x = floor(mouseX / cellSize);
  let y = floor(mouseY / cellSize);

  if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
    let last = selectedCells[selectedCells.length - 1];
    if (last[0] !== x || last[1] !== y) {
      selectedCells.push([x, y]);
    }
  }
}

function mouseReleased() {
  let selectedWord = getSelectedWord();
  if (currentWords.includes(selectedWord) && !foundWords.includes(selectedWord)) {
    foundWords.push(selectedWord);
    score += 10;
  }
  selectedCells = [];
  if (foundWords.length === currentWords.length) {
    if (fase < 3) {
      fase++;
      resetGame();
    } else {
      noLoop();
      textSize(32);
      textAlign(CENTER, CENTER);
      fill(0);
      text("Parabéns! Você venceu!", width / 2, height / 2);
    }
  }
}

function getSelectedWord() {
  if (selectedCells.length < 2) return "";

  let [startX, startY] = selectedCells[0];
  let [endX, endY] = selectedCells[selectedCells.length - 1];

  let dx = endX - startX !== 0 ? (endX - startX) / Math.abs(endX - startX) : 0;
  let dy = endY - startY !== 0 ? (endY - startY) / Math.abs(endY - startY) : 0;

  let word = "";
  let x = startX;
  let y = startY;

  while (x !== endX + dx || y !== endY + dy) {
    word += grid[y][x];
    x += dx;
    y += dy;
  }
  return word;
}

function resetGame() {
  generateGrid();
  setupWords();
  foundWords = [];
}

