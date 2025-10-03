(function () {
  "use strict";

  const canvas = document.getElementById("fireworks");
  const ctx = canvas.getContext("2d");
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let width = 0, height = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  // Simple fireworks system
  const GRAVITY = 0.12;
  const FRICTION = 0.985;
  const rockets = [];
  const particles = [];
  const huePalette = [28, 44, 330, 200, 138, 12, 260];

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function hsla(h, s, l, a) { return `hsla(${h}, ${s}%, ${l}%, ${a})`; }

  function launch(x, y) {
    rockets.push({ x, y, vx: rand(-1, 1), vy: rand(-8.5, -10.5), color: rand(0, 360), life: rand(0.8, 1.2) });
  }

  function explode(x, y, hue) {
    const count = 110;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rand(-0.05, 0.05);
      const speed = rand(1.6, 4.6);
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(40, 70),
        decay: rand(0.96, 0.985),
        color: hue + rand(-16, 16),
        size: rand(1, 2.4)
      });
    }
  }

  function step() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(11,10,26,0.28)"; // trail fade
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    // Update rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.vy += GRAVITY * 0.25;
      r.x += r.vx;
      r.y += r.vy;
      r.life -= 0.016;
      ctx.fillStyle = hsla(r.color, 100, 70, 0.9);
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
      ctx.fill();
      if (r.vy >= -0.5 || r.life <= 0) {
        explode(r.x, r.y, r.color);
        rockets.splice(i, 1);
      }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vx *= FRICTION; p.vy *= FRICTION; p.vy += GRAVITY;
      p.x += p.vx; p.y += p.vy;
      p.life *= p.decay;
      if (p.life < 0.8) {
        particles.splice(i, 1);
        continue;
      }
      const alpha = Math.max(0, Math.min(1, p.life / 70));
      ctx.fillStyle = hsla(p.color, 100, 62, alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  // Interactions
  const diyas = document.querySelector(".diyas");
  const lightBtn = document.getElementById("lightDiyasBtn");
  const burstBtn = document.getElementById("burstBtn");

  function lightDiyas() {
    diyas.classList.add("active");
    // small celebratory bursts
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        explode(rand(width * 0.3, width * 0.7), rand(height * 0.2, height * 0.45), rand(0,360));
      }, i * 160);
    }
  }

  function randomBurst() {
    const x = rand(width * 0.1, width * 0.9);
    const y = rand(height * 0.1, height * 0.5);
    const hue = huePalette[Math.floor(rand(0, huePalette.length))];
    launch(x, height);
    setTimeout(() => explode(x, y, hue), 480 + rand(-140, 140));
  }

  // Initial ambience
  for (let i = 0; i < 3; i++) {
    setTimeout(randomBurst, i * 600);
  }

  lightBtn?.addEventListener("click", lightDiyas);
  burstBtn?.addEventListener("click", () => {
    for (let i = 0; i < 4; i++) setTimeout(randomBurst, i * 220);
  });

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    const hue = huePalette[Math.floor(rand(0, huePalette.length))];
    explode(x, y, hue);
  });
})();


