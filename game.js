const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 16;
const PLAYER_X = 20;
const AI_X = canvas.width - PADDLE_WIDTH - 20;
const PADDLE_SPEED = 8;
const BALL_SPEED = 6;

let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let ball = {
    x: canvas.width / 2 - BALL_SIZE / 2,
    y: canvas.height / 2 - BALL_SIZE / 2,
    vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    vy: BALL_SPEED * (Math.random() * 2 - 1)
};

function resetBall() {
    ball.x = canvas.width / 2 - BALL_SIZE / 2;
    ball.y = canvas.height / 2 - BALL_SIZE / 2;
    ball.vx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = BALL_SPEED * (Math.random() * 2 - 1);
}

// Mouse control for player paddle
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp paddle within canvas
    if (playerY < 0) playerY = 0;
    if (playerY + PADDLE_HEIGHT > canvas.height) playerY = canvas.height - PADDLE_HEIGHT;
});

// AI movement: simple tracking of ball with smoothing
function moveAI() {
    const aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (aiCenter < ball.y) {
        aiY += PADDLE_SPEED * 0.6;
    } else if (aiCenter > ball.y) {
        aiY -= PADDLE_SPEED * 0.6;
    }
    // Clamp AI paddle
    if (aiY < 0) aiY = 0;
    if (aiY + PADDLE_HEIGHT > canvas.height) aiY = canvas.height - PADDLE_HEIGHT;
}

// Collision detection
function checkCollision(paddleX, paddleY) {
    // Ball rectangle
    const ballLeft = ball.x;
    const ballRight = ball.x + BALL_SIZE;
    const ballTop = ball.y;
    const ballBottom = ball.y + BALL_SIZE;
    // Paddle rectangle
    const paddleLeft = paddleX;
    const paddleRight = paddleX + PADDLE_WIDTH;
    const paddleTop = paddleY;
    const paddleBottom = paddleY + PADDLE_HEIGHT;

    // Check for overlap
    return (
        ballRight > paddleLeft &&
        ballLeft < paddleRight &&
        ballBottom > paddleTop &&
        ballTop < paddleBottom
    );
}

// Game loop
function update() {
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Ball collision with top/bottom walls
    if (ball.y <= 0) {
        ball.y = 0;
        ball.vy *= -1;
    }
    if (ball.y + BALL_SIZE >= canvas.height) {
        ball.y = canvas.height - BALL_SIZE;
        ball.vy *= -1;
    }

    // Ball collision with player paddle
    if (checkCollision(PLAYER_X, playerY)) {
        ball.x = PLAYER_X + PADDLE_WIDTH;
        ball.vx *= -1;
        // Add some "spin" depending on where it hits the paddle
        let hitPos = (ball.y + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        ball.vy += hitPos * 0.2;
    }

    // Ball collision with AI paddle
    if (checkCollision(AI_X, aiY)) {
        ball.x = AI_X - BALL_SIZE;
        ball.vx *= -1;
        let hitPos = (ball.y + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
        ball.vy += hitPos * 0.2;
    }

    // Ball out of bounds: left or right (reset ball)
    if (ball.x < 0 || ball.x + BALL_SIZE > canvas.width) {
        resetBall();
    }

    moveAI();
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.setLineDash([12, 12]);
    ctx.strokeStyle = "#888";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = "#f00";
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
