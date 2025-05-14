
  window.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menuToggle');
    const dropdown = document.getElementById('dropdownMenu');
  
    menuIcon.addEventListener('click', () => {
      menuIcon.classList.toggle('change');
      dropdown.classList.toggle('show');
    });
  });
  const btn = document.getElementById("muteBtn");
btn.addEventListener("click", () => {
  audio.muted = !audio.muted;
});


const canvas = document.getElementById('ballCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const balls = [];

    const ballImage = new Image();
    ballImage.src = 'Bubble.png';
    
    let imageLoaded = false;
    ballImage.onload = () => {
      imageLoaded = true;
    };

    class Ball {
      constructor(x, y, radius, color, vx, vy) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.id = Math.random();
      }

      draw() {
        if (imageLoaded) {
          ctx.drawImage(ballImage, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        } else {
          // fallback to circle if image not yet loaded
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
          ctx.closePath();
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce on edges
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
          this.vx *= -1;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
          this.vy *= -1;
        }

        this.draw();
      }

      isClicked(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        return dx * dx + dy * dy <= this.radius * this.radius;
      }
    }

    function randomColor() {
      return `hsl(${Math.random() * 360}, 100%, 50%)`;
    }

    function spawnBall() {
      
      const radius = 20 + Math.random() * 80;
      const x = Math.random() * (canvas.width - 2 * radius) + radius;
      const y = Math.random() * (canvas.height - 2 * radius) + radius;
      const vx = (Math.random() - 0.5) * 6;
      const vy = (Math.random() - 0.5) * 4;
      const color = randomColor();
      balls.push(new Ball(x, y, radius, color, vx, vy));
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      balls.forEach(ball => ball.update());
      requestAnimationFrame(animate);
    }

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      for (let i = balls.length - 1; i >= 0; i--) {
        if (balls[i].isClicked(mouseX, mouseY)) {
          balls.splice(i, 1);
          break;
        }
      }
    });

    setInterval(spawnBall, 1000);
    animate();

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });