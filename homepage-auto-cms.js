// Wheat and Whisper Farm - Dynamic CMS Content Loader
// This file loads content AND design settings from CMS

// Typewriter Effect Configuration
const TYPEWRITER_SPEED = 50;
const INITIAL_DELAY = 800;
const PAUSE_BETWEEN = 300;

// ===== SITE SETTINGS LOADER =====

async function loadSiteSettings() {
    try {
        console.log('🎨 Loading site settings from CMS...');
        
        const response = await fetch('content/settings/site-config.md');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const content = await response.text();
        const settings = parseYAMLFrontmatter(content);
        
        console.log('✅ Site settings loaded:', settings);
        
        // Apply settings to CSS
        applySiteSettings(settings);
        
        return settings;
        
    } catch (error) {
        console.error('❌ Error loading site settings:', error);
        console.log('⚠️ Using default hardcoded styles');
        return null;
    }
}

function applySiteSettings(settings) {
    if (!settings) return;
    
    console.log('🎨 Applying site settings to CSS...');
    
    // Create or get style element
    let styleEl = document.getElementById('cms-dynamic-styles');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'cms-dynamic-styles';
        document.head.appendChild(styleEl);
    }
    
    // Build CSS rules
    let css = '/* CMS Dynamic Styles */\n';
    
    // Hero Title
    if (settings.font_title) {
        css += `.hero-title { font-family: '${settings.font_title}', serif; }\n`;
    }
    if (settings.title_size) {
        css += `.hero-title { font-size: ${settings.title_size}; }\n`;
    }
    
    // Hero Subtitle (Line 1)
    if (settings.font_subtitle) {
        css += `.hero-subtitle { font-family: '${settings.font_subtitle}', serif; }\n`;
    }
    if (settings.subtitle_size) {
        css += `.hero-subtitle { font-size: ${settings.subtitle_size}; }\n`;
    }
    
    // Hero Tagline (Subtitle Line 2)
    if (settings.font_tagline) {
        css += `.hero-tagline { font-family: '${settings.font_tagline}', serif; }\n`;
    }
    if (settings.tagline_size) {
        css += `.hero-tagline { font-size: ${settings.tagline_size}; }\n`;
    }
    
    // Body Text
    if (settings.font_body) {
        css += `body { font-family: '${settings.font_body}', sans-serif; }\n`;
    }
    if (settings.body_size) {
        css += `body { font-size: ${settings.body_size}; }\n`;
    }
    
    // Colors
    if (settings.color_primary) {
        css += `:root { --light-brown: ${settings.color_primary}; }\n`;
    }
    if (settings.color_background) {
        css += `:root { --cream-bg: ${settings.color_background}; }\n`;
    }
    if (settings.color_text) {
        css += `:root { --warm-brown: ${settings.color_text}; }\n`;
    }
    
    // Apply the CSS
    styleEl.textContent = css;
    console.log('✅ Site settings applied to CSS');
    console.log('📊 Generated CSS:\n', css);
}

// ===== YOUTUBE VIDEO HELPER =====

function extractYouTubeVideoId(url) {
    if (!url) return null;
    
    let match = url.match(/[?&]v=([^&]+)/);
    if (match) return match[1];
    
    match = url.match(/youtu\.be\/([^?]+)/);
    if (match) return match[1];
    
    match = url.match(/\/shorts\/([^?]+)/);
    if (match) return match[1];
    
    match = url.match(/\/embed\/([^?]+)/);
    if (match) return match[1];
    
    return null;
}

// ===== CONTENT LOADER =====

