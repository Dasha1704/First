const area = document.getElementById("gameArea");
const plane = document.getElementById("plane");
const obstacles = document.getElementById("obstacles");
const scoreLabel = document.getElementById("score");
const intro = document.getElementById("intro");
const gameOver = document.getElementById("gameOver");

let running = false;
let score = 0;
let planeX = 100;
let planeY = 220;
let obstacleList = [];
let keys = {};
let lastTime = 0;
let spawnTimer = 0;
let animationId;

function startGame() {
  cancelAnimationFrame(animationId);
  running = true;
  score = 0;
  planeX = 100;
  planeY = area.clientHeight / 2;
  lastTime = 0;
  spawnTimer = 0;
  obstacleList = [];
  obstacles.replaceChildren();
  scoreLabel.textContent = "0";
  intro.classList.add("hidden");
  gameOver.classList.add("hidden");
  plane.style.display = "block";
  animationId = requestAnimationFrame(update);
}

function endGame() {
  running = false;
  gameOver.classList.remove("hidden");
  document.getElementById("finalScore").textContent = score;
  plane.style.display = "none";
  cancelAnimationFrame(animationId);
}

function spawnObstacle() {
  const el = document.createElement("div");
  el.className = "obstacle";
  el.textContent = Math.random() < 0.5 ? "☁️" : "🎈";

  const y = 30 + Math.random() * (area.clientHeight - 100);
  el.style.left = area.clientWidth + "px";
  el.style.top = y + "px";
  obstacles.appendChild(el);

  obstacleList.push({
    el,
    x: area.clientWidth,
    y,
    passed: false
  });
}

function update(time) {
  if (!running) return;

  const dt = Math.min((time - (lastTime || time)) / 16.67, 2);
  lastTime = time;

  const maxX = area.clientWidth - 65;
  const maxY = area.clientHeight - 55;

  if (keys.ArrowUp || keys.w) planeY -= 4 * dt;
  if (keys.ArrowDown || keys.s) planeY += 4 * dt;
  if (keys.ArrowLeft || keys.a) planeX -= 4 * dt;
  if (keys.ArrowRight || keys.d) planeX += 4 * dt;

  planeX = Math.max(10, Math.min(maxX, planeX));
  planeY = Math.max(10, Math.min(maxY, planeY));

  plane.style.left = planeX + "px";
  plane.style.top = planeY + "px";

  spawnTimer += dt;

  if (spawnTimer > 65) {
    spawnObstacle();
    spawnTimer = 0;
  }

  for (const ob of obstacleList) {
    ob.x -= 3 * dt;
    ob.el.style.left = ob.x + "px";

    const hit = planeX + 38 > ob.x + 8 &&
      planeX + 5 < ob.x + 45 &&
      planeY + 35 > ob.y + 8 &&
      planeY + 5 < ob.y + 48;

    if (hit) {
      endGame();
      return;
    }

    if (!ob.passed && ob.x < planeX) {
      ob.passed = true;
      score += 1;
      scoreLabel.textContent = score;
    }
  }

  obstacleList = obstacleList.filter(ob => {
    if (ob.x < -80) {
      ob.el.remove();
      return false;
    }
    return true;
  });

  animationId = requestAnimationFrame(update);
}

document.addEventListener("keydown", event => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
  }
  keys[event.key] = true;
  keys[event.key.toLowerCase()] = true;
});

document.addEventListener("keyup", event => {
  keys[event.key] = false;
  keys[event.key.toLowerCase()] = false;
});

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("restartBtn").addEventListener("click", startGame);
