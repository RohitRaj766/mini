class AnimeCarousel {
    constructor() {
        this.currentIndex = 0;
        this.isAutoPlaying = true;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 3000;
        
        // Sample anime data with local images
        this.animeData = [
            {
                title: "Mystical Journey",
                genre: "Fantasy, Adventure",
                rating: 4.8,
                image: "1_11291.webp",
                description: "An epic journey through mystical realms"
            },
            {
                title: "Digital Dreams",
                genre: "Sci-Fi, Romance",
                rating: 4.7,
                image: "1_3726.webp",
                description: "A story of love in a digital world"
            },
            {
                title: "Cosmic Warriors",
                genre: "Action, Space",
                rating: 4.9,
                image: "1_3729.webp",
                description: "Warriors fighting across the cosmos"
            },
            {
                title: "Dragon Ball Z",
                genre: "Action, Martial Arts",
                rating: 4.9,
                image: "1216091-3840x2160-desktop-4k-goku-background-photo.webp",
                description: "Epic battles and power-ups in the Dragon Ball universe"
            },
            {
                title: "Dreamy Butterfly",
                genre: "Fantasy, Romance",
                rating: 4.6,
                image: "anime-girl-with-butterfly-ears-dreamy-sky_23-2152013381.webp",
                description: "A magical tale of dreams and butterflies"
            },
            {
                title: "Epic Adventure",
                genre: "Adventure, Fantasy",
                rating: 4.8,
                image: "wp9341579.webp",
                description: "An unforgettable adventure awaits"
            }
        ];
        
        this.init();
    }
    
    init() {
        this.createCards();
        this.createDots();
        this.bindEvents();
        // this.startAutoPlay();
        this.updateCarousel();
    }
    
    createCards() {
        const track = document.getElementById('carouselTrack');
        track.innerHTML = '';
        
        this.animeData.forEach((anime, index) => {
            const card = document.createElement('div');
            card.className = 'anime-card';
            if (index === this.currentIndex) card.classList.add('active');
            
            card.innerHTML = `
                <div class="card-image" style="background-image: url('${anime.image}')">
                    <div class="card-overlay"></div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${anime.title}</h3>
                    <p class="card-genre">${anime.genre}</p>
                    <div class="card-rating">
                        <div class="stars">${'★'.repeat(Math.floor(anime.rating))}</div>
                        <span>${anime.rating}</span>
                    </div>
                    <button class="read-more" data-index="${index}">Read More</button>
                </div>
            `;
            
            // Add click event for card selection
            card.addEventListener('click', () => {
                this.goToSlide(index);
            });
            
            track.appendChild(card);
        });

        // Attach read more listeners
        document.querySelectorAll('.read-more').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                this.showDescription(idx);
            });
        });
    }
    
    createDots() {
        const dotsContainer = document.getElementById('dotsContainer');
        dotsContainer.innerHTML = '';
        
        this.animeData.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (index === this.currentIndex) dot.classList.add('active');
            
            dot.addEventListener('click', () => {
                this.goToSlide(index);
            });
            
            dotsContainer.appendChild(dot);
        });
    }
    
    bindEvents() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        prevBtn.addEventListener('click', () => {
            this.prevSlide();
        });
        
        nextBtn.addEventListener('click', () => {
            this.nextSlide();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });
        
        // Touch/swipe support
        let startX = 0;
        let startY = 0;
        const carouselContainer = document.querySelector('.carousel-container');
        
        carouselContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        carouselContainer.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Only trigger if horizontal swipe is greater than vertical
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 50) {
                    this.nextSlide();
                } else if (diffX < -50) {
                    this.prevSlide();
                }
            }
            
            startX = 0;
            startY = 0;
        });
        
        // Pause auto-play on hover
        // carouselContainer.addEventListener('mouseenter', () => {
        //     this.pauseAutoPlay();
        // });
        
        // carouselContainer.addEventListener('mouseleave', () => {
        //     if (this.isAutoPlaying) {
        //         this.startAutoPlay();
        //     }
        // });
    }
    
    updateCarousel() {
        const cards = document.querySelectorAll('.anime-card');
        const dots = document.querySelectorAll('.dot');
        
        // Position cards with overlapping and alternating tilts
        cards.forEach((card, index) => {
            const isActive = index === this.currentIndex;
            const isPrev = index === (this.currentIndex - 1 + this.animeData.length) % this.animeData.length;
            const isNext = index === (this.currentIndex + 1) % this.animeData.length;
            
            let transform = '';
            let zIndex = 1;
            let opacity = 0.3;
            
            if (isActive) {
                // Active card - center, no tilt, highest z-index
                transform = 'translateX(0) translateY(0)';
                zIndex = 10;
                opacity = 1;
            } else if (isPrev) {
                // Previous card - left side with left tilt
                transform = 'translateX(-120px) translateY(0) rotate(-15deg)';
                zIndex = 5;
                opacity = 0.7;
            } else if (isNext) {
                // Next card - right side with right tilt
                transform = 'translateX(120px) translateY(0) rotate(15deg)';
                zIndex = 5;
                opacity = 0.7;
            } else {
                // Other cards - hidden behind
                const distance = Math.min(
                    Math.abs(index - this.currentIndex),
                    Math.abs(index - this.currentIndex + this.animeData.length),
                    Math.abs(index - this.currentIndex - this.animeData.length)
                );
                
                if (distance === 2) {
                    // Second layer cards
                    if (index < this.currentIndex) {
                        transform = 'translateX(-200px) translateY(0) rotate(-25deg)';
                    } else {
                        transform = 'translateX(200px) translateY(0) rotate(25deg)';
                    }
                    zIndex = 2;
                    opacity = 0.2;
                } else {
                    // Hidden cards
                    transform = 'translateX(0) translateY(0) scale(0.8)';
                    zIndex = 1;
                    opacity = 0;
                }
            }
            
            card.style.transform = transform;
            card.style.zIndex = zIndex;
            card.style.opacity = opacity;
            card.classList.toggle('active', isActive);
        });
        
        // Update active dot
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }
    
    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.animeData.length;
        this.updateCarousel();
    }
    
    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.animeData.length) % this.animeData.length;
        this.updateCarousel();
    }
    
    showDescription(index) {
        const anime = this.animeData[index];
        alert(`${anime.title}\n\n${anime.description}`);
    }
    
    // startAutoPlay() {
    //     this.pauseAutoPlay();
    //     this.autoPlayInterval = setInterval(() => {
    //         this.nextSlide();
    //     }, this.autoPlayDelay);
    // }
    
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
}

// Initialize the carousel when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AnimeCarousel();
});

// Add some additional visual effects
document.addEventListener('DOMContentLoaded', () => {
    // Add parallax effect to background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('body');
        const speed = scrolled * 0.5;
        parallax.style.backgroundPosition = `center ${speed}px`;
    });
    
    // Add loading animation
    const carouselTrack = document.getElementById('carouselTrack');
    carouselTrack.style.opacity = '0';
    
    setTimeout(() => {
        carouselTrack.style.transition = 'opacity 0.6s ease';
        carouselTrack.style.opacity = '1';
    }, 100);
});
