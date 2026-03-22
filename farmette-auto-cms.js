// Wheat and Whisper Farm - Farmette Life Page Auto-CMS Loader
// Loads content from CMS and updates the page automatically!

// ===== CONTENT LOADER =====

// Fetch and parse farmette page content from CMS
async function loadFarmetteContent() {
    try {
        console.log('🔄 Loading farmette page content from CMS...');
        
        // Fetch the content file from GitHub Pages
        const response = await fetch('content/pages/farmette.md');
        
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
        console.error('❌ Error loading farmette content:', error);
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
    
    // Parse line by line - handles nested objects
    const lines = yaml.split('\n');
    let currentSection = null;
    let currentKey = null;
    let multiLineValue = [];
    let isMultiLine = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Handle multi-line text
        if (isMultiLine) {
            if (line.startsWith('  ') || line.trim() === '') {
                multiLineValue.push(line.substring(2));
            } else {
                // Save multi-line value
                if (currentSection && currentKey) {
                    if (!data[currentSection]) data[currentSection] = {};
                    data[currentSection][currentKey] = multiLineValue.join('\n').trim();
                }
                isMultiLine = false;
                multiLineValue = [];
                currentKey = null;
                i--; // Re-process this line
                continue;
            }
            continue;
        }
        
        // Skip empty lines
        if (!line.trim()) continue;
        
        // Check for section headers (no indentation, ends with :)
        if (!line.startsWith(' ') && line.endsWith(':')) {
            currentSection = line.replace(':', '').trim();
            data[currentSection] = {};
            continue;
        }
        
        // Check for key-value pairs (indented with 2 spaces)
        if (line.startsWith('  ') && line.includes(':')) {
            const colonIndex = line.indexOf(':');
            const key = line.substring(2, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            
            // Check if multi-line
            if (value === '|' || value === '>') {
                isMultiLine = true;
                currentKey = key;
                multiLineValue = [];
            } else if (value) {
                // Regular value - remove quotes
                if (currentSection) {
                    data[currentSection][key] = value.replace(/^["']|["']$/g, '');
                }
            }
        }
    }
    
    // Handle case where multi-line is at end of file
    if (isMultiLine && currentSection && currentKey) {
        data[currentSection][currentKey] = multiLineValue.join('\n').trim();
    }
    
    return data;
}

// Update page content with CMS data
function updatePageContent(data) {
    console.log('🎨 Updating page content...');
    
    // ===== PAGE HEADER =====
    const pageTitle = document.querySelector('.page-title');
    const pageDescription = document.querySelector('.page-description');
    
    if (pageTitle && data.page_header && data.page_header.title) {
        pageTitle.textContent = data.page_header.title;
        console.log('✅ Page title updated');
    }
    
    if (pageDescription && data.page_header && data.page_header.description) {
        // Convert smart quotes to regular quotes
        const cleanDescription = data.page_header.description
            .replace(/"|"/g, '"')
            .replace(/'|'/g, "'");
        pageDescription.textContent = cleanDescription;
        console.log('✅ Page description updated');
    }
    
    // ===== EMOTIONS SECTION =====
    if (data.emotions_section) {
        const emotionsSection = document.querySelector('.section-emotions');
        
        // Update image
        const emotionsImage = emotionsSection?.querySelector('.section-image');
        if (emotionsImage && data.emotions_section.image) {
            emotionsImage.src = data.emotions_section.image;
            emotionsImage.alt = data.emotions_section.title || 'Emotions';
            console.log('✅ Emotions image updated');
        }
        
        // Update title
        const emotionsTitle = emotionsSection?.querySelector('.section-title');
        if (emotionsTitle && data.emotions_section.title) {
            emotionsTitle.textContent = data.emotions_section.title;
            console.log('✅ Emotions title updated');
        }
        
        // Update body text
        const emotionsText = emotionsSection?.querySelector('.section-text');
        if (emotionsText && data.emotions_section.body) {
            // Convert smart quotes
            const cleanBody = data.emotions_section.body
                .replace(/"|"/g, '"')
                .replace(/'|'/g, "'");
            
            // Split into paragraphs
            const paragraphs = cleanBody
                .split('\n\n')
                .filter(p => p.trim())
                .map(p => `<p>${p.trim()}</p>`)
                .join('');
            
            // Add quote if exists
            let htmlContent = paragraphs;
            if (data.emotions_section.quote) {
                const cleanQuote = data.emotions_section.quote
                    .replace(/"|"/g, '"')
                    .replace(/'|'/g, "'");
                htmlContent += `<p class="quote-text">${cleanQuote}</p>`;
            }
            
            emotionsText.innerHTML = htmlContent;
            console.log('✅ Emotions text updated');
        }
    }
    
    // ===== VISION SECTION =====
    if (data.vision_section) {
        const visionSection = document.querySelector('.section-vision');
        
        // Update image
        const visionImage = visionSection?.querySelector('.section-image');
        if (visionImage && data.vision_section.image) {
            visionImage.src = data.vision_section.image;
            visionImage.alt = data.vision_section.title || 'Vision';
            console.log('✅ Vision image updated');
        }
        
        // Update title
        const visionTitle = visionSection?.querySelector('.section-title');
        if (visionTitle && data.vision_section.title) {
            visionTitle.textContent = data.vision_section.title;
            console.log('✅ Vision title updated');
        }
        
        // Update body text
        const visionText = visionSection?.querySelector('.section-text');
        if (visionText && data.vision_section.body) {
            // Convert smart quotes
            const cleanBody = data.vision_section.body
                .replace(/"|"/g, '"')
                .replace(/'|'/g, "'");
            
            // Split into paragraphs
            const paragraphs = cleanBody
                .split('\n\n')
                .filter(p => p.trim())
                .map(p => `<p>${p.trim()}</p>`)
                .join('');
            
            visionText.innerHTML = paragraphs;
            console.log('✅ Vision text updated');
        }
    }
    
    // ===== COMMENTS SECTION =====
    if (data.comments_section) {
        const commentsTitle = document.querySelector('.comments-title');
        const commentsSubtitle = document.querySelector('.comments-subtitle');
        const moderationNote = document.querySelector('.moderation-note');
        
        if (commentsTitle && data.comments_section.title) {
            commentsTitle.textContent = data.comments_section.title;
            console.log('✅ Comments title updated');
        }
        
        if (commentsSubtitle && data.comments_section.subtitle) {
            commentsSubtitle.textContent = data.comments_section.subtitle;
            console.log('✅ Comments subtitle updated');
        }
        
        if (moderationNote && data.comments_section.moderation_note) {
            // Convert smart quotes
            const cleanNote = data.comments_section.moderation_note
                .replace(/"|"/g, '"')
                .replace(/'|'/g, "'");
            moderationNote.textContent = cleanNote;
            console.log('✅ Moderation note updated');
        }
    }
    
    console.log('🎉 All content updated successfully!');
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Wheat and Whisper Farm - Farmette Page Auto-CMS Initialized');
    
    // Load content from CMS
    await loadFarmetteContent();
});

console.log('✨ Farmette Page Auto-CMS Ready!');
