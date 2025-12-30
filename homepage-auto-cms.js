// Wheat and Whisper Farm - Dynamic CMS Content Loader
// This file loads content from CMS and updates the page automatically!

// Typewriter Effect Configuration
const TYPEWRITER_SPEED = 50;
const INITIAL_DELAY = 800;
const PAUSE_BETWEEN = 300;

// ===== CONTENT LOADER =====

// Fetch and parse homepage content from CMS
async function loadHomepageContent() {
    try {
        console.log('🔄 Loading homepage content from CMS...');
        
        // Fetch the content file from GitHub Pages
        const response = await fetch('content/pages/homepage.md');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const content = await response.text();
        console.log('✅ Content file loaded successfully');
        
        // Parse the YAML frontmatter
        const data = parseYAMLFrontmatter(content);
        console.log('📊 Parsed content:', data);
        
        // Update the page with CMS content
        updatePageContent(data);
        
        return data;
        
    } catch (error) {
        console.error('❌ Error loading homepage content:', error);
        console.log('⚠️ Using default HTML content instead');
        return null;
    }
}

// Parse YAML frontmatter from markdown file
function parseYAMLFrontmatter(content) {
    // Extract content between --- markers
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    
    if (!match) {
        throw new Error('No YAML frontmatter found');
    }
    
    const yaml = match[1];
    const data = {};
    
    // Parse line by line
    const lines = yaml.split('\n');
    let currentKey = null;
    let currentObject = null;
    
    for (let line of lines) {
        // Skip empty lines
        if (!line.trim()) continue;
        
        // Check if this is a nested object
        if (line.startsWith('  ')) {
            // This is a property of the current object
            if (currentObject) {
                const match = line.trim().match(/^(\w+):\s*(.+)$/);
                if (match) {
                    const [, key, value] = match;
                    currentObject[key] = value;
                }
            }
        } else {
            // This is a top-level key
            const match = line.match(/^(\w+):\s*(.*)$/);
            if (match) {
                const [, key, value] = match;
                
                if (value) {
                    // Simple key-value pair
                    data[key] = value;
                    currentKey = key;
                    currentObject = null;
                } else {
                    // Start of an object
                    data[key] = {};
                    currentKey = key;
                    currentObject = data[key];
                }
            }
        }
    }
    
    return data;
}

// Update page content with CMS data
function updatePageContent(data) {
    console.log('🎨 Updating page content...');
    
    // Update hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && data.hero_title_1 && data.hero_title_2) {
        heroTitle.innerHTML = `${data.hero_title_1}<br>${data.hero_title_2}`;
        console.log('✅ Hero title updated');
    }
    
    // Update hero subtitle (preserve for typewriter)
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle && data.hero_subtitle) {
        // Store the content but don't update yet - typewriter will handle it
        heroSubtitle.setAttribute('data-content', data.hero_subtitle);
        console.log('✅ Hero subtitle ready for typewriter');
    }
    
    // Update hero tagline (preserve for typewriter)
    const heroTagline = document.querySelector('.hero-tagline');
    if (heroTagline && data.hero_tagline) {
        // Store the content but don't update yet - typewriter will handle it
        heroTagline.setAttribute('data-content', data.hero_tagline);
        console.log('✅ Hero tagline ready for typewriter');
    }
    
    // Update hero background
    if (data.hero_image) {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.backgroundImage = `url('${data.hero_image}')`;
            console.log('✅ Hero background updated');
        }
    }
    
    // Update grid sections
    for (let i = 1; i <= 6; i++) {
        const gridData = data[`grid_${i}`];
        if (!gridData) continue;
        
        const gridItem = document.querySelector(`.grid-item:nth-child(${i})`);
        if (!gridItem) continue;
        
        // Update title
        const titleElement = gridItem.querySelector('.grid-item-title');
        if (titleElement) {
            if (gridData.title) {
                // Single-line title
                titleElement.textContent = gridData.title;
            } else if (gridData.title_1 && gridData.title_2) {
                // Two-line title
                titleElement.innerHTML = `${gridData.title_1}<br>${gridData.title_2}`;
            }
        }
        
        // Update background image
        if (gridData.image) {
            gridItem.style.backgroundImage = `url('${gridData.image}')`;
        }
        
        // Update link
        if (gridData.link) {
            gridItem.href = gridData.link;
        }
        
        console.log(`✅ Grid section ${i} updated`);
    }
    
    // Update poetic section
    const poeticTitle = document.querySelector('.poetic-title');
    if (poeticTitle && data.poetic_title) {
        poeticTitle.textContent = data.poetic_title;
        console.log('✅ Poetic title updated');
    }
    
    const poeticText = document.querySelector('.poetic-text');
    if (poeticText) {
        const lines = [];
        for (let i = 1; i <= 4; i++) {
            if (data[`poetic_${i}`]) {
                lines.push(`<p>${data[`poetic_${i}`]}</p>`);
            }
        }
        poeticText.innerHTML = lines.join('');
        console.log('✅ Poetic text updated');
    }
    
    console.log('🎉 All content updated successfully!');
}

// ===== TYPEWRITER EFFECT =====

function typewriterEffect(element, text, speed = 50, onComplete) {
    let index = 0;
    element.textContent = '';
    element.style.opacity = '1';
    
    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        } else {
            if (onComplete) {
                setTimeout(onComplete, 200);
            }
        }
    }
    
    type();
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Wheat and Whisper Farm - Auto-CMS Initialized');
    
    // Load content from CMS first
    const cmsContent = await loadHomepageContent();
    
    // Start typewriter effect after content is loaded
    setTimeout(() => {
        const subtitle = document.querySelector('.hero-subtitle');
        if (subtitle) {
            // Get text from data attribute (set by updatePageContent) or fallback to HTML
            const subtitleText = subtitle.getAttribute('data-content') || subtitle.textContent;
            
            // Hide initially
            subtitle.style.opacity = '0';
            
            // Start typing with glow callback
            typewriterEffect(subtitle, subtitleText, TYPEWRITER_SPEED, () => {
                console.log('✅ Subtitle typing complete - adding glow class');
                subtitle.classList.add('glow');
                console.log('📊 Subtitle classes:', subtitle.className);
                console.log('🎨 Subtitle text-shadow:', window.getComputedStyle(subtitle).textShadow);
            });
            
            // Type the tagline
            const tagline = document.querySelector('.hero-tagline');
            if (tagline) {
                // Get text from data attribute (set by updatePageContent) or fallback to HTML
                const taglineText = tagline.getAttribute('data-content') || tagline.textContent;
                
                tagline.style.opacity = '0';
                
                const subtitleDuration = subtitleText.length * TYPEWRITER_SPEED;
                
                setTimeout(() => {
                    typewriterEffect(tagline, taglineText, TYPEWRITER_SPEED, () => {
                        console.log('✅ Tagline typing complete - adding glow class');
                        tagline.classList.add('glow');
                        console.log('📊 Tagline classes:', tagline.className);
                        console.log('🎨 Tagline text-shadow:', window.getComputedStyle(tagline).textShadow);
                    });
                }, subtitleDuration + PAUSE_BETWEEN);
            }
        }
    }, INITIAL_DELAY);
});

// ===== NEWSLETTER & INTERACTIVITY =====

// Newsletter Form Submission
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

// Search functionality
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

// Basic analytics tracking
function trackPageView() {
    const pageData = {
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        referrer: document.referrer
    };
    
    console.log('Page view:', pageData);
}

window.addEventListener('load', trackPageView);

console.log('✨ Homepage Auto-CMS Ready!');
