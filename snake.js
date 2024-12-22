// snake.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreBoard = document.getElementById('scoreBoard');
const currentScoreEl = document.getElementById('currentScore');
const highScoreEl = document.getElementById('highScore');

let snake = [{x: 200, y: 200}];
let direction = {x: 0, y: 0};
let food = {x: 0, y: 0};
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

highScoreEl.innerText = highScore;

function drawSnake() {
    snake.forEach(segment => {
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(segment.x, segment.y, 20, 20);
    });
}

function moveSnake() {
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        currentScoreEl.innerText = score;
        placeFood();
    } else {
        snake.pop();
    }
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;

    if (keyPressed === LEFT && direction.x === 0) {
        direction = {x: -20, y: 0};
    } else if (keyPressed === UP && direction.y === 0) {
        direction = {x: 0, y: -20};
    } else if (keyPressed === RIGHT && direction.x === 0) {
        direction = {x: 20, y: 0};
    } else if (keyPressed === DOWN && direction.y === 0) {
        direction = {x: 0, y: 20};
    }
}

function placeFood() {
    food.x = Math.floor(Math.random() * 20) * 20;
    food.y = Math.floor(Math.random() * 20) * 20;
}

function drawFood() {
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(food.x, food.y, 20, 20);
}

function gameOver() {
    if (snake[0].x < 0 || snake[0].x >= canvas.width || snake[0].y < 0 || snake[0].y >= canvas.height) {
        return true;
    }

    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }

    return false;
}

function resetGame() {
    snake = [{x: 200, y: 200}];
    direction = {x: 0, y: 0};
    score = 0;
    currentScoreEl.innerText = score;
    placeFood();
}

function main() {
    if (gameOver()) {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreEl.innerText = highScore;
            confetti();
        }
        resetGame();
    }

    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSnake();
        moveSnake();
        drawFood();
        main();
    }, 100);
}

placeFood();
main();
document.addEventListener('keydown', changeDirection);
