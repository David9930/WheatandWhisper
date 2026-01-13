/*
 * File: animals-content-loader.js
 * Created: 2025-01-08 21:45
 * Created By: Claude (AI Assistant)
 * Purpose: Loads Animals page content from CMS (animals-settings.md)
 * Previous Version: N/A (new file)
 */

// Animals Page Content Loader
// Loads text content and hero image from animals-settings.md

// ===== CONTENT LOADER =====

async function loadAnimalsPageContent() {
    try {
        console.log('🔄 Loading Animals page content from CMS...');
        
        // Fetch the settings file
        const response = await fetch('content/pages/animals-settings.md');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const content = await response.text();
        console.log('✅ Animals settings loaded successfully');
        
        // Parse the YAML frontmatter
        const data = parseYAMLFrontmatter(content);
        console.log('📊 Parsed settings:', data);
        
        // Update the page with CMS content
        updateAnimalsPageContent(data);
        
        return data;
        
    } catch (error) {
        console.error('❌ Error loading Animals page content:', error);
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
    
    // Parse line by line (supports nested objects)
    const lines = yaml.split('\n');
    let currentObject = null;
    let currentKey = null;
    let indent = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip empty lines
        if (!line.trim()) continue;
        
        // Calculate indent level
        const lineIndent = line.search(/\S/);
        
        // Top-level key (object)
        if (lineIndent === 0 && line.includes(':') && !line.includes(': ')) {
            const key = line.replace(':', '').trim();
            data[key] = {};
            currentObject = data[key];
            currentKey = key;
            indent = 0;
        }
        // Nested property
        else if (lineIndent === 2 && currentObject) {
            const propMatch = line.trim().match(/^(\w+):\s*(.*)$/);
            if (propMatch) {
                const [, key, value] = propMatch;
                // Handle multi-line values
                if (value) {
                    currentObject[key] = value.replace(/^["']|["']$/g, '');
                } else {
                    currentObject[key] = '';
                }
            }
        }
    }
    
    return data;
}

// Update page content with CMS data
function updateAnimalsPageContent(data) {
    console.log('🎨 Updating Animals page content...');
    
    // ===== HEADER SECTION =====
    const headerSection = data.header_section || {};
    
    // Update page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle && headerSection.page_title) {
        pageTitle.textContent = headerSection.page_title;
        console.log('✅ Page title updated');
    }
    
    // Update page subtitle
    const pageSubtitle = document.querySelector('.page-subtitle');
    if (pageSubtitle && headerSection.page_subtitle) {
        pageSubtitle.textContent = headerSection.page_subtitle;
        console.log('✅ Page subtitle updated');
    }
    
    // Update intro text
    const introText = document.querySelector('.intro-text p');
    if (introText && headerSection.intro_text) {
        introText.textContent = headerSection.intro_text;
        console.log('✅ Intro text updated');
    }
    
    // Update Bible verse
    const bibleVerse = document.querySelector('.bible-verse p');
    if (bibleVerse && headerSection.bible_verse && headerSection.bible_reference) {
        bibleVerse.innerHTML = `${headerSection.bible_verse} <em>(${headerSection.bible_reference})</em>`;
        console.log('✅ Bible verse updated');
    }
    
    // ===== HERO IMAGE SECTION =====
    const heroImageSection = data.hero_image_section || {};
    
    // Update hero image
    const heroImage = document.querySelector('.hero-image');
    if (heroImage && heroImageSection.hero_image) {
        heroImage.src = heroImageSection.hero_image;
        if (heroImageSection.image_alt) {
            heroImage.alt = heroImageSection.image_alt;
        }
        console.log('✅ Hero image updated');
    }
    
    // ===== OUR STORY SECTION =====
    const ourStorySection = data.our_story_section || {};
    
    // Update Our Story title
    const storyTitle = document.querySelector('.section-title-serif');
    if (storyTitle && ourStorySection.story_title) {
        storyTitle.textContent = ourStorySection.story_title;
        console.log('✅ Our Story title updated');
    }
    
    // Update Our Story text
    const storyText = document.querySelector('.story-text p');
    if (storyText && ourStorySection.story_text) {
        storyText.textContent = ourStorySection.story_text;
        console.log('✅ Our Story text updated');
    }
    
    // ===== ANIMALS GRID SECTION =====
    const animalsGridSection = data.animals_grid_section || {};
    
    // Update section title
    const sectionTitle = document.querySelector('.section-title-script');
    if (sectionTitle && animalsGridSection.section_title) {
        sectionTitle.textContent = animalsGridSection.section_title;
        console.log('✅ Animals section title updated');
    }
    
    console.log('🎉 All content updated successfully!');
}

// ===== INITIALIZATION =====

// Load content when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAnimalsPageContent);
} else {
    // DOM already loaded
    loadAnimalsPageContent();
}

console.log('✨ Animals Content Loader Ready!');