async function loadHomepageContent() {
    try {
        console.log('🔄 Loading homepage content from CMS...');
        
        const response = await fetch('content/pages/homepage.md');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const content = await response.text();
        console.log('✅ Content file loaded successfully');
        
        const data = parseYAMLFrontmatter(content);
        console.log('📊 Parsed content:', data);
        
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
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    
    if (!match) {
        throw new Error('No YAML frontmatter found');
    }
    
    const yaml = match[1];
    const data = {};
    
    const lines = yaml.split('\n');
    let currentKey = null;
    let currentObject = null;
    let multiLineKey = null;
    let multiLineValue = [];
    let isMultiLine = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (!line.trim() && !isMultiLine) continue;
        
        if (isMultiLine) {
            if (line.startsWith('    ') || line.trim() === '') {
                multiLineValue.push(line.substring(4));
            } else {
                if (currentObject && multiLineKey) {
                    currentObject[multiLineKey] = multiLineValue.join('\n');
                }
                isMultiLine = false;
                multiLineValue = [];
                multiLineKey = null;
                i--;
                continue;
            }
            continue;
        }
        
        if (line.startsWith('  ') && !line.startsWith('    ')) {
            if (currentObject) {
                const propMatch = line.trim().match(/^(\w+):\s*(.*)$/);
                if (propMatch) {
                    const [, key, value] = propMatch;
                    
                    if (value === '|') {
                        isMultiLine = true;
                        multiLineKey = key;
                        multiLineValue = [];
                    } else if (value) {
                        // Remove quotes if present
                        currentObject[key] = value.replace(/^["']|["']$/g, '');
                    }
                }
            }
        } else if (!line.startsWith(' ')) {
            const topMatch = line.match(/^(\w+):\s*(.*)$/);
            if (topMatch) {
                const [, key, value] = topMatch;
                
                if (value) {
                    // Remove quotes if present
                    data[key] = value.replace(/^["']|["']$/g, '');
                    currentKey = key;
                    currentObject = null;
                } else {
                    data[key] = {};
                    currentKey = key;
                    currentObject = data[key];
                }
            }
        }
    }
    
    if (isMultiLine && currentObject && multiLineKey) {
        currentObject[multiLineKey] = multiLineValue.join('\n');
    }
    
    return data;
}

// Update page content with CMS data
function updatePageContent(data) {
    console.log('🎨 Updating page content...');
    
    const hero = data.hero_section || {};
    
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && hero.title_line_1 && hero.title_line_2) {
        heroTitle.innerHTML = `${hero.title_line_1}<br>${hero.title_line_2}`;
        if (hero.title_align) {
            heroTitle.style.textAlign = hero.title_align;
        }
        console.log('✅ Hero title updated');
    }
    
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle && hero.subtitle_line_1) {
        heroSubtitle.setAttribute('data-content', hero.subtitle_line_1);
        if (hero.subtitle_align) {
            heroSubtitle.style.textAlign = hero.subtitle_align;
        }
        console.log('✅ Hero subtitle ready for typewriter');
    }
    
    const heroTagline = document.querySelector('.hero-tagline');
    if (heroTagline && hero.subtitle_line_2) {
        heroTagline.setAttribute('data-content', hero.subtitle_line_2);
        if (hero.tagline_align) {
            heroTagline.style.textAlign = hero.tagline_align;
        }
        console.log('✅ Hero tagline ready for typewriter');
    }
    
    const heroSection = document.querySelector('.hero-section');
    const videoElement = document.getElementById('hero-video-background');
    
    const useVideo = hero.use_video_background !== false;
    const hasVideoUrl = hero.hero_video_url && hero.hero_video_url.trim();
    
    if (useVideo && hasVideoUrl) {
        const videoId = extractYouTubeVideoId(hero.hero_video_url);
        
        if (videoId) {
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;
            videoElement.src = embedUrl;
            videoElement.style.display = 'block';
            console.log('✅ Video background enabled:', videoId);
        } else {
            console.warn('⚠️ Invalid YouTube URL, falling back to image');
            setHeroBackgroundImage(heroSection, hero.background_image);
        }
    } else {
        setHeroBackgroundImage(heroSection, hero.background_image);
    }
    
    function setHeroBackgroundImage(section, imageUrl) {
        if (imageUrl) {
            section.style.backgroundImage = `url('${imageUrl}')`;
            console.log('✅ Hero background image set');
        }
    }
    
    if (hero.main_logo) {
        const logo = document.querySelector('.farm-logo');
        if (logo) {
            logo.src = hero.main_logo;
            console.log('✅ Main logo updated');
        }
    }
    
    for (let i = 1; i <= 6; i++) {
        const boxData = data[`box_${i}`];
        if (!boxData) continue;
        
        const gridItem = document.querySelector(`.grid-item:nth-child(${i})`);
        if (!gridItem) continue;
        
        const titleElement = gridItem.querySelector('.grid-item-title');
        if (titleElement) {
            if (boxData.title) {
                titleElement.textContent = boxData.title;
            } else if (boxData.title_line_1 && boxData.title_line_2) {
                titleElement.innerHTML = `${boxData.title_line_1}<br>${boxData.title_line_2}`;
            }
            
            if (boxData.title_align) {
                titleElement.style.textAlign = boxData.title_align;
            }
        }
        
        if (boxData.image) {
            gridItem.style.backgroundImage = `url('${boxData.image}')`;
            
            const posX = boxData.image_position_x || 'center';
            const posY = boxData.image_position_y || 'center';
            gridItem.style.backgroundPosition = `${posX} ${posY}`;
        }
        
        if (boxData.link) {
            gridItem.href = boxData.link;
        }
        
        console.log(`✅ Box ${i} updated`);
    }
    
    const banner = data.page_banner || {};
    
    const bannerTitle = document.querySelector('.poetic-title');
    if (bannerTitle && banner.title) {
        bannerTitle.textContent = banner.title;
        console.log('✅ Page banner title updated');
    }
    
    const bannerText = document.querySelector('.poetic-text');
    if (bannerText && banner.text) {
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
    
    // Load site settings FIRST (fonts, sizes, colors)
    await loadSiteSettings();
    
    // Then load content (text, images)
    const cmsContent = await loadHomepageContent();
    
    // Start typewriter effect after everything is loaded
    setTimeout(() => {
        const subtitle = document.querySelector('.hero-subtitle');
        if (subtitle) {
            const subtitleText = subtitle.getAttribute('data-content') || subtitle.textContent;
            subtitle.style.opacity = '0';
            
            typewriterEffect(subtitle, subtitleText, TYPEWRITER_SPEED, () => {
                console.log('✅ Subtitle typing complete - adding glow');
                subtitle.classList.add('glow');
            });
            
            const tagline = document.querySelector('.hero-tagline');
            if (tagline) {
                const taglineText = tagline.getAttribute('data-content') || tagline.textContent;
                tagline.style.opacity = '0';
                
                const subtitleDuration = subtitleText.length * TYPEWRITER_SPEED;
                
                setTimeout(() => {
                    typewriterEffect(tagline, taglineText, TYPEWRITER_SPEED, () => {
                        console.log('✅ Tagline typing complete - adding glow');
                        tagline.classList.add('glow');
                    });
                }, subtitleDuration + PAUSE_BETWEEN);
            }
        }
    }, INITIAL_DELAY);
});

// ===== NEWSLETTER & INTERACTIVITY =====

const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        if (email) {
            console.log('Newsletter signup:', email);
            alert('Thank you for subscribing!');
            this.reset();
        }
    });
}

const searchIcon = document.querySelector('.search-icon');
if (searchIcon) {
    searchIcon.addEventListener('click', function() {
        alert('Search functionality coming soon!');
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

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

document.querySelectorAll('.grid-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(item);
});

function trackPageView() {
    const pageData = {
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        referrer: document.referrer
    };
    console.log('Page view:', pageData);
}

window.addEventListener('load', trackPageView);

console.log('✨ Homepage Auto-CMS Ready with Dynamic Site Settings!');
