// Wheat and Whisper Farm - Homepage JavaScript

// Configuration
const GITHUB_USER = 'David9930';
const GITHUB_REPO = 'WheatandWhisper';
const HOMEPAGE_FILE = 'content/pages/homepage.md';
const RAW_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${HOMEPAGE_FILE}`;

// Parse YAML frontmatter
function parseYAML(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);
    
    if (!match) return {};
    
    const yaml = match[1];
    const data = {};
    let currentObject = null;
    let currentKey = null;
    
    yaml.split('\n').forEach(line => {
        line = line.trim();
        if (!line) return;
        
        // Check for object property (indented)
        if (line.startsWith('  ')) {
            if (currentObject) {
                const [key, ...valueParts] = line.trim().split(':');
                const value = valueParts.join(':').trim();
                currentObject[key.trim()] = value;
            }
        }
        // Regular property
        else if (line.includes(':')) {
            const colonIndex = line.indexOf(':');
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            
            // Check if this starts an object
            if (!value || value === '') {
                currentKey = key;
                currentObject = {};
                data[key] = currentObject;
            } else {
                currentKey = null;
                currentObject = null;
                data[key] = value;
            }
        }
    });
    
    return data;
}

// Load and apply homepage content
async function loadHomepageContent() {
    try {
        const response = await fetch(RAW_URL);
        if (!response.ok) {
            console.warn('Could not load homepage content, using defaults');
            return;
        }
        
        const content = await response.text();
        const data = parseYAML(content);
        
        console.log('Homepage data loaded:', data);
        
        // Update hero section
        if (data.hero_title_1 && data.hero_title_2) {
            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle) {
                heroTitle.innerHTML = `${data.hero_title_1}<br>${data.hero_title_2}`;
            }
        }
        
        if (data.hero_subtitle) {
            const heroSubtitle = document.querySelector('.hero-subtitle');
            if (heroSubtitle) {
                heroSubtitle.textContent = data.hero_subtitle;
            }
        }
        
        if (data.hero_image) {
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                heroSection.style.backgroundImage = `url('${data.hero_image}')`;
            }
        }
        
        // Update grid sections
        const gridItems = document.querySelectorAll('.grid-item');
        for (let i = 1; i <= 6; i++) {
            const gridData = data[`grid_${i}`];
            if (gridData && gridItems[i-1]) {
                const item = gridItems[i-1];
                const titleEl = item.querySelector('.grid-item-title');
                
                // Update title
                if (gridData.title) {
                    if (titleEl) titleEl.textContent = gridData.title;
                } else if (gridData.title_1 && gridData.title_2) {
                    if (titleEl) titleEl.innerHTML = `${gridData.title_1}<br>${gridData.title_2}`;
                }
                
                // Update background image
                if (gridData.image) {
                    item.style.backgroundImage = `url('${gridData.image}')`;
                }
                
                // Update link
                if (gridData.link) {
                    item.href = gridData.link;
                }
            }
        }
        
        // Update poetic section
        if (data.poetic_title) {
            const poeticTitle = document.querySelector('.poetic-title');
            if (poeticTitle) {
                poeticTitle.textContent = data.poetic_title;
            }
        }
        
        const poeticText = document.querySelector('.poetic-text');
        if (poeticText && (data.poetic_1 || data.poetic_2 || data.poetic_3 || data.poetic_4)) {
            let html = '';
            if (data.poetic_1) html += `<p>${data.poetic_1}</p>`;
            if (data.poetic_2) html += `<p>${data.poetic_2}</p>`;
            if (data.poetic_3) html += `<p>${data.poetic_3}</p>`;
            if (data.poetic_4) html += `<p>${data.poetic_4}</p>`;
            poeticText.innerHTML = html;
        }
        
    } catch (error) {
        console.error('Error loading homepage content:', error);
        // Page will use default HTML content
    }
}

// Load content when page loads
document.addEventListener('DOMContentLoaded', loadHomepageContent);

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
