// snake_game.js

let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

const snakeBlock = 10;
let snakeSpeed = 15;
let snake = [{ x: canvas.width / 2, y: canvas.height * 0.2 }];
let direction = { x: 0, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

document.addEventListener('keydown', changeDirection);
document.addEventListener('keydown', startGame);

function startGame(e) {
    if (e.key === 'Enter') {
        document.removeEventListener('keydown', startGame);
        main();
        placeFood();
    }
}

function main() {
    if (isGameOver()) {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            playSound();
            drawConfetti();
        }
        return;
    }

    setTimeout(function onTick() {
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        main();
    }, 1000 / snakeSpeed);
}

function clearCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawFood() {
    ctx.fillStyle = 'lime';
    ctx.fillRect(food.x, food.y, snakeBlock, snakeBlock);
}

function placeFood() {
    food.x = Math.floor(Math.random() * canvas.width / snakeBlock) * snakeBlock;
    food.y = Math.floor(Math.random() * canvas.height / snakeBlock) * snakeBlock;
}

function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        placeFood();
    } else {
        snake.pop();
    }
}

function drawSnake() {
    ctx.fillStyle = 'white';
    snake.forEach(part => {
        ctx.fillRect(part.x, part.y, snakeBlock, snakeBlock);
    });

    ctx.fillStyle = 'lime';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
    ctx.fillText('High Score: ' + highScore, canvas.width - 150, 20);
}

function changeDirection(event) {
    const keyPressed = event.key;
    const goingUp = direction.y === -snakeBlock;
    const goingDown = direction.y === snakeBlock;
    const goingRight = direction.x === snakeBlock;
    const goingLeft = direction.x === -snakeBlock;

    if (keyPressed === 'ArrowUp' && !goingDown) {
        direction = { x: 0, y: -snakeBlock };
    }
    if (keyPressed === 'ArrowDown' && !goingUp) {
        direction = { x: 0, y: snakeBlock };
    }
    if (keyPressed === 'ArrowLeft' && !goingRight) {
        direction = { x: -snakeBlock, y: 0 };
    }
    if (keyPressed === 'ArrowRight' && !goingLeft) {
        direction = { x: snakeBlock, y: 0 };
    }
}

function isGameOver() {
    for (let i = 4; i < snake.length; i++) {
        const hasCollided = snake[i].x === snake[0].x && snake[i].y === snake[0].y;
        if (hasCollided) return true;
    }

    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x >= canvas.width;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y >= canvas.height;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

function playSound() {
    const sound = new Audio('confetti.wav');
    sound.play();
}

function drawConfetti() {
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillStyle = ['red', 'white', 'lime'][Math.floor(Math.random() * 3)];
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2, false);
        ctx.fill();
    }
}
