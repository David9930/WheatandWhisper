// Wheat and Whisper Farm - Farmette Life Page
// Simple interactivity and form handling

// ===== NEWSLETTER FORM =====
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        
        if (email) {
            console.log('Newsletter signup:', email);
            alert('Thank you for subscribing! We promise to write only when we have something worth saying.');
            this.reset();
        }
    });
}

// ===== COMMENT FORM SUCCESS HANDLING =====
// Netlify Forms automatically handles submission, but we can add a success message
const commentForm = document.querySelector('.comment-form');
if (commentForm) {
    commentForm.addEventListener('submit', function(e) {
        // Let Netlify handle the actual submission
        // Just show a temporary success message
        console.log('Comment form submitted to Netlify for moderation');
    });
}

// Check for Netlify form success in URL
if (window.location.search.includes('success=true')) {
    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message show';
    successDiv.textContent = '✨ Thank you! Your comment has been submitted and will appear after Paige reviews it.';
    
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        commentForm.parentNode.insertBefore(successDiv, commentForm);
        
        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove success parameter from URL after showing message
        setTimeout(() => {
            const url = new URL(window.location);
            url.searchParams.delete('success');
            window.history.replaceState({}, '', url);
        }, 100);
    }
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
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

// ===== FADE-IN ANIMATION ON SCROLL =====
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

// Apply fade-in to content sections
document.querySelectorAll('.content-section, .comments-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
});

// ===== ANALYTICS TRACKING =====
function trackPageView() {
    const pageData = {
        page: 'farmette',
        timestamp: new Date().toISOString(),
        referrer: document.referrer
    };
    console.log('📊 Page view:', pageData);
}

window.addEventListener('load', trackPageView);

console.log('✨ Farmette Life page loaded!');
