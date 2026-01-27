/*
 * File: nubians-auto-cms.js
 * Created: 2025-01-20 15:15
 * Created By: Claude (AI Assistant)
 * Purpose: Load Mini Nubians page content from CMS and populate masonry gallery
 * Previous Version: N/A (new file)
 */

console.log('🐐 Nubians page initializing...');

// Fetch and parse the nubians.md file
fetch('content/pages/nubians.md')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch nubians.md: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        console.log('✅ Nubians.md loaded successfully');
        
        // Parse YAML frontmatter
        const frontmatter = parseFrontmatter(data);
        
        if (frontmatter) {
            // Update hero section
            if (frontmatter.hero) {
                if (frontmatter.hero.title) {
                    document.getElementById('heroTitle').textContent = frontmatter.hero.title;
                }
                if (frontmatter.hero.tagline) {
                    document.getElementById('heroTagline').textContent = frontmatter.hero.tagline;
                }
            }
            
            // Update mission section
            if (frontmatter.mission) {
                if (frontmatter.mission.title) {
                    document.getElementById('missionTitle').textContent = frontmatter.mission.title;
                }
                if (frontmatter.mission.body) {
                    document.getElementById('missionBody').innerHTML = convertMarkdownToHTML(frontmatter.mission.body);
                }
                if (frontmatter.mission.image) {
                    document.getElementById('missionImage').src = frontmatter.mission.image;
                }
            }
            
            // Update vision section
            if (frontmatter.vision) {
                if (frontmatter.vision.title) {
                    document.getElementById('visionTitle').textContent = frontmatter.vision.title;
                }
                if (frontmatter.vision.body) {
                    document.getElementById('visionBody').innerHTML = convertMarkdownToHTML(frontmatter.vision.body);
                }
                if (frontmatter.vision.image) {
                    document.getElementById('visionImage').src = frontmatter.vision.image;
                }
            }
            
            // Populate masonry gallery
            if (frontmatter.gallery && frontmatter.gallery.photos) {
                populateGallery(frontmatter.gallery.photos);
                console.log(`✅ Gallery populated with ${frontmatter.gallery.photos.length} photos`);
            }
            
            console.log('✅ Nubians page content loaded');
        }
    })
    .catch(error => {
        console.error('❌ Error loading nubians.md:', error);
    });

/**
 * Parse YAML frontmatter from markdown
 */
function parseFrontmatter(content) {
    const matches = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (!matches) {
        console.error('❌ No frontmatter found in nubians.md');
        return null;
    }
    
    const yamlString = matches[1];
    console.log('✅ Parsing YAML frontmatter...');
    
    try {
        return parseYAML(yamlString);
    } catch (error) {
        console.error('❌ Error parsing YAML:', error);
        return null;
    }
}

/**
 * Simple YAML parser (handles basic structure)
 */
function parseYAML(yaml) {
    const result = {};
    const lines = yaml.split('\n').filter(line => line.trim());
    let currentSection = null;
    let currentList = null;
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        if (!trimmed) continue;
        
        // Top-level key
        if (!line.startsWith('  ') && line.includes(':')) {
            const [key, value] = line.split(':').map(s => s.trim());
            
            if (value) {
                // Remove quotes if present
                result[key] = value.replace(/^["']|["']$/g, '');
            } else {
                currentSection = key;
                result[currentSection] = {};
            }
            currentList = null;
        }
        // Nested key
        else if (line.startsWith('  ') && !line.startsWith('    ')) {
            const [key, value] = line.split(':').map(s => s.trim());
            
            if (currentSection) {
                if (!result[currentSection]) {
                    result[currentSection] = {};
                }
                
                if (value) {
                    result[currentSection][key] = value.replace(/^["']|["']$/g, '');
                } else {
                    result[currentSection][key] = {};
                }
                currentList = null;
            }
        }
        // List item
        else if (line.startsWith('    - ')) {
            const value = line.substring(6).trim().replace(/^["']|["']$/g, '');
            
            if (currentSection && currentList) {
                const lastKey = Object.keys(result[currentSection]).pop();
                if (!Array.isArray(result[currentSection][lastKey])) {
                    result[currentSection][lastKey] = [];
                }
                result[currentSection][lastKey].push(value);
            }
        }
    }
    
    return result;
}

/**
 * Convert markdown to basic HTML
 */
function convertMarkdownToHTML(markdown) {
    if (!markdown) return '';
    
    let html = markdown
        .split('\n')
        .map(line => {
            line = line.trim();
            
            // Bold
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // Italic
            line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // List items
            if (line.startsWith('- ')) {
                return '<li>' + line.substring(2) + '</li>';
            }
            
            // Paragraphs
            if (line && !line.startsWith('<')) {
                return '<p>' + line + '</p>';
            }
            
            return line;
        })
        .join('\n');
    
    // Wrap list items in ul
    html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    
    return html;
}

/**
 * Populate masonry gallery with photos from CMS
 */
function populateGallery(photos) {
    const gallery = document.getElementById('masonryGallery');
    gallery.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = photo.image || photo;
        img.alt = photo.alt || `Mini Nubian ${index + 1}`;
        
        item.appendChild(img);
        gallery.appendChild(item);
        
        console.log(`  ✓ Gallery photo ${index + 1}: ${photo.image || photo}`);
    });
}

console.log('✅ Nubians CMS loader ready!');
