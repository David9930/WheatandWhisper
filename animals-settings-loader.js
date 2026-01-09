// Animals Page Settings Loader
// Applies CMS settings for fonts, colors, and sizes

const ANIMALS_CONFIG_PATH = 'content/settings/animals-config.md';

// Load and parse animals config
async function loadAnimalsConfig() {
    try {
        console.log('🎨 Loading Animals page settings...');
        
        const response = await fetch(ANIMALS_CONFIG_PATH);
        if (!response.ok) {
            console.warn('⚠️ Animals config not found, using defaults');
            return null;
        }
        
        const content = await response.text();
        const config = parseAnimalsConfig(content);
        
        console.log('✅ Animals settings loaded:', config);
        return config;
        
    } catch (error) {
        console.error('❌ Error loading Animals config:', error);
        return null;
    }
}

// Parse YAML frontmatter
function parseAnimalsConfig(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
        console.warn('⚠️ No frontmatter found in animals-config.md');
        return {};
    }
    
    const yaml = match[1];
    const config = {};
    
    const lines = yaml.split('\n');
    lines.forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        
        if (line.includes(':')) {
            const colonIndex = line.indexOf(':');
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            value = value.replace(/^["']|["']$/g, '');
            
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            
            config[key] = value;
        }
    });
    
    return config;
}

// Apply animals settings
function applyAnimalsSettings(config) {
    if (!config) return;
    
    console.log('🎨 Applying Animals page settings...');
    
    applyAnimalsFonts(config);
    applyAnimalsSizes(config);
    applyAnimalsColors(config);
    
    console.log('✅ Animals settings applied!');
}

// Apply fonts
function applyAnimalsFonts(config) {
    const fonts = [];
    
    const pageTitleFont = config.font_page_title || 'Cormorant Garamond';
    const pageSubtitleFont = config.font_page_subtitle || 'Lora';
    const cardNameFont = config.font_card_name || 'Cormorant Garamond';
    const cardDescFont = config.font_card_description || 'Lora';
    
    [pageTitleFont, pageSubtitleFont, cardNameFont, cardDescFont].forEach(font => {
        if (!fonts.includes(font)) fonts.push(font);
    });
    
    if (fonts.length > 0) {
        loadGoogleFonts(fonts);
    }
    
    const style = document.createElement('style');
    style.id = 'animals-settings-fonts';
    
    style.textContent = `
        .page-title {
            font-family: '${pageTitleFont}', serif !important;
        }
        
        .page-subtitle {
            font-family: '${pageSubtitleFont}', serif !important;
        }
        
        .animal-name {
            font-family: '${cardNameFont}', serif !important;
        }
        
        .animal-description {
            font-family: '${cardDescFont}', serif !important;
        }
    `;
    
    const oldStyle = document.getElementById('animals-settings-fonts');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
    console.log(`✅ Animals fonts applied: PageTitle="${pageTitleFont}", CardName="${cardNameFont}"`);
}

// Load Google Fonts dynamically
function loadGoogleFonts(fonts) {
    const fontString = fonts.map(f => f.replace(/ /g, '+')).join('&family=');
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontString}:wght@300;400;500;600;700&display=swap`;
    
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

// Apply sizes
function applyAnimalsSizes(config) {
    const style = document.createElement('style');
    style.id = 'animals-settings-sizes';
    
    const pageTitleSize = config.size_page_title || '4rem';
    const pageSubtitleSize = config.size_page_subtitle || '1.3rem';
    const cardNameSize = config.size_card_name || '2.2rem';
    const cardDescSize = config.size_card_description || '1.05rem';
    
    style.textContent = `
        .page-title {
            font-size: ${pageTitleSize} !important;
        }
        
        .page-subtitle {
            font-size: ${pageSubtitleSize} !important;
        }
        
        .animal-name {
            font-size: ${cardNameSize} !important;
        }
        
        .animal-description {
            font-size: ${cardDescSize} !important;
        }
    `;
    
    const oldStyle = document.getElementById('animals-settings-sizes');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
    console.log(`✅ Animals sizes applied: PageTitle=${pageTitleSize}, CardName=${cardNameSize}`);
}

// Apply colors
function applyAnimalsColors(config) {
    const style = document.createElement('style');
    style.id = 'animals-settings-colors';
    
    const pageTitleColor = config.color_page_title || '#5D4E37';
    const pageSubtitleColor = config.color_page_subtitle || '#8B6F47';
    const cardNameColor = config.color_card_name || '#C9A66B';
    const cardDescColor = config.color_card_description || '#5D4E37';
    
    style.textContent = `
        .page-title {
            color: ${pageTitleColor} !important;
        }
        
        .page-subtitle {
            color: ${pageSubtitleColor} !important;
        }
        
        .animal-name {
            color: ${cardNameColor} !important;
        }
        
        .animal-description {
            color: ${cardDescColor} !important;
        }
    `;
    
    const oldStyle = document.getElementById('animals-settings-colors');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
    console.log(`✅ Animals colors applied: PageTitle=${pageTitleColor}, CardName=${cardNameColor}`);
}

// Initialize
async function initAnimalsSettings() {
    console.log('🚀 Animals Settings Loader initialized');
    
    const config = await loadAnimalsConfig();
    if (config) {
        applyAnimalsSettings(config);
    }
}

// Load settings when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimalsSettings);
} else {
    initAnimalsSettings();
}

console.log('✨ Animals Settings Loader ready!');
