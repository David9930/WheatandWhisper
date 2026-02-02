// =============================================================================
// FILE: shop-auto-cms.js
// CREATED: 2025-02-01
// MODIFIED: 2025-02-02 18:30 EST
// PURPOSE: Loads shop page content from Netlify CMS (shop-settings.md)
// CHANGES: 
//   - Added support for YouTube Shorts URLs (youtube.com/shorts/VIDEO_ID)
//   - FIXED: Category boxes not loading (regex now includes numbers)
// =============================================================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch shop settings from CMS
        const response = await fetch('content/pages/shop-settings.md');
        const text = await response.text();
        const data = parseShopSettings(text);
        
        // Apply settings to page
        applyHeroSettings(data.hero_section);
        applyCategoryBoxes(data);
        applyBannerSettings(data.page_banner);
        
        console.log('✅ Shop page loaded from CMS successfully');
    } catch (error) {
        console.error('❌ Error loading shop settings:', error);
        console.log('Using default content from HTML');
    }
});

// Parse YAML-like front matter from markdown file
function parseShopSettings(text) {
    const data = {};
    
    // Extract content between --- markers
    const frontMatterMatch = text.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontMatterMatch) {
        console.warn('No front matter found in shop-settings.md');
        return data;
    }
    
    const frontMatter = frontMatterMatch[1];
    const lines = frontMatter.split('\n');
    
    let currentSection = null;
    let currentKey = null;
    let multilineValue = [];
    let inMultiline = false;
    
    lines.forEach(line => {
        // Skip empty lines
        if (line.trim() === '') {
            if (inMultiline) {
                multilineValue.push('');
            }
            return;
        }
        
        // Check for section headers (e.g., "hero_section:", "category_box_1:")
        if (line.match(/^[a-z_0-9]+:$/)) {
            // Save any pending multiline value
            if (inMultiline && currentSection && currentKey) {
                if (!data[currentSection]) data[currentSection] = {};
                data[currentSection][currentKey] = multilineValue.join('\n').trim();
                inMultiline = false;
                multilineValue = [];
            }
            
            currentSection = line.replace(':', '').trim();
            data[currentSection] = {};
            return;
        }
        
        // Check for key-value pairs with indentation
        const kvMatch = line.match(/^\s{2,}([a-z_]+):\s*(.*)$/);
        if (kvMatch && currentSection) {
            // Save any pending multiline value
            if (inMultiline && currentKey) {
                data[currentSection][currentKey] = multilineValue.join('\n').trim();
                inMultiline = false;
                multilineValue = [];
            }
            
            currentKey = kvMatch[1];
            let value = kvMatch[2].trim();
            
            // Remove quotes from value
            value = value.replace(/^["']|["']$/g, '');
            
            // Check if this starts a multiline value (|)
            if (value === '|') {
                inMultiline = true;
                multilineValue = [];
            } else {
                // Parse boolean values
                if (value === 'true') value = true;
                else if (value === 'false') value = false;
                
                data[currentSection][currentKey] = value;
            }
            return;
        }
        
        // If we're in multiline mode, collect the line
        if (inMultiline) {
            // Remove leading spaces (indentation)
            const cleanLine = line.replace(/^\s{4,}/, '');
            multilineValue.push(cleanLine);
        }
    });
    
    // Save any final multiline value
    if (inMultiline && currentSection && currentKey) {
        data[currentSection][currentKey] = multilineValue.join('\n').trim();
    }
    
    return data;
}

// Apply hero section settings
function applyHeroSettings(hero) {
    if (!hero) return;
    
    // Update hero title
    if (hero.title_line_1 && hero.title_line_2) {
        const titleEl = document.getElementById('shop-hero-title');
        if (titleEl) {
            titleEl.innerHTML = `${hero.title_line_1}<br>${hero.title_line_2}`;
        }
    }
    
    // Update subtitle
    if (hero.subtitle) {
        const subtitleEl = document.getElementById('shop-hero-subtitle');
        if (subtitleEl) {
            subtitleEl.textContent = hero.subtitle;
        }
    }
    
    // Update tagline
    if (hero.tagline) {
        const taglineEl = document.getElementById('shop-hero-tagline');
        if (taglineEl) {
            taglineEl.textContent = hero.tagline;
        }
    }
    
    // Update logo
    if (hero.main_logo) {
        const logoEl = document.getElementById('shop-hero-logo');
        if (logoEl) {
            logoEl.src = hero.main_logo;
        }
    }
    
    // Handle video background
    if (hero.use_video_background === true && hero.hero_video_url) {
        setupVideoBackground(hero.hero_video_url);
    } else if (hero.background_image) {
        // Use background image instead
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.backgroundImage = `url('${hero.background_image}')`;
            heroSection.style.backgroundSize = 'cover';
            heroSection.style.backgroundPosition = 'center';
        }
    }
}

