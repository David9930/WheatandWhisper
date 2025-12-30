// Wheat and Whisper Farm - Homepage JavaScript

// Newsletter Form Submission
document.getElementById('newsletterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = this.querySelector('input[type="email"]').value;
    const checkbox = this.querySelector('input[type="checkbox"]').checked;
    
    if (email && checkbox) {
        // TODO: Connect to newsletter service (Mailerlite, etc.)
        console.log('Newsletter signup:', email);
        
        // Show success message
        alert('Thank you for subscribing to our newsletter!');
        
        // Reset form
        this.reset();
        
        // In production, you would send this to your newsletter service:
        // fetch('YOUR_NEWSLETTER_API_ENDPOINT', {
        //     method: 'POST',
        //     body: JSON.stringify({ email: email })
        // });
    }
});

// Search functionality (placeholder)
document.querySelector('.search-icon').addEventListener('click', function() {
    // TODO: Implement search
    alert('Search functionality coming soon!');
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll (optional)
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

// Observe grid items for fade-in effect
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
        referrer: document.referrer,
        userAgent: navigator.userAgent
    };
    
    // TODO: Send to your Google Apps Script endpoint
    // fetch('YOUR_GOOGLE_SCRIPT_URL', {
    //     method: 'POST',
    //     body: JSON.stringify(pageData)
    // });
    
    console.log('Page view tracked:', pageData);
}

// Track page view on load
window.addEventListener('load', trackPageView);
