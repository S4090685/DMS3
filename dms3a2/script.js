// Create a synth (simple sound)
const synth = new Tone.Synth().toDestination();

// Optional: unlock audio context on first interaction
document.body.addEventListener('click', async () => {
  await Tone.start();
}, { once: true });

const NOTES = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5"];

 
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

const MAX_BALLS = 40;
const balls = [];
let imagesLoaded = 0;

// Define specific image pairs
const imagePairsData = [
  { normal: 'Bubble.png', popped: 'Bubble 1 pop.png' },
  { normal: 'Bubble 2.png', popped: 'Bubble 2 pop.png' },
  { normal: 'Bubble 3.png', popped: 'Bubble 3 pop.png' },
  { normal: 'Bubble 4.png', popped: 'Bubble 4 pop.png' },
  { normal: 'Bubble 5.png', popped: 'Bubble 5 pop.png' },
  { normal: 'Bubble 6.png', popped: 'Bubble 6 pop.png' }
];

const imagePairs = [];

// Load each normal/popped image pair
imagePairsData.forEach(pair => {
  const normalImg = new Image();
  const poppedImg = new Image();

  normalImg.src = pair.normal;
  poppedImg.src = pair.popped;

  normalImg.onload = () => imagesLoaded++;
  poppedImg.onload = () => imagesLoaded++;

  imagePairs.push({ normal: normalImg, popped: poppedImg });
});

// Ball class
class Ball {
  constructor(x, y, radius, vx, vy, imagePair) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vx = vx;
    this.vy = vy;
    this.imagePair = imagePair;
    this.isPopped = false;
    this.opacity = 1;
    this.popTime = null;
    this.note = NOTES[Math.floor(Math.random() * NOTES.length)]; // assign random note
  }

  draw() {
    if (imagesLoaded >= imagePairs.length * 2) {
      const img = this.isPopped ? this.imagePair.popped : this.imagePair.normal;
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.drawImage(
        img,
        this.x - this.radius,
        this.y - this.radius,
        this.radius * 2,
        this.radius * 2
      );
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'gray';
      ctx.fill();
      ctx.closePath();
    }
  }

  update() {
    if (!this.isPopped) {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
        this.vx *= -1;
      }
      if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
        this.vy *= -1;
      }
    } else if (this.popTime !== null) {
      const elapsed = (Date.now() - this.popTime) / 1000;
      this.opacity = Math.max(1 - elapsed / 3, 0);
    }

    this.draw();
  }

  isClicked(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  pop() {
    this.isPopped = true;
    this.vx = 0;
    this.vy = 0;
    this.popTime = Date.now();
    synth.triggerAttackRelease(this.note, "8n");
  }
  

  isFullyFaded() {
    return this.isPopped && this.opacity <= 0;
  }
}


// Spawning new balls
function spawnBall() {
  if (balls.length >= MAX_BALLS) return;

  const radius = 20 + Math.random() * 80;
  const x = Math.random() * (canvas.width - 2 * radius) + radius;
  const y = Math.random() * (canvas.height - 2 * radius) + radius;
  const vx = (Math.random() - 0.5) * 6;
  const vy = (Math.random() - 0.5) * 4;

  const imagePair = imagePairs[Math.floor(Math.random() * imagePairs.length)];
  balls.push(new Ball(x, y, radius, vx, vy, imagePair));
}


// Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = balls.length - 1; i >= 0; i--) {
    balls[i].update();
    if (balls[i].isFullyFaded()) {
      balls.splice(i, 1); // Remove fully faded balls
    }
  }
  requestAnimationFrame(animate);
}

// Mouse click interaction
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  for (let i = balls.length - 1; i >= 0; i--) {
    if (!balls[i].isPopped && balls[i].isClicked(mouseX, mouseY)) {
      balls[i].pop();
      break;
    }
  }
});

// Resize handler
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Start spawning and animation
setInterval(spawnBall, 1000);
animate();