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
    // initialize comments (requires Firebase config in index.html)
    try { initComments(); } catch (e) { console.log('Comments not initialized:', e); }
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

// ============ COMMENTS (Firebase Realtime Database) ============

function initComments() {
    if (typeof firebase === 'undefined' || !firebase.database) {
        console.warn('Firebase not found - comments disabled. Paste your Firebase config in index.html');
        return;
    }

    const commentsRef = firebase.database().ref('comments');
    const form = document.getElementById('commentForm');
    const container = document.getElementById('commentsContainer');
    const renderedKeys = new Set();

    // show placeholder while loading
    if (container) container.innerHTML = '<div class="no-comments">Loading messages...</div>';

    // One-time load to render existing comments (sorted newest first)
    commentsRef.limitToLast(500).once('value', function(snapshot) {
        const items = [];
        snapshot.forEach(function(child) {
            items.push({ key: child.key, data: child.val() });
        });
        if (!items.length) {
            if (container) container.innerHTML = '<div class="no-comments">No messages yet. Be the first to send a wish!</div>';
        } else {
            // sort descending by timestamp
            items.sort(function(a,b){ return (a.data.timestamp||0) - (b.data.timestamp||0); });
            container.innerHTML = '';
            items.forEach(function(it){
                // render and mark key as rendered
                renderComment(it.data, it.key);
                renderedKeys.add(it.key);
            });
        }
    });

    // Listen for new comments live
    commentsRef.limitToLast(100).on('child_added', function(snapshot) {
        const key = snapshot.key;
        // skip if we've already rendered this key (loaded in the initial batch)
        if (renderedKeys.has(key)) return;
        renderedKeys.add(key);
        const data = snapshot.val();
        // remove placeholder if present
        const placeholder = document.querySelector('.no-comments');
        if (placeholder) placeholder.remove();
        renderComment(data, key);
    });

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            submitComment();
        });
    }
}

function submitComment() {
    const nameEl = document.getElementById('commentName');
    const textEl = document.getElementById('commentText');
    if (!nameEl || !textEl) return;
    const name = nameEl.value.trim();
    const message = textEl.value.trim();
    if (!name || !message) return;

    const commentsRef = firebase.database().ref('comments');
    const newRef = commentsRef.push();
    newRef.set({
        name: name,
        message: message,
        timestamp: Date.now()
    }).then(function() {
        nameEl.value = '';
        textEl.value = '';
    }).catch(function(err) {
        console.error('Failed to send comment', err);
    });
}

function renderComment(data, key) {
    const container = document.getElementById('commentsContainer');
    if (!container || !data) return;

    // Create avatar from initials
    const avatar = document.createElement('div');
    avatar.className = 'comment-avatar';
    const initial = (data.name || 'U').trim().split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
    avatar.textContent = escapeHtml(initial);

    const body = document.createElement('div');
    body.className = 'comment-body';

    const meta = document.createElement('div');
    meta.className = 'comment-meta';
    const nameEl = document.createElement('div');
    nameEl.className = 'name';
    nameEl.textContent = data.name || 'Anonymous';
    const timeEl = document.createElement('div');
    timeEl.className = 'time';
    timeEl.textContent = data.timestamp ? formatTimeAgo(data.timestamp) : '';
    meta.appendChild(nameEl);
    meta.appendChild(timeEl);

    const textEl = document.createElement('div');
    textEl.className = 'comment-text';
    textEl.textContent = data.message || '';

    body.appendChild(meta);
    body.appendChild(textEl);

    const card = document.createElement('div');
    card.className = 'comment';
    card.appendChild(avatar);
    card.appendChild(body);

    // insert newest at top
    container.insertBefore(card, container.firstChild);

    // Optionally, store the element's data-key attribute to help debugging
    if (key) card.setAttribute('data-key', key);
}

function formatTimeAgo(ts) {
    const now = Date.now();
    const diff = Math.max(0, now - ts);
    const seconds = Math.floor(diff/1000);
    const minutes = Math.floor(seconds/60);
    const hours = Math.floor(minutes/60);
    const days = Math.floor(hours/24);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return seconds + 's ago';
    if (minutes < 60) return minutes + 'm ago';
    if (hours < 24) return hours + 'h ago';
    if (days < 7) return days + 'd ago';
    return new Date(ts).toLocaleString();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"'`]/g, function (s) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;","`":"&#96;"})[s];
    });
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

