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
    let multiLineKey = null;
    let multiLineValue = [];
    let isMultiLine = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip empty lines unless we're in multi-line mode
        if (!line.trim() && !isMultiLine) continue;
        
        // Check if we're in multi-line mode
        if (isMultiLine) {
            // Check if this line is still indented (part of multi-line text)
            if (line.startsWith('    ') || line.trim() === '') {
                // Add to multi-line value (remove the 4-space indent)
                multiLineValue.push(line.substring(4));
            } else {
                // Multi-line section ended, save it
                if (currentObject && multiLineKey) {
                    currentObject[multiLineKey] = multiLineValue.join('\n');
                }
                isMultiLine = false;
                multiLineValue = [];
                multiLineKey = null;
                // Re-process this line as it's not part of multi-line
                i--;
                continue;
            }
            continue;
        }
        
        // Check if this is a nested object property
        if (line.startsWith('  ') && !line.startsWith('    ')) {
            // This is a property of the current object
            if (currentObject) {
                const propMatch = line.trim().match(/^(\w+):\s*(.*)$/);
                if (propMatch) {
                    const [, key, value] = propMatch;
                    
                    // Check if this is the start of multi-line text (ends with |)
                    if (value === '|') {
                        isMultiLine = true;
                        multiLineKey = key;
                        multiLineValue = [];
                    } else if (value) {
                        currentObject[key] = value;
                    }
                }
            }
        } else if (!line.startsWith(' ')) {
            // This is a top-level key
            const topMatch = line.match(/^(\w+):\s*(.*)$/);
            if (topMatch) {
                const [, key, value] = topMatch;
                
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
    
    // Handle case where multi-line is at the end of file
    if (isMultiLine && currentObject && multiLineKey) {
        currentObject[multiLineKey] = multiLineValue.join('\n');
    }
    
    return data;
}

// Update page content with CMS data
function updatePageContent(data) {
    console.log('🎨 Updating page content...');
    
    // ===== HERO SECTION =====
    const hero = data.hero_section || {};
    
    // Update hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && hero.title_line_1 && hero.title_line_2) {
        heroTitle.innerHTML = `${hero.title_line_1}<br>${hero.title_line_2}`;
        console.log('✅ Hero title updated');
    }
    
    // Update hero subtitle (preserve for typewriter)
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle && hero.subtitle_line_1) {
        heroSubtitle.setAttribute('data-content', hero.subtitle_line_1);
        console.log('✅ Hero subtitle ready for typewriter');
    }
    
    // Update hero tagline (preserve for typewriter)
    const heroTagline = document.querySelector('.hero-tagline');
    if (heroTagline && hero.subtitle_line_2) {
        heroTagline.setAttribute('data-content', hero.subtitle_line_2);
        console.log('✅ Hero tagline ready for typewriter');
    }
    
    // Update hero background
    if (hero.background_image) {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.backgroundImage = `url('${hero.background_image}')`;
            console.log('✅ Hero background updated');
        }
    }
    
    // Update main logo
    if (hero.main_logo) {
        const logo = document.querySelector('.farm-logo');
        if (logo) {
            logo.src = hero.main_logo;
            console.log('✅ Main logo updated');
        }
    }
    
    // ===== BOXES 1-6 =====
    for (let i = 1; i <= 6; i++) {
        const boxData = data[`box_${i}`];
        if (!boxData) continue;
        
        const gridItem = document.querySelector(`.grid-item:nth-child(${i})`);
        if (!gridItem) continue;
        
        // Update title
        const titleElement = gridItem.querySelector('.grid-item-title');
        if (titleElement) {
            if (boxData.title) {
                // Single-line title
                titleElement.textContent = boxData.title;
            } else if (boxData.title_line_1 && boxData.title_line_2) {
                // Two-line title
                titleElement.innerHTML = `${boxData.title_line_1}<br>${boxData.title_line_2}`;
            }
        }
        
        // Update background image
        if (boxData.image) {
            gridItem.style.backgroundImage = `url('${boxData.image}')`;
        }
        
        // Update link
        if (boxData.link) {
            gridItem.href = boxData.link;
        }
        
        console.log(`✅ Box ${i} updated`);
    }
    
    // ===== PAGE BANNER =====
    const banner = data.page_banner || {};
    
    // Update banner title
    const bannerTitle = document.querySelector('.poetic-title');
    if (bannerTitle && banner.title) {
        bannerTitle.textContent = banner.title;
        console.log('✅ Page banner title updated');
    }
    
    // Update banner text
    const bannerText = document.querySelector('.poetic-text');
    if (bannerText && banner.text) {
        // Split text by newlines and wrap each in <p> tags
        const lines = banner.text.split('\n').filter(line => line.trim());
        bannerText.innerHTML = lines.map(line => `<p>${line}</p>`).join('');
        console.log('✅ Page banner text updated');
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
