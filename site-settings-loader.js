// Site Settings Loader - Applies CMS settings to the website
// Loads site-config.md and applies fonts, colors, spacing dynamically

// ===== CONFIGURATION =====
const SITE_CONFIG_PATH = 'content/settings/site-config.md';

// ===== LOAD AND PARSE SITE CONFIG =====

async function loadSiteConfig() {
    try {
        console.log('🎨 Loading site settings...');
        
        const response = await fetch(SITE_CONFIG_PATH);
        if (!response.ok) {
            console.warn('⚠️ Site config not found, using defaults');
            return null;
        }
        
        const content = await response.text();
        const config = parseSiteConfig(content);
        
        console.log('✅ Site settings loaded:', config);
        return config;
        
    } catch (error) {
        console.error('❌ Error loading site config:', error);
        return null;
    }
}

// Parse YAML frontmatter from site-config.md
function parseSiteConfig(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
        console.warn('⚠️ No frontmatter found in site-config.md');
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

// ===== APPLY SITE SETTINGS =====

function applySiteSettings(config) {
    if (!config) return;
    
    console.log('🎨 Applying site settings to page...');
    
    // Apply fonts
    applyFonts(config);
    
    // Apply colors
    applyColors(config);
    
    // Apply spacing
    applySpacing(config);
    
    // Apply sizes
    applySizes(config);
    
    // Apply box title styling
    applyBoxTitleStyles(config);
    
    // Apply advanced styles
    applyAdvancedStyles(config);
    
    console.log('✅ Site settings applied!');
}

// ===== FONT APPLICATION =====

function applyFonts(config) {
    const fonts = [];
    
    // Get fonts to load
    let titleFont = config.font_title || 'Montserrat';
    if (titleFont === 'custom' && config.font_title_custom) {
        titleFont = config.font_title_custom;
    }
    if (titleFont !== 'custom') fonts.push(titleFont);
    
    let subtitleFont = config.font_subtitle || 'Sacramento';
    if (subtitleFont === 'custom' && config.font_subtitle_custom) {
        subtitleFont = config.font_subtitle_custom;
    }
    if (subtitleFont !== 'custom') fonts.push(subtitleFont);
    
    let bodyFont = config.font_body || 'Josefin Sans';
    if (bodyFont === 'custom' && config.font_body_custom) {
        bodyFont = config.font_body_custom;
    }
    if (bodyFont !== 'custom') fonts.push(bodyFont);
    
    // Load fonts from Google Fonts
    if (fonts.length > 0) {
        loadGoogleFonts(fonts);
    }
    
    // Apply font families via CSS
    const style = document.createElement('style');
    style.id = 'site-settings-fonts';
    
    style.textContent = `
        .hero-title {
            font-family: '${titleFont}', serif !important;
        }
        
        .hero-subtitle {
            font-family: '${subtitleFont}', serif !important;
        }
        
        .hero-tagline {
            font-family: '${subtitleFont}', serif !important;
        }
        
        body, .newsletter-input, .newsletter-button {
            font-family: '${bodyFont}', sans-serif !important;
        }
        
        .grid-item-title {
            font-family: '${titleFont}', serif !important;
        }
        
        .poetic-title {
            font-family: '${subtitleFont}', cursive !important;
        }
    `;
    
    // Remove old style if exists
    const oldStyle = document.getElementById('site-settings-fonts');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
    console.log(`✅ Fonts applied: Title="${titleFont}", Subtitle="${subtitleFont}", Body="${bodyFont}"`);
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

// ===== COLOR APPLICATION =====

function applyColors(config) {
    const style = document.createElement('style');
    style.id = 'site-settings-colors';
    
    const primary = config.color_primary || '#C9A66B';
    const background = config.color_background || '#FFFEF9';
    const backgroundAlt = config.color_background_alt || '#F5F3ED';
    const text = config.color_text || '#5D4E37';
    const textMedium = config.color_text_medium || '#8B6F47';
    const accent = config.color_accent || '#D4AF37';
    
    style.textContent = `
        :root {
            --cream-bg: ${background};
            --beige-bg: ${backgroundAlt};
            --warm-brown: ${text};
            --medium-brown: ${textMedium};
            --light-brown: ${primary};
            --gold-accent: ${accent};
        }
        
        body {
            background-color: ${background} !important;
            color: ${text} !important;
        }
        
        .hero-title, .hero-subtitle, .hero-tagline {
            color: #F5DEB3 !important;
        }
        
        .nav-link {
            color: ${textMedium} !important;
        }
        
        .poetic-section {
            background: ${backgroundAlt} !important;
        }
        
        .newsletter-button {
            background: ${primary} !important;
        }
        
        .newsletter-button:hover {
            background: ${text} !important;
        }
    `;
    
    const oldStyle = document.getElementById('site-settings-colors');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
    console.log('✅ Colors applied');
}

// ===== SPACING APPLICATION =====

function applySpacing(config) {
    const style = document.createElement('style');
    style.id = 'site-settings-spacing';
    
    const sectionPadding = config.section_padding || '80px';
    const gridGap = config.grid_gap || '30px';
    const heroHeight = config.hero_height || '600px';
    
    style.textContent = `
        .sections-grid, .poetic-section, .newsletter-section {
            padding: ${sectionPadding} 40px !important;
        }
        
        .grid-container {
            gap: ${gridGap} !important;
        }
        
        .hero-section {
            height: ${heroHeight} !important;
        }
    `;
    
    const oldStyle = document.getElementById('site-settings-spacing');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
    console.log('✅ Spacing applied');
}

// ===== SIZE APPLICATION =====

function applySizes(config) {
    const style = document.createElement('style');
    style.id = 'site-settings-sizes';
    
    const titleSize = config.title_size || '5rem';
    const subtitleSize = config.subtitle_size || '1.4rem';
    const bodySize = config.body_size || '1rem';
    
    style.textContent = `
        .hero-title {
            font-size: ${titleSize} !important;
        }
        
        .hero-subtitle {
            font-size: ${subtitleSize} !important;
        }
        
        body {
            font-size: ${bodySize} !important;
        }
    `;
    
    const oldStyle = document.getElementById('site-settings-sizes');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
    console.log('✅ Sizes applied');
}

// ===== BOX TITLE STYLING =====

function applyBoxTitleStyles(config) {
    const style = document.createElement('style');
    style.id = 'site-settings-box-titles';
    
    const boxTitleColor = config.box_title_color || '#C9A66B';
    const showUnderline = config.box_title_underline !== false;
    const underlineColor = config.box_title_underline_color || '#C9A66B';
    
    style.textContent = `
        .grid-item-title {
            color: white !important;
            ${showUnderline ? `
                border-bottom: 2px solid ${underlineColor};
                padding-bottom: 10px;
            ` : ''}
        }
    `;
    
    const oldStyle = document.getElementById('site-settings-box-titles');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
    console.log('✅ Box title styling applied');
}

// ===== ADVANCED STYLES =====

function applyAdvancedStyles(config) {
    const style = document.createElement('style');
    style.id = 'site-settings-advanced';
    
    const borderRadius = config.border_radius || '8px';
    const boxShadow = config.box_shadow || '0 4px 20px rgba(93, 78, 55, 0.08)';
    
    style.textContent = `
        .grid-item {
            border-radius: ${borderRadius} !important;
            box-shadow: ${boxShadow} !important;
        }
    `;
    
    const oldStyle = document.getElementById('site-settings-advanced');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
    console.log('✅ Advanced styles applied');
}

// ===== INITIALIZATION =====

async function initSiteSettings() {
    console.log('🚀 Site Settings Loader initialized');
    
    const config = await loadSiteConfig();
    if (config) {
        applySiteSettings(config);
    }
}

// Load settings when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSiteSettings);
} else {
    initSiteSettings();
}

console.log('✨ Site Settings Loader ready!');
