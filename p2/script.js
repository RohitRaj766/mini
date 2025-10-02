// Canvas Heart Animation
class HeartAnimation {
    constructor() {
        this.canvas = document.getElementById('heartCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.isPaused = false;
        this.time = 0;
        this.isDrawing = false;
        this.drawingProgress = 0;
        this.drawingSteps = 100; // Number of steps to draw the heart
        this.currentStep = 0;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.animate();
    }
    
    setupCanvas() {
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Set canvas style
        this.canvas.style.width = '800px';
        this.canvas.style.height = '600px';
    }
    
    setupEventListeners() {
        // Click to create heart particles
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.createHeartParticles(x, y);
        });
        
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startDrawing();
        });
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
        
        // Pause/Play button
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                this.createHeartParticles(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height
                );
            }
        });
    }
    
    createHeartParticles(x, y) {
        const colors = ['#ff6b6b', '#ff8e8e', '#ffa8a8', '#ffb3ba', '#ffc0cb'];
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            const size = 8 + Math.random() * 12;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: size,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1.0,
                decay: 0.02 + Math.random() * 0.01,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }
    }
    
    drawHeart(x, y, size, color, progress = 1.0) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(size / 20, size / 20);
        
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        // Heart shape using bezier curves with progress
        const steps = 4; // Number of bezier curves
        const stepProgress = progress * steps;
        
        this.ctx.moveTo(0, 5);
        
        if (stepProgress >= 1) {
            this.ctx.bezierCurveTo(-10, -5, -20, 5, -20, 15);
        }
        if (stepProgress >= 2) {
            this.ctx.bezierCurveTo(-20, 25, -10, 35, 0, 40);
        }
        if (stepProgress >= 3) {
            this.ctx.bezierCurveTo(10, 35, 20, 25, 20, 15);
        }
        if (stepProgress >= 4) {
            this.ctx.bezierCurveTo(20, 5, 10, -5, 0, 5);
        }
        
        // Draw stroke for drawing effect
        if (progress < 1.0) {
            this.ctx.stroke();
        } else {
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawBackground() {
        // Create gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) / 2
        );
        gradient.addColorStop(0, 'rgba(255, 107, 107, 0.1)');
        gradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply gravity
            particle.vy += 0.1;
            
            // Update rotation
            particle.rotation += particle.rotationSpeed;
            
            // Update life
            particle.life -= particle.decay;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Draw particle
            this.ctx.globalAlpha = particle.life;
            this.drawHeart(
                particle.x,
                particle.y,
                particle.size * particle.life,
                particle.color,
                particle.rotation
            );
        }
        this.ctx.globalAlpha = 1;
    }
    
    drawMainHeart() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const time = this.time * 0.01;
        
        // Pulsing effect (only when drawing is complete)
        const pulse = this.isDrawing ? 1 : 1 + Math.sin(time * 2) * 0.1;
        const size = 60 * pulse;
        
        // Color animation
        const hue = (time * 10) % 360;
        const color = `hsl(${hue}, 70%, 60%)`;
        
        // Calculate drawing progress
        const progress = this.isDrawing ? this.drawingProgress : 1.0;
        
        // Draw main heart
        this.drawHeart(centerX, centerY, size, color, progress);
        
        // Add glow effect only when drawing is complete
        if (!this.isDrawing && progress >= 1.0) {
            this.ctx.save();
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 20;
            this.ctx.globalAlpha = 0.5;
            this.drawHeart(centerX, centerY, size * 1.2, color, 1.0);
            this.ctx.restore();
        }
    }
    
    animate() {
        if (!this.isPaused) {
            this.time++;
            
            // Update drawing progress
            if (this.isDrawing) {
                this.currentStep++;
                this.drawingProgress = this.currentStep / this.drawingSteps;
                
                if (this.currentStep >= this.drawingSteps) {
                    this.isDrawing = false;
                    this.drawingProgress = 1.0;
                }
                
                // Update progress bar
                this.updateProgressBar();
            }
            
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw background
            this.drawBackground();
            
            // Draw main heart
            this.drawMainHeart();
            
            // Update and draw particles
            this.updateParticles();
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    startDrawing() {
        this.isDrawing = true;
        this.currentStep = 0;
        this.drawingProgress = 0;
        this.updateProgressBar();
        
        // Disable start button during drawing
        const startBtn = document.getElementById('startBtn');
        startBtn.disabled = true;
        startBtn.textContent = 'Drawing...';
        
        // Re-enable after drawing is complete
        setTimeout(() => {
            startBtn.disabled = false;
            startBtn.textContent = 'Start Drawing';
        }, this.drawingSteps * 16); // Approximate time for drawing
    }
    
    updateProgressBar() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const percentage = Math.round(this.drawingProgress * 100);
        
        progressFill.style.width = percentage + '%';
        progressText.textContent = percentage + '%';
    }
    
    reset() {
        this.particles = [];
        this.time = 0;
        this.isDrawing = false;
        this.currentStep = 0;
        this.drawingProgress = 0;
        this.updateProgressBar();
        
        // Re-enable start button
        const startBtn = document.getElementById('startBtn');
        startBtn.disabled = false;
        startBtn.textContent = 'Start Drawing';
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.isPaused ? 'Play' : 'Pause';
    }
}

// Initialize the animation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HeartAnimation();
});
