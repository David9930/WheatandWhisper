// Wheat and Whisper Farm - About Page Auto-CMS Loader
// Loads content from CMS and updates the page automatically!

// ===== CONTENT LOADER =====

// Fetch and parse about page content from CMS
async function loadAboutContent() {
    try {
        console.log('🔄 Loading about page content from CMS...');
        
        // Fetch the content file from GitHub Pages
        const response = await fetch('content/pages/about.md');
        
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
        console.error('❌ Error loading about content:', error);
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
    let multiLineKey = null;
    let multiLineValue = [];
    let isMultiLine = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if we're in multi-line mode
        if (isMultiLine) {
            // Check if this line is still indented (part of multi-line text)
            if (line.startsWith('  ') || line.trim() === '') {
                // Add to multi-line value (remove the 2-space indent)
                multiLineValue.push(line.substring(2));
            } else {
                // Multi-line section ended, save it
                if (multiLineKey) {
                    data[multiLineKey] = multiLineValue.join('\n').trim();
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
        
        // Skip empty lines
        if (!line.trim()) continue;
        
        // Check if this is a key-value pair
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1 && !line.startsWith(' ')) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            
            // Check if this is the start of multi-line text (ends with |)
            if (value === '|') {
                isMultiLine = true;
                multiLineKey = key;
                multiLineValue = [];
            } else if (value) {
                // Regular value - remove quotes if present
                data[key] = value.replace(/^["']|["']$/g, '');
            }
        }
    }
    
    // Handle case where multi-line is at the end of file
    if (isMultiLine && multiLineKey) {
        data[multiLineKey] = multiLineValue.join('\n').trim();
    }
    
    return data;
}

// Update page content with CMS data
function updatePageContent(data) {
    console.log('🎨 Updating page content...');
    
    // ===== PAGE TITLE =====
    const titleSection = document.querySelector('.about-title-section');
    const titleElement = document.querySelector('.about-page-title');
    
    if (titleElement && data.page_title) {
        titleElement.textContent = data.page_title;
        console.log('✅ Page title updated');
    }
    
    if (titleSection && data.title_align) {
        titleSection.setAttribute('data-align', data.title_align);
        console.log('✅ Title alignment updated');
    }
    
    // ===== BODY TEXT =====
    const bodySection = document.querySelector('.about-body-section');
    const bodyTextContainer = document.querySelector('.about-body-text');
    
    if (bodyTextContainer && data.body_text) {
        // Split text by newlines and wrap each paragraph in <p> tags
        const paragraphs = data.body_text
            .split('\n')
            .filter(p => p.trim())
            .map(p => `<p>${p.trim()}</p>`)
            .join('');
        
        bodyTextContainer.innerHTML = paragraphs;
        console.log('✅ Body text updated');
    }
    
    if (bodySection && data.body_align) {
        bodySection.setAttribute('data-align', data.body_align);
        console.log('✅ Body alignment updated');
    }
    
    // ===== HERO IMAGE =====
    const heroImage = document.querySelector('.about-hero-image');
    
    if (heroImage && data.hero_image) {
        heroImage.src = data.hero_image;
        heroImage.alt = data.page_title || 'About Wheat and Whisper Farm';
        console.log('✅ Hero image updated');
    }
    
    // ===== IMAGE OVERLAY TEXT =====
    const overlayText = document.querySelector('.about-overlay-text');
    
    if (overlayText) {
        // Check if we have overlay text
        const hasOverlay = data.overlay_line_1 || data.overlay_line_2 || data.overlay_line_3;
        
        if (hasOverlay) {
            let overlayHTML = '';
            
            if (data.overlay_line_1) {
                overlayHTML += `<p class="overlay-line-1">${data.overlay_line_1}</p>`;
            }
            if (data.overlay_line_2) {
                overlayHTML += `<p class="overlay-line-2">${data.overlay_line_2}</p>`;
            }
            if (data.overlay_line_3) {
                overlayHTML += `<p class="overlay-line-3">${data.overlay_line_3}</p>`;
            }
            
            overlayText.innerHTML = overlayHTML;
            console.log('✅ Image overlay text updated');
        } else {
            // Hide overlay if no text
            overlayText.parentElement.style.display = 'none';
            console.log('ℹ️ No overlay text - hiding overlay');
        }
    }
    
    // ===== BOTTOM TEXT =====
    const bottomSection = document.querySelector('.about-bottom-section');
    const bottomTextContainer = document.querySelector('.about-bottom-text');
    
    if (bottomTextContainer && data.bottom_text) {
        // Split text by newlines and wrap each line in <p> tags
        const paragraphs = data.bottom_text
            .split('\n')
            .filter(p => p.trim())
            .map(p => `<p>${p.trim()}</p>`)
            .join('');
        
        bottomTextContainer.innerHTML = paragraphs;
        console.log('✅ Bottom text updated');
    } else if (bottomTextContainer) {
        // Hide bottom section if no text
        bottomSection.style.display = 'none';
        console.log('ℹ️ No bottom text - hiding section');
    }
    
    if (bottomSection && data.bottom_align) {
        bottomSection.setAttribute('data-align', data.bottom_align);
        console.log('✅ Bottom alignment updated');
    }
    
    console.log('🎉 All content updated successfully!');
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Wheat and Whisper Farm - About Page Auto-CMS Initialized');
    
    // Load content from CMS
    await loadAboutContent();
});

console.log('✨ About Page Auto-CMS Ready!');
