// Site Settings Loader - Applies design settings from CMS
// This file loads settings from content/settings/site-config.md and applies them

console.log('🎨 Site Settings Loader - Initializing...');

// Configuration
const SETTINGS_PATH = 'content/settings/site-config.md';

// Parse YAML frontmatter from settings file
function parseSettingsYAML(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
        console.error('❌ No YAML frontmatter found in settings file');
        return null;
    }
    
    const yaml = match[1];
    const settings = {};
    
    // Parse line by line
    const lines = yaml.split('\n');
    
    for (let line of lines) {
        line = line.trim();
        
        // Skip comments and empty lines
        if (!line || line.startsWith('#')) continue;
        
        // Parse key-value pairs
        if (line.includes(':')) {
            const colonIndex = line.indexOf(':');
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // Remove quotes if present
            value = value.replace(/^["']|["']$/g, '');
            
            // Parse boolean
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            
            settings[key] = value;
        }
    }
    
    console.log('✅ Parsed settings:', settings);
    return settings;
}

// Resolve font name (handles custom fonts)
function resolveFontName(fontValue, customValue) {
    // If font is set to "custom" and custom value exists, use custom value
    if (fontValue === 'custom' && customValue && customValue.trim() !== '') {
        return customValue.trim();
    }
    // Otherwise use the selected font
    return fontValue;
}

// Build Google Fonts URL dynamically
function buildGoogleFontsURL(fonts) {
    // Remove duplicates
    const uniqueFonts = [...new Set(fonts)];
    
    // Build family parameters
    const families = uniqueFonts.map(font => {
        // Add common weights for each font
        return `${font.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400`;
    });
    
    return `https://fonts.googleapis.com/css2?${families.map(f => `family=${f}`).join('&')}&display=swap`;
}

// Load Google Fonts dynamically
function loadGoogleFonts(fonts) {
    // Check if fonts are already loaded
    const existingLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    
    // Remove old font links (we'll replace with new consolidated one)
    existingLinks.forEach(link => {
        if (!link.href.includes('css2?family=')) return; // Keep base Google Fonts
        link.remove();
    });
    
    // Create new font link
    const fontURL = buildGoogleFontsURL(fonts);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontURL;
    
    document.head.appendChild(link);
    
    console.log('✅ Google Fonts loaded:', fonts.join(', '));
    console.log('📄 Font URL:', fontURL);
}

// Apply settings to CSS variables
function applySettings(settings) {
    const root = document.documentElement;
    
    // ===== RESOLVE FONTS =====
    const titleFont = resolveFontName(settings.font_title, settings.font_title_custom);
    const subtitleFont = resolveFontName(settings.font_subtitle, settings.font_subtitle_custom);
    const bodyFont = resolveFontName(settings.font_body, settings.font_body_custom);
    
    // Load Google Fonts for all used fonts
    const fontsToLoad = [titleFont, subtitleFont, bodyFont];
    loadGoogleFonts(fontsToLoad);
    
    // ===== APPLY TYPOGRAPHY =====
    
    // Determine font category (for fallback)
    function getFontFamily(fontName) {
        const scriptFonts = ['Sacramento', 'Great Vibes', 'Pacifico', 'Dancing Script'];
        const serifFonts = ['Lora', 'Crimson Text', 'Playfair Display', 'Cormorant Garamond'];
        
        if (scriptFonts.some(f => fontName.includes(f))) {
            return `'${fontName}', cursive`;
        } else if (serifFonts.some(f => fontName.includes(f))) {
            return `'${fontName}', serif`;
        } else {
            return `'${fontName}', sans-serif`;
        }
    }
    
    root.style.setProperty('--font-title', getFontFamily(titleFont));
    root.style.setProperty('--font-subtitle', getFontFamily(subtitleFont));
    root.style.setProperty('--font-body', getFontFamily(bodyFont));
    
    console.log('📝 Fonts applied:');
    console.log('  Title:', titleFont);
    console.log('  Subtitle:', subtitleFont);
    console.log('  Body:', bodyFont);
    
    // Font sizes
    if (settings.title_size) root.style.setProperty('--title-size', settings.title_size);
    if (settings.subtitle_size) root.style.setProperty('--subtitle-size', settings.subtitle_size);
    if (settings.body_size) root.style.setProperty('--body-size', settings.body_size);
    
    // ===== APPLY COLORS =====
    if (settings.color_primary) root.style.setProperty('--color-primary', settings.color_primary);
    if (settings.color_background) root.style.setProperty('--color-background', settings.color_background);
    if (settings.color_background_alt) root.style.setProperty('--color-background-alt', settings.color_background_alt);
    if (settings.color_text) root.style.setProperty('--color-text', settings.color_text);
    if (settings.color_text_medium) root.style.setProperty('--color-text-medium', settings.color_text_medium);
    if (settings.color_accent) root.style.setProperty('--color-accent', settings.color_accent);
    
    console.log('🎨 Colors applied');
    
    // ===== APPLY BOX TITLE STYLING =====
    if (settings.box_title_color) root.style.setProperty('--box-title-color', settings.box_title_color);
    if (settings.box_title_underline_color) root.style.setProperty('--box-title-underline-color', settings.box_title_underline_color);
    
    // Apply underline setting
    if (settings.box_title_underline !== undefined) {
        const underlineStyle = settings.box_title_underline === true || settings.box_title_underline === 'true' 
            ? 'underline' 
            : 'none';
        root.style.setProperty('--box-title-underline', underlineStyle);
    }
    
    // ===== APPLY SPACING =====
    if (settings.section_padding) root.style.setProperty('--section-padding', settings.section_padding);
    if (settings.grid_gap) root.style.setProperty('--grid-gap', settings.grid_gap);
    if (settings.hero_height) root.style.setProperty('--hero-height', settings.hero_height);
    
    console.log('📏 Spacing applied');
    
    // ===== APPLY ADVANCED =====
    if (settings.border_radius) root.style.setProperty('--border-radius', settings.border_radius);
    if (settings.box_shadow) root.style.setProperty('--box-shadow', settings.box_shadow);
    
    console.log('✨ All settings applied successfully!');
}

// Load settings from CMS
async function loadSiteSettings() {
    try {
        console.log('📥 Loading settings from:', SETTINGS_PATH);
        
        const response = await fetch(SETTINGS_PATH);
        
        if (!response.ok) {
            console.warn('⚠️ Settings file not found, using defaults');
            return null;
        }
        
        const content = await response.text();
        const settings = parseSettingsYAML(content);
        
        if (settings) {
            applySettings(settings);
            return settings;
        } else {
            console.warn('⚠️ Failed to parse settings, using defaults');
            return null;
        }
        
    } catch (error) {
        console.error('❌ Error loading site settings:', error);
        console.log('⚠️ Using default styles');
        return null;
    }
}

// Initialize settings when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSiteSettings);
} else {
    // DOM is already loaded
    loadSiteSettings();
}

// Export for other scripts if needed
window.loadSiteSettings = loadSiteSettings;

console.log('✅ Site Settings Loader ready!');