// Setup YouTube video background
function setupVideoBackground(videoUrl) {
    const videoElement = document.getElementById('hero-video-background');
    if (!videoElement) return;
    
    // Extract YouTube video ID
    let videoId = '';
    
    if (videoUrl.includes('youtube.com/watch')) {
        // Standard YouTube URL: youtube.com/watch?v=VIDEO_ID
        const urlParams = new URLSearchParams(new URL(videoUrl).search);
        videoId = urlParams.get('v');
    } else if (videoUrl.includes('youtu.be/')) {
        // Short YouTube URL: youtu.be/VIDEO_ID
        videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
    } else if (videoUrl.includes('youtube.com/shorts/')) {
        // YouTube Shorts URL: youtube.com/shorts/VIDEO_ID
        videoId = videoUrl.split('youtube.com/shorts/')[1].split('?')[0];
    } else if (videoUrl.includes('/shorts/')) {
        // Alternative Shorts URL: /shorts/VIDEO_ID
        videoId = videoUrl.split('/shorts/')[1].split('?')[0];
    }
    
    if (videoId) {
        // Set up YouTube embed URL with autoplay, mute, and loop
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;
        videoElement.src = embedUrl;
        videoElement.style.display = 'block';
        
        console.log('✅ Video background loaded:', videoId);
    } else {
        console.warn('⚠️ Could not extract video ID from URL:', videoUrl);
    }
}

// Apply category box settings
function applyCategoryBoxes(data) {
    for (let i = 1; i <= 6; i++) {
        const boxKey = `category_box_${i}`;
        const boxData = data[boxKey];
        
        if (!boxData) continue;
        
        const boxElement = document.getElementById(`category-box-${i}`);
        if (!boxElement) continue;
        
        // Update link
        if (boxData.link) {
            boxElement.href = boxData.link;
        }
        
        // Update background image
        if (boxData.image) {
            boxElement.style.backgroundImage = `url('${boxData.image}')`;
            boxElement.style.backgroundSize = 'cover';
            boxElement.style.backgroundPosition = 'center';
        }
        
        // Update title (with optional emoji)
        const titleElement = boxElement.querySelector('.grid-item-title');
        if (titleElement && boxData.title) {
            const emoji = boxData.emoji || '';
            const title = boxData.title;
            titleElement.textContent = emoji ? `${emoji} ${title}` : title;
        }
    }
}

// Apply banner section settings
function applyBannerSettings(banner) {
    if (!banner) return;
    
    // Update banner title
    if (banner.title) {
        const titleEl = document.getElementById('shop-banner-title');
        if (titleEl) {
            titleEl.textContent = banner.title;
        }
    }
    
    // Update banner text
    if (banner.text) {
        const textEl = document.getElementById('shop-banner-text');
        if (textEl) {
            // Split text into paragraphs
            const paragraphs = banner.text
                .split('\n')
                .filter(line => line.trim() !== '')
                .map(line => `<p>${line.trim()}</p>`)
                .join('');
            
            textEl.innerHTML = paragraphs;
        }
    }
}

// Export for debugging
window.shopCMS = {
    reload: () => location.reload(),
    debug: () => {
        fetch('content/pages/shop-settings.md')
            .then(r => r.text())
            .then(t => {
                console.log('Raw markdown:', t);
                console.log('Parsed data:', parseShopSettings(t));
            });
    }
};

console.log('🛍️ Shop CMS loader initialized');
console.log('💡 Debug commands: shopCMS.reload() or shopCMS.debug()');
