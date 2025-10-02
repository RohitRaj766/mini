// Professional Login/Signup Page JavaScript

class AuthManager {
    constructor() {
        this.currentTab = 'login';
        this.isLoading = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.createParticles();
        this.animateOnLoad();
        this.loadSavedCredentials();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Form submissions
        document.getElementById('loginFormElement').addEventListener('submit', (e) => this.handleLogin(e));
        
        // Signup form
        document.getElementById('signupFormElement').addEventListener('submit', (e) => this.handleSignup(e));

        // Social login buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSocialLogin(e));
        });

        // Forgot password link
        const forgotPasswordLink = document.querySelector('.forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => this.showForgotPasswordModal(e));
        }

        // Modal close button
        const closeModalBtn = document.getElementById('closeModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.hideForgotPasswordModal());
        }

        // Forgot password form
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => this.handleForgotPasswordSubmit(e));
        }

        // Close modal when clicking overlay
        const modalOverlay = document.getElementById('forgotPasswordModal');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.hideForgotPasswordModal();
                }
            });
        }

        // Input animations
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('focus', (e) => this.animateInput(e.target));
            input.addEventListener('blur', (e) => this.resetInput(e.target));
            input.addEventListener('input', (e) => this.validateInput(e.target));
        });

        // Checkbox animations
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.animateCheckbox(e.target));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('forgotPasswordModal');
                if (modal && !modal.classList.contains('hidden')) {
                    this.hideForgotPasswordModal();
                }
            }
        });
    }

    switchTab(tab) {
        if (tab === this.currentTab || this.isLoading) return;

        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const tabBtns = document.querySelectorAll('.tab-btn');
        const formWrapper = document.querySelector('.form-wrapper');

        // Update tab buttons
        tabBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Adjust form wrapper height
        if (tab === 'login') {
            formWrapper.style.minHeight = '430px';
            signupForm.classList.add('hidden');
            setTimeout(() => {
                loginForm.classList.remove('hidden');
                loginForm.classList.add('slide-in');
                setTimeout(() => loginForm.classList.remove('slide-in'), 600);
            }, 300);
        } else {
            formWrapper.style.minHeight = '550px';
            loginForm.classList.add('hidden');
            setTimeout(() => {
                signupForm.classList.remove('hidden');
                signupForm.classList.add('slide-in');
                setTimeout(() => signupForm.classList.remove('slide-in'), 600);
            }, 300);
        }

        this.currentTab = tab;
    }

    animateFormIn(form) {
        form.style.opacity = '0';
        form.style.transform = 'translateX(50px)';
        
        requestAnimationFrame(() => {
            form.style.transition = 'all 0.5s ease';
            form.style.opacity = '1';
            form.style.transform = 'translateX(0)';
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        if (this.isLoading) return;

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validate inputs
        if (!email) {
            this.showNotification('Please enter your email address', 'error');
            document.getElementById('loginEmail').focus();
            return;
        }

        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            document.getElementById('loginEmail').focus();
            return;
        }

        if (!password) {
            this.showNotification('Please enter your password', 'error');
            document.getElementById('loginPassword').focus();
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            document.getElementById('loginPassword').focus();
            return;
        }

        this.setLoading(true);
        
        try {
            // Simulate API call with realistic delay
            await this.simulateApiCall(2000);
            
            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('userEmail', email);
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('userEmail');
            }
            
            this.showNotification('🚀 Launch successful! Welcome to SpacePortal!', 'success');
            
            // Redirect or update UI
            setTimeout(() => {
                this.redirectToDashboard();
            }, 2000);
            
        } catch (error) {
            this.showNotification('❌ Access denied. Invalid credentials.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        if (this.isLoading) return;

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validate inputs
        if (name.length < 2) {
            this.showNotification('Please enter your full name', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 8) {
            this.showNotification('Password must be at least 8 characters', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (!agreeTerms) {
            this.showNotification('Please agree to the terms and conditions', 'error');
            return;
        }

        this.setLoading(true);
        
        try {
            // Simulate API call
            await this.simulateApiCall();
            this.showNotification('Account created successfully! Welcome!', 'success');
            
            // Auto switch to login after successful signup
            setTimeout(() => {
                this.switchTab('login');
                // Pre-fill email
                document.getElementById('loginEmail').value = email;
                document.getElementById('loginEmail').focus();
            }, 2000);
            
        } catch (error) {
            this.showNotification('Account creation failed. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async handleSocialLogin(e) {
        const provider = e.currentTarget.classList.contains('google') ? 'google' : 'github';
        
        // Add button loading state
        const button = e.currentTarget;
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        button.disabled = true;
        
        this.setLoading(true);
        
        try {
            // Simulate social login process
            await this.simulateApiCall(2500);
            
            // Store provider preference
            localStorage.setItem('loginProvider', provider);
            localStorage.setItem('rememberMe', 'true');
            
            const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
            this.showNotification(`🌌 Connected to ${providerName}! Launching to space...`, 'success');
            
            setTimeout(() => {
                this.redirectToDashboard();
            }, 2000);
            
        } catch (error) {
            this.showNotification(`❌ ${provider.charAt(0).toUpperCase() + provider.slice(1)} connection failed. Please try again.`, 'error');
        } finally {
            this.setLoading(false);
            button.innerHTML = originalContent;
            button.disabled = false;
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateInput(input) {
        const value = input.value.trim();
        const inputWrapper = input.closest('.input-wrapper');
        
        // Remove existing validation classes
        inputWrapper.classList.remove('valid', 'invalid');
        
        if (value.length > 0) {
            if (input.type === 'email') {
                const isValid = this.validateEmail(value);
                inputWrapper.classList.add(isValid ? 'valid' : 'invalid');
                
                // Show real-time feedback
                if (!isValid && value.includes('@')) {
                    this.showInputHint(input, 'Please enter a valid email address');
                } else {
                    this.hideInputHint(input);
                }
            } else if (input.type === 'password') {
                const isValid = value.length >= 6;
                inputWrapper.classList.add(isValid ? 'valid' : 'invalid');
                
                if (!isValid && value.length > 0) {
                    this.showInputHint(input, `Password must be at least 6 characters (${value.length}/6)`);
                } else {
                    this.hideInputHint(input);
                }
            } else {
                inputWrapper.classList.add('valid');
            }
        } else {
            this.hideInputHint(input);
        }
    }

    showInputHint(input, message) {
        let hint = input.parentElement.querySelector('.input-hint');
        if (!hint) {
            hint = document.createElement('div');
            hint.className = 'input-hint';
            input.parentElement.appendChild(hint);
        }
        hint.textContent = message;
        hint.style.opacity = '1';
    }

    hideInputHint(input) {
        const hint = input.parentElement.querySelector('.input-hint');
        if (hint) {
            hint.style.opacity = '0';
        }
    }

    animateInput(input) {
        const inputWrapper = input.closest('.input-wrapper');
        inputWrapper.style.transform = 'translateY(-2px)';
        inputWrapper.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
        
        // Add floating label animation
        const label = input.nextElementSibling;
        if (label && label.classList.contains('form-label')) {
            label.style.color = 'var(--primary-color)';
        }
    }

    resetInput(input) {
        const inputWrapper = input.closest('.input-wrapper');
        inputWrapper.style.transform = 'translateY(0)';
        inputWrapper.style.boxShadow = 'none';
        
        const label = input.nextElementSibling;
        if (label && label.classList.contains('form-label') && !input.value) {
            label.style.color = 'var(--text-secondary)';
        }
    }

    animateCheckbox(checkbox) {
        const wrapper = checkbox.closest('.checkbox-wrapper');
        wrapper.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            wrapper.style.transform = 'scale(1)';
        }, 150);
    }

    setLoading(loading) {
        this.isLoading = loading;
        const authCard = document.getElementById('authCard');
        const submitBtns = document.querySelectorAll('.auth-btn');
        
        if (loading) {
            authCard.style.opacity = '0.7';
            authCard.style.pointerEvents = 'none';
            
            submitBtns.forEach(btn => {
                btn.classList.add('loading');
                btn.disabled = true;
            });
        } else {
            authCard.style.opacity = '1';
            authCard.style.pointerEvents = 'auto';
            
            submitBtns.forEach(btn => {
                btn.classList.remove('loading');
                btn.disabled = false;
            });
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const text = notification.querySelector('.notification-text');
        const icon = notification.querySelector('.notification-icon');
        
        // Update content
        text.textContent = message;
        
        // Update classes
        notification.className = `notification ${type}`;
        
        // Show notification
        notification.classList.add('show');
        
        // Auto hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    createParticles() {
        const particlesContainer = document.querySelector('.particles');
        
        // Add more dynamic particles
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: floatParticle ${Math.random() * 20 + 10}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            particlesContainer.appendChild(particle);
        }
        
        // Add particle animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatParticle {
                0% {
                    transform: translateY(100vh) translateX(0px) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    animateOnLoad() {
        // Staggered animation for form elements
        const inputs = document.querySelectorAll('.input-group');
        inputs.forEach((input, index) => {
            input.style.opacity = '0';
            input.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                input.style.transition = 'all 0.6s ease';
                input.style.opacity = '1';
                input.style.transform = 'translateY(0)';
            }, index * 100 + 500);
        });
        
        // Animate buttons
        setTimeout(() => {
            const buttons = document.querySelectorAll('.auth-btn, .social-btn');
            buttons.forEach((btn, index) => {
                btn.style.opacity = '0';
                btn.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    btn.style.transition = 'all 0.6s ease';
                    btn.style.opacity = '1';
                    btn.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 800);
    }

    handleKeyboard(e) {
        // Tab switching with keyboard
        if (e.altKey && (e.key === '1' || e.key === '2')) {
            e.preventDefault();
            this.switchTab(e.key === '1' ? 'login' : 'signup');
        }
        
        // Enter key on forms
        if (e.key === 'Enter' && !this.isLoading) {
            const activeElement = document.activeElement;
            if (activeElement.classList.contains('form-input')) {
                const form = activeElement.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
        }
    }

    async simulateApiCall(duration = 1500) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate occasional failures
                if (Math.random() > 0.9) {
                    reject(new Error('Simulated API error'));
                } else {
                    resolve({ success: true });
                }
            }, duration);
        });
    }

    showForgotPasswordModal(e) {
        e.preventDefault();
        const modal = document.getElementById('forgotPasswordModal');
        const loginEmail = document.getElementById('loginEmail').value.trim();
        
        // Pre-fill email if available
        if (loginEmail && this.validateEmail(loginEmail)) {
            document.getElementById('resetEmail').value = loginEmail;
        }
        
        modal.classList.remove('hidden');
        
        // Add entrance animation
        setTimeout(() => {
            document.getElementById('resetEmail').focus();
            this.addModalParticles();
        }, 400);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    hideForgotPasswordModal() {
        const modal = document.getElementById('forgotPasswordModal');
        modal.classList.add('hidden');
        document.getElementById('forgotPasswordForm').reset();
        
        // Restore body scroll
        document.body.style.overflow = 'auto';
        
        // Remove particles
        this.removeModalParticles();
    }

    addModalParticles() {
        const modalBody = document.querySelector('.modal-body');
        if (!modalBody) return;
        
        // Create floating particles
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'floating-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: ${Math.random() * 4 + 2}px;
                    height: ${Math.random() * 4 + 2}px;
                    background: ${Math.random() > 0.5 ? '#00d4ff' : '#7c3aed'};
                    border-radius: 50%;
                    top: 100%;
                    left: ${Math.random() * 100}%;
                    opacity: 0.7;
                    animation: floatUp 4s ease-out forwards;
                    pointer-events: none;
                    box-shadow: 0 0 10px currentColor;
                `;
                
                modalBody.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.remove();
                    }
                }, 4000);
            }, i * 200);
        }
        
        // Add particle animation
        if (!document.getElementById('modalParticleStyle')) {
            const style = document.createElement('style');
            style.id = 'modalParticleStyle';
            style.textContent = `
                @keyframes floatUp {
                    0% {
                        top: 100%;
                        opacity: 0;
                        transform: translateX(0px) scale(0);
                    }
                    10% {
                        opacity: 0.7;
                        transform: translateX(0px) scale(1);
                    }
                    90% {
                        opacity: 0.7;
                        transform: translateX(${Math.random() * 40 - 20}px) scale(1);
                    }
                    100% {
                        top: -10%;
                        opacity: 0;
                        transform: translateX(${Math.random() * 40 - 20}px) scale(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    removeModalParticles() {
        const particles = document.querySelectorAll('.floating-particle');
        particles.forEach(particle => particle.remove());
    }

    async handleForgotPasswordSubmit(e) {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value.trim();
        const submitBtn = e.target.querySelector('.auth-btn');
        
        if (!email) {
            this.showNotification('Please enter your email address', 'error');
            document.getElementById('resetEmail').focus();
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            document.getElementById('resetEmail').focus();
            return;
        }
        
        this.setLoading(true);
        
        // Add cool loading animation
        submitBtn.innerHTML = '<i class="fas fa-rocket fa-spin"></i> Launching Reset Link...';
        
        try {
            // Simulate password reset request with longer delay for effect
            await this.simulateApiCall(3000);
            
            // Success animation
            submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Successfully Launched!';
            submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            
            // Show success particles
            this.showSuccessParticles();
            
            // Enhanced success message
            this.showNotification('🚀 Reset link successfully launched to your email! Check your inbox! 🌌', 'success');
            
            setTimeout(() => {
                this.hideForgotPasswordModal();
            }, 2000);
            
        } catch (error) {
            submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Launch Failed';
            submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            this.showNotification('❌ Launch failed! Please try again.', 'error');
            
            setTimeout(() => {
                submitBtn.innerHTML = '<span class="btn-text">Send Reset Link</span><div class="btn-loader"><i class="fas fa-spinner fa-spin"></i></div>';
                submitBtn.style.background = 'linear-gradient(135deg, #00d4ff, #7c3aed, #fbbf24)';
            }, 2000);
        } finally {
            this.setLoading(false);
        }
    }

    showSuccessParticles() {
        const modalBody = document.querySelector('.modal-body');
        if (!modalBody) return;
        
        // Create success burst particles
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: #10b981;
                border-radius: 50%;
                top: 50%;
                left: 50%;
                pointer-events: none;
                animation: successBurst 1s ease-out forwards;
                box-shadow: 0 0 15px #10b981;
            `;
            
            modalBody.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 1000);
        }
        
        // Add success burst animation
        if (!document.getElementById('successBurstStyle')) {
            const style = document.createElement('style');
            style.id = 'successBurstStyle';
            style.textContent = `
                @keyframes successBurst {
                    0% {
                        transform: translate(-50%, -50%) scale(0) rotate(0deg);
                        opacity: 1;
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    loadSavedCredentials() {
        // Load saved email if remember me was checked
        const rememberMe = localStorage.getItem('rememberMe');
        const savedEmail = localStorage.getItem('userEmail');
        
        if (rememberMe === 'true' && savedEmail) {
            document.getElementById('loginEmail').value = savedEmail;
            document.getElementById('rememberMe').checked = true;
        }
    }

    redirectToDashboard() {
        // Add exit animation
        const authCard = document.getElementById('authCard');
        authCard.style.animation = 'cardSlideOut 0.8s ease-in forwards';
        
        setTimeout(() => {
            // In a real app, you would redirect to dashboard
            this.showNotification('🚀 Launching to SpacePortal Dashboard...', 'success');
            console.log('🚀 Redirecting to SpacePortal Dashboard...');
            
            // Simulate dashboard loading
            setTimeout(() => {
                // You can replace this with actual redirect
                window.location.href = 'dashboard.html'; // This would be your actual dashboard page
            }, 1000);
        }, 400);
    }
}

// Password toggle functionality
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.nextElementSibling.nextElementSibling;
    const icon = toggleBtn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Simple click test function
function testClicks() {
    console.log('🔍 Testing button clicks...');
    
    // Test login button
    const loginBtn = document.querySelector('.auth-btn');
    if (loginBtn) {
        console.log('✅ Login button found');
    }
    
    // Test social buttons
    document.querySelectorAll('.social-btn').forEach((btn, index) => {
        console.log(`✅ Social button ${index + 1} found`);
    });
    
    // Test tab buttons
    document.querySelectorAll('.tab-btn').forEach((btn, index) => {
        console.log(`✅ Tab button ${index + 1} found`);
    });
    
    console.log('✅ All buttons are ready for interaction!');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing...');
    
    try {
        new AuthManager();
        
        // Add some extra visual enhancements
        addRippleEffect();
        addHoverEffects();
        
        // Test clicks
        testClicks();
        
        console.log('✅ Auth Portal initialized successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing Auth Portal:', error);
        
        // Fallback: Add basic click handlers
        setTimeout(() => {
            testClicks();
        }, 1000);
    }
});

// Ripple effect for buttons
function addRippleEffect() {
    // Add ripple effect to existing buttons
    document.querySelectorAll('.auth-btn, .social-btn, .tab-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        @keyframes cardSlideOut {
            to {
                opacity: 0;
                transform: translateY(-50px) scale(0.95);
            }
        }
    `;
    document.head.appendChild(style);
}

// Helper function to add ripple effect to individual buttons
function addRippleToButton(button) {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
}

// Enhanced hover effects
function addHoverEffects() {
    // Add subtle hover effects to the auth card
    const authCard = document.getElementById('authCard');
    
    authCard.addEventListener('mouseenter', () => {
        authCard.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    authCard.addEventListener('mouseleave', () => {
        authCard.style.transform = 'translateY(0) scale(1)';
    });
    
    // Add input focus animations
    document.querySelectorAll('.input-wrapper').forEach(wrapper => {
        wrapper.addEventListener('mouseenter', () => {
            if (!wrapper.querySelector('.form-input:focus')) {
                wrapper.style.transform = 'translateY(-1px)';
            }
        });
        
        wrapper.addEventListener('mouseleave', () => {
            if (!wrapper.querySelector('.form-input:focus')) {
                wrapper.style.transform = 'translateY(0)';
            }
        });
    });
}