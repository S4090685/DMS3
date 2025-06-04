const numBalls = 8;
const balls = [];
const container = document.getElementById('ball-background');

for (let i = 0; i < numBalls; i++) {
  const ball = document.createElement('div');
  ball.classList.add('bouncing-ball');
  container.appendChild(ball);

  const ballObj = {
    el: ball,
    x: Math.random() * (window.innerWidth - 60),
    y: Math.random() * (window.innerHeight - 60),
    dx: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 2),
    dy: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 2)
  };

  balls.push(ballObj);
}

function animateBalls() {
  balls.forEach(ball => {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x <= 0 || ball.x + 60 >= window.innerWidth) {
      ball.dx *= -1;
    }
    if (ball.y <= 0 || ball.y + 60 >= window.innerHeight) {
      ball.dy *= -1;
    }

    ball.el.style.left = ball.x + 'px';
    ball.el.style.top = ball.y + 'px';
  });

  requestAnimationFrame(animateBalls);
}

animateBalls();
