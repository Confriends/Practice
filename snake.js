const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('currentScore');
const highScoreDisplay = document.getElementById('highScore');
const highScoreSound = document.getElementById('highScoreSound');

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let snake = [{ x: 150, y: 150 }];
let direction = { x: 0, y: -10 };
let bottleCap = { x: 200, y: 200 };
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let speed = 100;

highScoreDisplay.innerText = `High Score: ${highScore}`;

document.addEventListener('keydown', changeDirection);
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    const firstTouch = e.touches[0];
    touchStartX = firstTouch.clientX;
    touchStartY = firstTouch.clientY;
}

function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) {
        return;
    }

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
            direction = { x: 10, y: 0 }; // swipe right
        } else {
            direction = { x: -10, y: 0 }; // swipe left
        }
    } else {
        if (diffY > 0) {
            direction = { x: 0, y: 10 }; // swipe down
        } else {
            direction = { x: 0, y: -10 }; // swipe up
        }
    }

    touchStartX = 0;
    touchStartY = 0;
}

function changeDirection(event) {
    const keyPressed = event.keyCode;

    if (keyPressed === 38 && direction.y === 0) {
        direction = { x: 0, y: -10 }; // up arrow
    } else if (keyPressed === 40 && direction.y === 0) {
        direction = { x: 0, y: 10 }; // down arrow
    }
}

function gameLoop() {
    setTimeout(() => {
        clearCanvas();
        moveSnake();
        drawSnake();
        drawBottleCap();
        checkCollision();
        gameLoop();
    }, speed);
}

function clearCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    if (head.x === bottleCap.x && head.y === bottleCap.y) {
        score += 10;
        scoreDisplay.innerText = `Score: ${score}`;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreDisplay.innerText = `High Score: ${highScore}`;
            highScoreSound.play();
            // Add confetti animation here
        }
        bottleCap = getRandomBottleCap();
        if (score % 100 === 0) {
            speed *= 0.9; // increase speed slightly every 100 points
        }
    } else {
        snake.pop();
    }
}

function drawSnake() {
    ctx.fillStyle = 'limegreen';
    snake.forEach((part) => {
        ctx.fillRect(part.x, part.y, 10, 10);
    });
}

function drawBottleCap() {
    ctx.fillStyle = 'red';
    ctx.fillRect(bottleCap.x, bottleCap.y, 10, 10);
}

function getRandomBottleCap() {
    const x = Math.floor(Math.random() * canvas.width / 10) * 10;
    const y = Math.floor(Math.random() * canvas.height / 10) * 10;
    return { x, y };
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        resetGame();
    }
    for (let i = 4; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            resetGame();
        }
    }
}

function resetGame() {
    snake = [{ x: 150, y: 150 }];
    direction = { x: 0, y: -10 };
    score = 0;
    speed = 100;
    scoreDisplay.innerText = 'Score: 0';
    bottleCap = getRandomBottleCap();
}

gameLoop();
