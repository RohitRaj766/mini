const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const celebrateLayer = document.getElementById('celebrate');
const heroGif = document.getElementById('heroGif');
const petalsLayer = document.getElementById('petals');

function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function moveNoButtonAway(pointerX, pointerY) {
  const buttonsContainer = noBtn.parentElement;
  const containerRect = buttonsContainer.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const distanceX = btnRect.x + btnRect.width / 2 - pointerX;
  const distanceY = btnRect.y + btnRect.height / 2 - pointerY;
  const distance = Math.hypot(distanceX, distanceY);

  const evade = clamp(160 - distance, 40, 160);

  let angle = Math.atan2(distanceY, distanceX);
  if (!Number.isFinite(angle)) angle = Math.random() * Math.PI * 2;

  const offsetX = Math.cos(angle) * evade + getRandomInRange(-40, 40);
  const offsetY = Math.sin(angle) * evade + getRandomInRange(-24, 24);

  const newLeft = clamp(btnRect.left - containerRect.left + offsetX, 0, containerRect.width - btnRect.width);
  const newTop = clamp(btnRect.top - containerRect.top + offsetY, 0, containerRect.height - btnRect.height);

  noBtn.style.position = 'absolute';
  noBtn.style.left = `${newLeft}px`;
  noBtn.style.top = `${newTop}px`;
}

function onPointerMoveNearNo(e) {
  const pointerX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
  const pointerY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
  if (pointerX == null || pointerY == null) return;

  const rect = noBtn.getBoundingClientRect();
  const hoverRadius = 120;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dist = Math.hypot(centerX - pointerX, centerY - pointerY);

  if (dist < hoverRadius) {
    moveNoButtonAway(pointerX, pointerY);
  }
}

function createHeart(x, y) {
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  heart.style.background = `hsl(${getRandomInRange(330, 360)}, 90%, 65%)`;
  celebrateLayer.appendChild(heart);
  setTimeout(() => heart.remove(), 1700);
}

function celebrateAtButton(btn) {
  const rect = btn.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;
  for (let i = 0; i < 22; i++) {
    createHeart(originX + getRandomInRange(-6, 6), originY + getRandomInRange(-6, 6));
  }
}

function fireworksHearts(centerX, centerY) {
  const bursts = 3;
  const perBurst = 14;
  for (let b = 0; b < bursts; b++) {
    const delay = b * 150;
    setTimeout(() => {
      for (let i = 0; i < perBurst; i++) {
        const angle = (Math.PI * 2 * i) / perBurst;
        const distance = getRandomInRange(40, 100);
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        createHeart(x, y);
      }
    }, delay);
  }
}

function acceptLove() {
  yesBtn.disabled = true;
  yesBtn.textContent = 'Yay! I am excited to see you 💞';
  yesBtn.style.background = 'linear-gradient(135deg, #ff9db6, #ff3f7e)';
  celebrateAtButton(yesBtn);
  if (heroGif) {
    heroGif.src = 'p2.gif';
    heroGif.classList.add('love-bounce');
    setTimeout(() => heroGif.classList.remove('love-bounce'), 2200);
  }
  boostPetals();
  if (noBtn) {
    noBtn.style.opacity = '0';
    noBtn.style.pointerEvents = 'none';
    setTimeout(() => { if (noBtn) noBtn.style.display = 'none'; }, 250);
  }
  const card = document.querySelector('.card');
  if (card) card.classList.add('love');
  const rect = yesBtn.getBoundingClientRect();
  fireworksHearts(rect.left + rect.width / 2, rect.top + rect.height / 2);

  const titleEl = document.querySelector('.title');
  if (titleEl) {
    titleEl.textContent = 'I knew it, you love me! 💘';
    titleEl.classList.add('love-reveal');
    // small heart sparkle around title
    const r = titleEl.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    for (let i = 0; i < 14; i++) {
      createHeart(cx + getRandomInRange(-r.width/3, r.width/3), cy + getRandomInRange(-20, 20));
    }
  }
}

// Listeners
document.addEventListener('mousemove', onPointerMoveNearNo, { passive: true });
document.addEventListener('touchmove', onPointerMoveNearNo, { passive: true });

noBtn.addEventListener('pointerenter', onPointerMoveNearNo, { passive: true });
noBtn.addEventListener('pointerdown', onPointerMoveNearNo, { passive: true });

yesBtn.addEventListener('click', acceptLove);

// Ambient floating hearts
let ambientInterval = setInterval(() => {
  if (document.hidden) return;
  if (Math.random() < 0.7) {
    const x = getRandomInRange(window.innerWidth * 0.15, window.innerWidth * 0.85);
    const y = window.innerHeight - 20;
    createHeart(x, y);
  }
}, 1100);

// Falling petals
function spawnPetal(speedMultiplier = 1) {
  if (!petalsLayer) return;
  const petal = document.createElement('div');
  petal.className = 'petal';
  const startX = getRandomInRange(-20, window.innerWidth + 20);
  const duration = getRandomInRange(8, 14) / speedMultiplier;
  const drift = getRandomInRange(-120, 120);
  const delay = getRandomInRange(-2, 2);
  petal.style.left = `${startX}px`;
  petal.style.top = `-24px`;
  petal.style.setProperty('--drift', `${drift}px`);
  petal.style.animationDuration = `${duration}s`;
  petal.style.animationDelay = `${delay}s`;
  petalsLayer.appendChild(petal);
  setTimeout(() => petal.remove(), (duration + Math.max(0, delay)) * 1000 + 1000);
}

let petalsInterval = setInterval(() => {
  if (document.hidden) return;
  if (Math.random() < 0.9) spawnPetal();
}, 800);

function boostPetals() {
  // brief burst of faster petals
  const end = Date.now() + 2500;
  const burst = setInterval(() => {
    spawnPetal(2.2);
    if (Date.now() > end) clearInterval(burst);
  }, 120);
}


