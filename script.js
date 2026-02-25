// Slider Variables
let currentSlideIndex = 1;
let musicPlaying = true;

// Wedding Date Configuration
const WEDDING_DATE = new Date('March 22, 2026 16:00:00').getTime();

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    showSlide(currentSlideIndex);
    updateCountdown();
    initializeMusic();
    setInterval(updateCountdown, 1000);
});

// ============ SLIDER FUNCTIONS ============

function changeSlide(n) {
    showSlide(currentSlideIndex += n);
}

function currentSlide(n) {
    showSlide(currentSlideIndex = n);
}

function showSlide(n) {
    const slides = document.getElementsByClassName('slide');
    const dots = document.getElementsByClassName('dot');

    // Wrap around if beyond limits
    if (n > slides.length) {
        currentSlideIndex = 1;
    }
    if (n < 1) {
        currentSlideIndex = slides.length;
    }

    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove('active');
    }

    // Remove active class from all dots
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove('active');
    }

    // Show current slide and highlight current dot
    slides[currentSlideIndex - 1].classList.add('active');
    dots[currentSlideIndex - 1].classList.add('active');
}

// Auto-advance slides every 5 seconds
setInterval(function() {
    currentSlideIndex++;
    showSlide(currentSlideIndex);
}, 5000);

// ============ COUNTDOWN FUNCTIONS ============

function updateCountdown() {
    const now = new Date().getTime();
    const timeRemaining = WEDDING_DATE - now;

    // Calculate time units
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    // Display the countdown
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

    // If the countdown is over, display a message
    if (timeRemaining < 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        document.querySelector('.countdown-section h2').textContent = 'Thanks for Celebrating With Us!';
    }
}

// ============ MUSIC FUNCTIONS ============

function initializeMusic() {
    const audio = document.getElementById('weddingMusic');
    const musicBtn = document.getElementById('musicToggle');

    // Set volume to 50%
    audio.volume = 0.5;
    
    // Audio is autoplay muted - status shows muted initially
    musicPlaying = false;
    updateMusicButton();

    // Music toggle button handler - unmutes the audio
    musicBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMusic();
    });
    
    // Allow unmuting from anywhere on the page (tap to start gesture)
    document.addEventListener('click', function() {
        if (audio.paused || audio.muted) {
            // First interaction - unmute and ensure playing
            audio.muted = false;
            audio.play().catch(function(error) {
                console.log('Audio play error:', error);
            });
            musicPlaying = true;
            updateMusicButton();
        }
    }, { once: true }); // Only trigger once
}

function toggleMusic() {
    const audio = document.getElementById('weddingMusic');
    
    if (audio.muted) {
        // Unmute and ensure playing
        audio.muted = false;
        audio.play();
        musicPlaying = true;
    } else {
        // Mute
        audio.muted = true;
        musicPlaying = false;
    }
    
    updateMusicButton();
}

function updateMusicButton() {
    const audio = document.getElementById('weddingMusic');
    const musicBtn = document.getElementById('musicToggle');
    
    if (audio.muted || !musicPlaying) {
        musicBtn.classList.remove('playing');
        musicBtn.classList.add('muted');
        musicBtn.textContent = '🔇';
    } else {
        musicBtn.classList.add('playing');
        musicBtn.classList.remove('muted');
        musicBtn.textContent = '🔊';
    }
}

// ============ RSVP BUTTON HANDLER ============

document.addEventListener('DOMContentLoaded', function() {
    const rsvpBtn = document.querySelector('.rsvp-btn');
    if (rsvpBtn) {
        rsvpBtn.addEventListener('click', function() {
            alert('Thank you for your interest! Please contact us at: wedding@example.com or call +1 (555) 123-4567');
        });
    }
});

// ============ KEYBOARD NAVIGATION ============

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (event.key === 'ArrowRight') {
        changeSlide(1);
    }
});

