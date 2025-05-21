const musicBtn = document.getElementById("musicBtn");
const musicIcon = document.getElementById("musicIcon");
const backgroundMusic = document.getElementById("background-music");

backgroundMusic.volume = 0.2;

musicBtn.addEventListener("click", function () {
  
  if (backgroundMusic.paused || backgroundMusic.ended) {
    backgroundMusic.currentTime = 0;
    audio.loop = true;
    audio.play();
    backgroundMusic.play();
    musicIcon.src = "https://img.icons8.com/?size=100&id=cpC9tCaQDyxh&format=png&color=000000";
  } else {
    backgroundMusic.pause();
    musicIcon.src = "https://img.icons8.com/?size=100&id=aanJRSdBR4ug&format=png&color=000000";
  }
});

window.addEventListener("DOMContentLoaded", () => {
  backgroundMusic.play().catch(err => {
    console.warn("Autoplay failed. User interaction needed.");
  });
});

const canvas = document.getElementById('ballCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
    
    document.body.addEventListener('click', async () => {
      await Tone.start();
    }, { once: true });

    const synth = new Tone.MonoSynth().toDestination();
    const NOTES = ["C6", "B5", "A5", "G5", "F5", "E5", "D5", "C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4", "B3", "A3", "G3", "F3", "E3", "D3", "C3"];

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    const MAX_BALLS = 40;
    const balls = [];
    let imagesLoaded = 0;

    const imagePairsData = [
      { normal: 'Bubble.png', popped: 'Bubble 1 pop.png' },
      { normal: 'Bubble 2.png', popped: 'Bubble 2 pop.png' },
      { normal: 'Bubble 3.png', popped: 'Bubble 3 pop.png' },
      { normal: 'Bubble 4.png', popped: 'Bubble 4 pop.png' },
      { normal: 'Bubble 5.png', popped: 'Bubble 5 pop.png' },
      { normal: 'Bubble 6.png', popped: 'Bubble 6 pop.png' }
    ];

    const imagePairs = [];

    imagePairsData.forEach(pair => {
      const normalImg = new Image();
      const poppedImg = new Image();

      normalImg.src = pair.normal;
      poppedImg.src = pair.popped;

      normalImg.onload = () => {
        imagesLoaded++;
        console.log(`Loaded: ${pair.normal}`);
      };
      poppedImg.onload = () => {
        imagesLoaded++;
        console.log(`Loaded: ${pair.popped}`);
      };

      normalImg.onerror = () => console.error(`Error loading ${pair.normal}`);
      poppedImg.onerror = () => console.error(`Error loading ${pair.popped}`);

      imagePairs.push({ normal: normalImg, popped: poppedImg });
    });

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

        const minRadius = 10;
        const maxRadius = 100;
        const clamped = Math.max(minRadius, Math.min(radius, maxRadius));
        const index = Math.floor(((clamped - minRadius) / (maxRadius - minRadius)) * (NOTES.length - 1));
        this.note = NOTES[index];
      }

      draw() {
        if (imagesLoaded >= imagePairs.length * 2) {
          const img = this.isPopped ? this.imagePair.popped : this.imagePair.normal;
          ctx.save();
          ctx.globalAlpha = this.opacity;
          ctx.drawImage(img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
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

          if (this.x + this.radius > canvas.width || this.x - this.radius < 0) this.vx *= -1;
          if (this.y + this.radius > canvas.height || this.y - this.radius < 0) this.vy *= -1;
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
        if (!this.isPopped) {
          this.isPopped = true;
          this.vx = 0;
          this.vy = 0;
          this.popTime = Date.now();
          synth.triggerAttackRelease(this.note, "8n");
        }
      }

      isFullyFaded() {
        return this.isPopped && this.opacity <= 0;
      }
    }

    function spawnBall() {
      if (balls.length >= MAX_BALLS) return;
      const radius = 10 + Math.random() * 90;
      const x = Math.random() * (canvas.width - 2 * radius) + radius;
      const y = Math.random() * (canvas.height - 2 * radius) + radius;
      const vx = (Math.random() - 0.5) * 6;
      const vy = (Math.random() - 0.5) * 6;
      const pair = imagePairs[Math.floor(Math.random() * imagePairs.length)];
      balls.push(new Ball(x, y, radius, vx, vy, pair));
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = balls.length - 1; i >= 0; i--) {
        balls[i].update();
        if (balls[i].isFullyFaded()) {
          balls.splice(i, 1);
        }
      }
      requestAnimationFrame(animate);
    }

    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      for (let i = balls.length - 1; i >= 0; i--) {
        if (balls[i].isClicked(mouseX, mouseY)) {
          balls[i].pop();
          break;
        }
      }
    });

    setInterval(spawnBall, 1000);
    animate();

    // dropdown menu
    window.addEventListener('DOMContentLoaded', () => {
      const menuIcon = document.getElementById('menuToggle');
      const dropdown = document.getElementById('dropdownMenu');
    
      menuIcon.addEventListener('click', () => {
        menuIcon.classList.toggle('change');
        dropdown.classList.toggle('show');
      });
    });
 
    document.addEventListener('DOMContentLoaded', () => {
      const clickText = document.getElementById('clickText');
      const popUpInfo = document.getElementById('popUpInformation');
      const closePopUp = document.getElementById('closePopUp');
    
      clickText.addEventListener('click', function(event) {
        event.preventDefault(); 
        popUpInfo.style.display = (popUpInfo.style.display === 'none' || popUpInfo.style.display === '') ? 'block' : 'none';
      });
    
      closePopUp.addEventListener('click', () => {
        popUpInfo.style.display = 'none';
      });
    });