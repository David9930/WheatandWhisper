/*
 * File: retrievers-auto-cms.js
 * Created: 2025-01-17
 * Created By: Claude (AI Assistant)
 * Purpose: Loads Golden Retrievers page content from CMS (retrievers.md)
 * Previous Version: N/A (new file)
 */

// Wait for page to load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch the retrievers.md file
        const response = await fetch('/content/pages/retrievers.md');
        const markdown = await response.text();
        
        // Parse the frontmatter (YAML between --- markers)
        const data = parseFrontmatter(markdown);
        
        // Load announcement banner
        loadAnnouncement(data.announcement);
        
        // Load all box content
        loadBoxContent(data);
        
        // Load CTA section
        loadCTA(data.cta);
        
    } catch (error) {
        console.error('Error loading retrievers page content:', error);
    }
});

/**
 * Parse YAML frontmatter from markdown
 */
function parseFrontmatter(markdown) {
    // Extract content between --- markers
    const match = markdown.match(/^---\n([\s\S]*?)\n---/);
    if (!match) {
        console.error('No frontmatter found in retrievers.md');
        return {};
    }
    
    const yamlText = match[1];
    
    // Simple YAML parser (handles our specific structure)
    const data = {
        hero: {},
        announcement: {},
        box_1: {},
        box_2: {},
        box_3: {},
        box_4: {},
        cta: {}
    };
    
    let currentSection = null;
    let currentKey = null;
    let multilineValue = '';
    let inMultiline = false;
    
    const lines = yamlText.split('\n');
    
    for (let line of lines) {
        // Check for section headers (hero:, announcement:, box_1:, etc.)
        if (line.match(/^(hero|announcement|box_\d+|cta):/)) {
            currentSection = line.replace(':', '').trim();
            continue;
        }
        
        // Skip empty lines
        if (!line.trim()) continue;
        
        // Handle key-value pairs within sections
        if (currentSection && line.match(/^\s{2}[a-z_]+:/)) {
            // If we were in multiline mode, save the previous value
            if (inMultiline) {
                data[currentSection][currentKey] = multilineValue.trim();
                multilineValue = '';
                inMultiline = false;
            }
            
            const [key, ...valueParts] = line.trim().split(':');
            const value = valueParts.join(':').trim();
            currentKey = key;
            
            // Check if this is a multiline value (starts with > or |)
            if (value === '>' || value === '|') {
                inMultiline = true;
                multilineValue = '';
            } else if (value) {
                // Remove quotes if present
                data[currentSection][key] = value.replace(/^["']|["']$/g, '');
            }
        } 
        // Handle multiline content
        else if (inMultiline && currentSection && currentKey) {
            const content = line.replace(/^\s{4}/, ''); // Remove indentation
            multilineValue += content + '\n';
        }
    }
    
    // Save last multiline value if any
    if (inMultiline && currentSection && currentKey) {
        data[currentSection][currentKey] = multilineValue.trim();
    }
    
    return data;
}

/**
 * Load announcement banner
 */
function loadAnnouncement(announcement) {
    if (!announcement || !announcement.text) {
        // No announcement text, keep banner hidden
        return;
    }
    
    const banner = document.getElementById('announcementBanner');
    const textElement = document.getElementById('announcementText');
    
    if (banner && textElement) {
        textElement.textContent = announcement.text;
        banner.style.display = 'block'; // Show the banner
    }
}

/**
 * Load content for all boxes
 */
function loadBoxContent(data) {
    for (let i = 1; i <= 4; i++) {
        const boxData = data[`box_${i}`];
        if (!boxData) continue;
        
        // Update image if provided
        if (boxData.image) {
            const img = document.getElementById(`box${i}Image`);
            if (img) {
                img.src = boxData.image;
            }
        }
        
        // Update title (optional - can be managed in HTML too)
        // Update subtitle (optional)
        // Update body text (optional)
        // We're keeping the structure in HTML for now
        // This can be expanded if needed
    }
}

/**
 * Load CTA section
 */
function loadCTA(cta) {
    if (!cta) return;
    
    // Update CTA title
    if (cta.title) {
        const titleElement = document.querySelector('.cta-title');
        if (titleElement) {
            titleElement.textContent = cta.title;
        }
    }
    
    // Update CTA text
    if (cta.text) {
        const textElement = document.querySelector('.cta-text');
        if (textElement) {
            textElement.textContent = cta.text;
        }
    }
    
    // Update CTA button
    if (cta.button_text) {
        const buttonElement = document.querySelector('.cta-button');
        if (buttonElement) {
            buttonElement.textContent = cta.button_text;
        }
    }
    
    if (cta.button_link) {
        const buttonElement = document.querySelector('.cta-button');
        if (buttonElement) {
            buttonElement.href = cta.button_link;
        }
    }
}
