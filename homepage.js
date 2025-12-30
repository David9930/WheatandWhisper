// Wheat and Whisper Farm - Homepage JavaScript with Typewriter Effect

// Typewriter Effect Configuration
const TYPEWRITER_SPEED = 50; // milliseconds per character (50 = elegant pace)
const INITIAL_DELAY = 800; // Wait before starting
const PAUSE_BETWEEN = 300; // Pause between subtitle and tagline

// Elegant Typewriter Effect
function typewriterEffect(element, text, speed = 50, onComplete) {
    let index = 0;
    element.textContent = ''; // Clear the text
    element.style.opacity = '1'; // Make visible
    
    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        } else {
            // Typing complete - trigger callback
            if (onComplete) {
                setTimeout(onComplete, 200); // Brief pause before glow
            }
        }
    }
    
    type();
}

// Initialize typewriter on page load
document.addEventListener('DOMContentLoaded', function() {
    // Start after initial delay for dramatic effect
    setTimeout(() => {
        // Type the subtitle first
        const subtitle = document.querySelector('.hero-subtitle');
        if (subtitle) {
            const subtitleText = subtitle.textContent;
            
            // Hide initially
            subtitle.style.opacity = '0';
            
            // Start typing with glow callback
            typewriterEffect(subtitle, subtitleText, TYPEWRITER_SPEED, () => {
                subtitle.classList.add('glow'); // Add glow effect
            });
            
            // Then type the tagline after subtitle completes
            const tagline = document.querySelector('.hero-tagline');
            if (tagline) {
                const taglineText = tagline.textContent;
                
                // Hide initially
                tagline.style.opacity = '0';
                
                // Calculate when subtitle finishes
                const subtitleDuration = subtitleText.length * TYPEWRITER_SPEED;
                
                // Start tagline after subtitle + pause
                setTimeout(() => {
                    typewriterEffect(tagline, taglineText, TYPEWRITER_SPEED, () => {
                        tagline.classList.add('glow'); // Add glow effect
                    });
                }, subtitleDuration + PAUSE_BETWEEN);
            }
        }
    }, INITIAL_DELAY);
});

// Newsletter Form Submission
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        const checkbox = this.querySelector('input[type="checkbox"]')?.checked;
        
        if (email) {
            // TODO: Connect to newsletter service (Mailerlite, etc.)
            console.log('Newsletter signup:', email);
            
            // Show success message
            alert('Thank you for subscribing! We promise to write only when we have something worth saying.');
            
            // Reset form
            this.reset();
        }
    });
}

// Search functionality (placeholder)
const searchIcon = document.querySelector('.search-icon');
if (searchIcon) {
    searchIcon.addEventListener('click', function() {
        alert('Search functionality coming soon!');
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Fade-in animation for grid items on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in to grid items
document.querySelectorAll('.grid-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(item);
});

// Basic analytics tracking (placeholder for your Google Sheets system)
function trackPageView() {
    const pageData = {
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        referrer: document.referrer
    };
    
    // TODO: Connect to your Google Apps Script endpoint
    console.log('Page view:', pageData);
}

// Track page view
window.addEventListener('load', trackPageView);
