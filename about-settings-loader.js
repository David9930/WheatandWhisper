// About Page Settings Loader - Applies CMS settings to About page
// Loads about-config.md and applies fonts, colors, sizes dynamically

// ===== CONFIGURATION =====
const ABOUT_CONFIG_PATH = 'content/settings/about-config.md';

// ===== LOAD AND PARSE ABOUT CONFIG =====

async function loadAboutConfig() {
    try {
        console.log('🎨 Loading About page settings...');
        
        const response = await fetch(ABOUT_CONFIG_PATH);
        if (!response.ok) {
            console.warn('⚠️ About config not found, using defaults');
            return null;
        }
        
        const content = await response.text();
        const config = parseAboutConfig(content);
        
        console.log('✅ About settings loaded:', config);
        return config;
        
    } catch (error) {
        console.error('❌ Error loading About config:', error);
        return null;
    }
}

// Parse YAML frontmatter from about-config.md
function parseAboutConfig(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
        console.warn('⚠️ No frontmatter found in about-config.md');
        return {};
    }
    
    const yaml = match[1];
    const config = {};
    
    // Parse YAML line by line
    const lines = yaml.split('\n');
    lines.forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        
        if (line.includes(':')) {
            const colonIndex = line.indexOf(':');
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // Remove quotes
            value = value.replace(/^["']|["']$/g, '');
            
            // Parse boolean
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            
            config[key] = value;
        }
    });
    
    return config;
}

// ===== APPLY ABOUT SETTINGS =====

function applyAboutSettings(config) {
    if (!config) return;
    
    console.log('🎨 Applying About page settings...');
    
    // Apply fonts
    applyAboutFonts(config);
    
    // Apply sizes
    applyAboutSizes(config);
    
    // Apply colors
    applyAboutColors(config);
    
    console.log('✅ About settings applied!');
}

// ===== FONT APPLICATION =====

function applyAboutFonts(config) {
    const fonts = [];
    
    // Collect all fonts to load
    const pageTitleFont = config.font_page_title || 'Allura';
    const bodyTextFont = config.font_body_text || 'Lora';
    const overlay1Font = config.font_overlay_1 || 'Cormorant Garamond';
    const overlay2Font = config.font_overlay_2 || 'Lora';
    const overlay3Font = config.font_overlay_3 || 'Lora';
    const bottomTextFont = config.font_bottom_text || 'Lora';
    
    // Add unique fonts
    [pageTitleFont, bodyTextFont, overlay1Font, overlay2Font, overlay3Font, bottomTextFont].forEach(font => {
        if (!fonts.includes(font)) fonts.push(font);
    });
    
    // Load fonts from Google Fonts
    if (fonts.length > 0) {
        loadGoogleFonts(fonts);
    }
    
    // Apply font families via CSS
    const style = document.createElement('style');
    style.id = 'about-settings-fonts';
    
    style.textContent = `
        .about-page-title {
            font-family: '${pageTitleFont}', cursive !important;
        }
        
        .about-body-text p {
            font-family: '${bodyTextFont}', serif !important;
        }
        
        .overlay-line-1 {
            font-family: '${overlay1Font}', serif !important;
        }
        
        .overlay-line-2 {
            font-family: '${overlay2Font}', serif !important;
        }
        
        .overlay-line-3 {
            font-family: '${overlay3Font}', serif !important;
        }
        
        .about-bottom-text p {
            font-family: '${bottomTextFont}', serif !important;
        }
    `;
    
    // Remove old style if exists
    const oldStyle = document.getElementById('about-settings-fonts');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
    console.log(`✅ About fonts applied: PageTitle="${pageTitleFont}", Body="${bodyTextFont}", Overlay1="${overlay1Font}"`);
}

// Load Google Fonts dynamically
function loadGoogleFonts(fonts) {
    const fontString = fonts.map(f => f.replace(/ /g, '+')).join('&family=');
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontString}:wght@300;400;500;600;700&display=swap`;
    
    // Check if already loaded
    if (document.querySelector(`link[href*="${fonts[0]}"]`)) {
        console.log('✅ Fonts already loaded');
        return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
    
    console.log(`✅ Loading Google Fonts: ${fonts.join(', ')}`);
}

// ===== SIZE APPLICATION =====

function applyAboutSizes(config) {
    const style = document.createElement('style');
    style.id = 'about-settings-sizes';
    
    const pageTitleSize = config.size_page_title || '4rem';
    const bodyTextSize = config.size_body_text || '1.2rem';
    const overlay1Size = config.size_overlay_1 || '2.5rem';
    const overlay2Size = config.size_overlay_2 || '1rem';
    const overlay3Size = config.size_overlay_3 || '1rem';
    const bottomTextSize = config.size_bottom_text || '1.1rem';
    
    style.textContent = `
        .about-page-title {
            font-size: ${pageTitleSize} !important;
        }
        
        .about-body-text p {
            font-size: ${bodyTextSize} !important;
        }
        
        .overlay-line-1 {
            font-size: ${overlay1Size} !important;
        }
        
        .overlay-line-2 {
            font-size: ${overlay2Size} !important;
        }
        
        .overlay-line-3 {
            font-size: ${overlay3Size} !important;
        }
        
        .about-bottom-text p {
            font-size: ${bottomTextSize} !important;
        }
    `;
    
    const oldStyle = document.getElementById('about-settings-sizes');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
    console.log(`✅ About sizes applied: PageTitle=${pageTitleSize}, Body=${bodyTextSize}, Overlay1=${overlay1Size}`);
}

// ===== COLOR APPLICATION =====

function applyAboutColors(config) {
    const style = document.createElement('style');
    style.id = 'about-settings-colors';
    
    const pageTitleColor = config.color_page_title || '#8B6F47';
    const bodyTextColor = config.color_body_text || '#8B6F47';
    const overlay1Color = config.color_overlay_1 || '#5D4E37';
    const overlay2Color = config.color_overlay_2 || '#5D4E37';
    const overlay3Color = config.color_overlay_3 || '#5D4E37';
    const bottomTextColor = config.color_bottom_text || '#8B6F47';
    
    style.textContent = `
        .about-page-title {
            color: ${pageTitleColor} !important;
        }
        
        .about-body-text p {
            color: ${bodyTextColor} !important;
        }
        
        .overlay-line-1 {
            color: ${overlay1Color} !important;
        }
        
        .overlay-line-2 {
            color: ${overlay2Color} !important;
        }
        
        .overlay-line-3 {
            color: ${overlay3Color} !important;
        }
        
        .about-bottom-text p {
            color: ${bottomTextColor} !important;
        }
    `;
    
    const oldStyle = document.getElementById('about-settings-colors');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
    console.log(`✅ About colors applied: PageTitle=${pageTitleColor}, Body=${bodyTextColor}, Overlay1=${overlay1Color}`);
}

// ===== INITIALIZATION =====

async function initAboutSettings() {
    console.log('🚀 About Settings Loader initialized');
    
    const config = await loadAboutConfig();
    if (config) {
        applyAboutSettings(config);
    }
}

// Load settings when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutSettings);
} else {
    initAboutSettings();
}

console.log('✨ About Settings Loader ready!');
