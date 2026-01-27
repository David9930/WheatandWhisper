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
                    console.log('📝 Setting hero title:', frontmatter.hero.title);
                    document.getElementById('heroTitle').textContent = frontmatter.hero.title;
                }
                if (frontmatter.hero.tagline) {
                    console.log('📝 Setting hero tagline:', frontmatter.hero.tagline);
                    document.getElementById('heroTagline').textContent = frontmatter.hero.tagline;
                }
            }
            
            // Update mission section
            if (frontmatter.mission) {
                if (frontmatter.mission.title) {
                    console.log('📝 Setting mission title:', frontmatter.mission.title);
                    document.getElementById('missionTitle').textContent = frontmatter.mission.title;
                }
                if (frontmatter.mission.body) {
                    console.log('📝 Setting mission body (length: ' + frontmatter.mission.body.length + ')');
                    const missionHTML = convertMarkdownToHTML(frontmatter.mission.body);
                    console.log('📝 Mission HTML:', missionHTML);
                    document.getElementById('missionBody').innerHTML = missionHTML;
                }
                if (frontmatter.mission.image) {
                    console.log('🖼️ Setting mission image:', frontmatter.mission.image);
                    document.getElementById('missionImage').src = frontmatter.mission.image;
                }
            }
            
            // Update vision section
            if (frontmatter.vision) {
                if (frontmatter.vision.title) {
                    console.log('📝 Setting vision title:', frontmatter.vision.title);
                    document.getElementById('visionTitle').textContent = frontmatter.vision.title;
                }
                if (frontmatter.vision.body) {
                    console.log('📝 Setting vision body (length: ' + frontmatter.vision.body.length + ')');
                    const visionHTML = convertMarkdownToHTML(frontmatter.vision.body);
                    console.log('📝 Vision HTML:', visionHTML);
                    document.getElementById('visionBody').innerHTML = visionHTML;
                }
                if (frontmatter.vision.image) {
                    console.log('🖼️ Setting vision image:', frontmatter.vision.image);
                    document.getElementById('visionImage').src = frontmatter.vision.image;
                }
            }
            
            // Populate masonry gallery
            if (frontmatter.gallery && frontmatter.gallery.photos) {
                console.log('📸 Gallery photos found:', frontmatter.gallery.photos);
                populateGallery(frontmatter.gallery.photos);
                console.log(`✅ Gallery populated with ${frontmatter.gallery.photos.length} photos`);
            }
            
            console.log('✅ Nubians page content loaded successfully!');
        } else {
            console.error('❌ No frontmatter data available');
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
 * Better YAML parser (handles multiline text with > and |)
 */
function parseYAML(yaml) {
    const result = {};
    const lines = yaml.split('\n');
    let currentSection = null;
    let currentKey = null;
    let multilineText = [];
    let multilineMode = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Skip empty lines (unless in multiline mode)
        if (!trimmed) {
            if (multilineMode) {
                multilineText.push('');
            }
            continue;
        }
        
        const indent = line.length - line.trimStart().length;
        
        // Check if this is a multiline indicator (> or |)
        if (trimmed.match(/^(\w+):\s*[>|]$/)) {
            multilineMode = true;
            currentKey = trimmed.split(':')[0].trim();
            multilineText = [];
            continue;
        }
        
        // If we're in multiline mode and this line is indented more than top level
        if (multilineMode && indent > 0) {
            multilineText.push(trimmed);
            continue;
        }
        
        // End multiline mode and save the text
        if (multilineMode) {
            const text = multilineText.join(' ').trim();
            if (currentSection) {
                if (!result[currentSection]) {
                    result[currentSection] = {};
                }
                result[currentSection][currentKey] = text;
            } else {
                result[currentKey] = text;
            }
            multilineMode = false;
            multilineText = [];
            currentKey = null;
        }
        
        // Top-level key (no indent)
        if (indent === 0 && line.includes(':')) {
            const colonIndex = line.indexOf(':');
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            
            if (value && !value.match(/^[>|]$/)) {
                result[key] = value.replace(/^["']|["']$/g, '');
            } else {
                currentSection = key;
                result[currentSection] = {};
            }
        }
        // Nested key (2-space indent)
        else if (indent === 2 && line.includes(':')) {
            const colonIndex = line.indexOf(':');
            const key = line.substring(indent, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            
            if (currentSection) {
                if (!result[currentSection]) {
                    result[currentSection] = {};
                }
                
                if (value && !value.match(/^[>|]$/)) {
                    result[currentSection][key] = value.replace(/^["']|["']$/g, '');
                } else {
                    result[currentSection][key] = {};
                }
            }
        }
        // List items (4-space indent with -)
        else if (indent === 4 && trimmed.startsWith('- ')) {
            if (currentSection && currentKey) {
                if (!Array.isArray(result[currentSection][currentKey])) {
                    result[currentSection][currentKey] = [];
                }
                result[currentSection][currentKey].push({
                    image: '',
                    alt: ''
                });
            }
        }
        // List item properties (6-space indent)
        else if (indent === 6 && line.includes(':')) {
            const colonIndex = line.indexOf(':');
            const key = line.substring(indent, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
            
            if (currentSection && currentKey && result[currentSection][currentKey]) {
                const items = result[currentSection][currentKey];
                if (Array.isArray(items) && items.length > 0) {
                    items[items.length - 1][key] = value;
                }
            }
        }
    }
    
    // Handle any remaining multiline text at EOF
    if (multilineMode && currentKey) {
        const text = multilineText.join(' ').trim();
        if (currentSection) {
            if (!result[currentSection]) {
                result[currentSection] = {};
            }
            result[currentSection][currentKey] = text;
        } else {
            result[currentKey] = text;
        }
    }
    
    console.log('🔍 Parsed YAML:', result);
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
