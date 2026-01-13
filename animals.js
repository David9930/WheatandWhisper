// Wheat and Whisper Farm - Meet the Animals Page
// WORKING VERSION - Based on horses.js with unique function names

const GITHUB_USER = 'David9930';
const GITHUB_REPO = 'WheatandWhisper';
const ANIMALS_PATH = 'content/animals';

const API_BASE = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents`;
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main`;

// DOM Elements
const loadingEl = document.getElementById('loading');
const animalsGridEl = document.getElementById('animals-grid');
const emptyStateEl = document.getElementById('empty-state');
const modalEl = document.getElementById('animal-modal');
const modalBodyEl = document.getElementById('modal-body');

// Parse YAML frontmatter and markdown content
// RENAMED to avoid conflict with animals-content-loader.js!
function parseAnimalMarkdown(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
        return { frontmatter: {}, content: content };
    }
    
    const frontmatterText = match[1];
    const markdownContent = match[2];
    
    // Parse YAML frontmatter
    const frontmatter = {};
    const lines = frontmatterText.split('\n');
    let currentKey = null;
    let currentList = null;
    
    lines.forEach(line => {
        line = line.trim();
        if (!line) return;
        
        // Check if it's a list item
        if (line.startsWith('- ')) {
            if (currentList) {
                // Check if it's a simple list item or object
                if (line.includes(':')) {
                    // It's an object in a list
                    const objMatch = line.match(/- (\w+): (.+)/);
                    if (objMatch) {
                        const [, key, value] = objMatch;
                        const lastItem = currentList[currentList.length - 1];
                        if (typeof lastItem === 'object') {
                            lastItem[key] = value.replace(/['"]/g, '');
                        } else {
                            currentList.push({ [key]: value.replace(/['"]/g, '') });
                        }
                    }
                } else {
                    // Simple list item
                    currentList.push(line.substring(2).replace(/['"]/g, ''));
                }
            }
        }
        // Check for nested object properties
        else if (line.startsWith('  ') && currentList) {
            const objMatch = line.match(/(\w+): (.+)/);
            if (objMatch) {
                const [, key, value] = objMatch;
                const lastItem = currentList[currentList.length - 1];
                if (typeof lastItem === 'object') {
                    lastItem[key] = value.replace(/['"]/g, '');
                }
            }
        }
        // Regular key-value pair
        else if (line.includes(':')) {
            const colonIndex = line.indexOf(':');
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            
            if (!value || value === '') {
                // This is a list or object starting
                currentKey = key;
                currentList = [];
                frontmatter[key] = currentList;
            } else {
                // Regular value
                currentKey = null;
                currentList = null;
                
                // Parse boolean
                if (value === 'true') frontmatter[key] = true;
                else if (value === 'false') frontmatter[key] = false;
                // Parse number
                else if (!isNaN(value) && value !== '') frontmatter[key] = parseFloat(value);
                // String (remove quotes)
                else frontmatter[key] = value.replace(/^["']|["']$/g, '');
            }
        }
    });
    
    return { frontmatter, content: markdownContent.trim() };
}

// Simple markdown to HTML converter
function markdownToHTML(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Line breaks and paragraphs
    html = html.split('\n\n').map(para => {
        if (para.trim().startsWith('<h') || para.trim() === '') {
            return para;
        }
        return `<p>${para.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');
    
    return html;
}

// Extract YouTube video ID
function extractYouTubeVideoId(url) {
    if (!url) return null;
    
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

// Social icons SVG
const socialIconsSVG = {
    facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    twitter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    linkedin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
};

// Create animal card
function createAnimalCard(animal) {
    const card = document.createElement('div');
    card.className = 'animal-card';
    
    const videoId = extractYouTubeVideoId(animal.video_url);
    const hasVideo = !!videoId;
    
    card.innerHTML = `
        <div class="media-container">
            <img 
                src="${animal.photo}" 
                alt="${animal.name}" 
                class="animal-photo active"
                onerror="this.src='images/uploads/placeholder-animal.jpg'"
            >
            ${hasVideo ? `
                <iframe 
                    class="animal-video" 
                    data-video-id="${videoId}"
                    frameborder="0"
                    allow="autoplay; encrypted-media"
                    allowfullscreen
                ></iframe>
            ` : ''}
        </div>
        
        <div class="animal-content">
            <h2 class="animal-name">${animal.name}</h2>
            <p class="animal-description">${animal.short_description}</p>
            
            <div class="animal-social-icons">
                <a href="#" aria-label="Facebook">${socialIconsSVG.facebook}</a>
                <a href="#" aria-label="Twitter">${socialIconsSVG.twitter}</a>
                <a href="#" aria-label="LinkedIn">${socialIconsSVG.linkedin}</a>
            </div>
            
            ${hasVideo ? `
                <button class="meet-button" data-animal="${animal.name}">
                    Meet ${animal.name}
                </button>
            ` : ''}
        </div>
    `;
    
    // Add video toggle functionality
    if (hasVideo) {
        const button = card.querySelector('.meet-button');
        const photo = card.querySelector('.animal-photo');
        const video = card.querySelector('.animal-video');
        let isShowingVideo = false;
        
        button.addEventListener('click', () => {
            if (!isShowingVideo) {
                console.log(`🎬 Playing video for ${animal.name}`);
                button.textContent = 'Loading...';
                button.disabled = true;
                photo.classList.remove('active');
                
                setTimeout(() => {
                    video.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&autohide=1&rel=0&showinfo=0&iv_load_policy=3`;
                    video.classList.add('active');
                    setTimeout(() => {
                        button.disabled = false;
                        button.textContent = 'Back to Photo';
                        button.classList.add('showing-video');
                        isShowingVideo = true;
                    }, 500);
                }, 300);
            } else {
                console.log(`📷 Showing photo for ${animal.name}`);
                video.classList.remove('active');
                setTimeout(() => { video.src = ''; }, 500);
                photo.classList.add('active');
                button.textContent = `Meet ${animal.name}`;
                button.classList.remove('showing-video');
                isShowingVideo = false;
            }
        });
    }
    
    return card;
}

// Load animals from GitHub
async function loadAnimals() {
    try {
        console.log('🔄 Loading animals from GitHub...');
        
        // Fetch list of files
        const response = await fetch(`${API_BASE}/${ANIMALS_PATH}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch animals directory: ${response.status}`);
        }
        
        const files = await response.json();
        const markdownFiles = files.filter(file => file && file.name && file.name.endsWith('.md'));
        
        console.log(`📊 Found ${markdownFiles.length} animal files`);
        
        if (markdownFiles.length === 0) {
            showEmptyState();
            return;
        }
        
        // Fetch and parse each animal file
        const animals = await Promise.all(
            markdownFiles.map(async (file) => {
                const fileResponse = await fetch(`${RAW_BASE}/${ANIMALS_PATH}/${file.name}`);
                const content = await fileResponse.text();
                const parsed = parseAnimalMarkdown(content);
                
                return {
                    ...parsed.frontmatter,
                    content: markdownToHTML(parsed.content),
                    filename: file.name
                };
            })
        );
        
        // Sort by order
        animals.sort((a, b) => (a.order || 999) - (b.order || 999));
        
        console.log(`✅ Loaded ${animals.length} animals`);
        
        // Hide loading, display animals
        if (loadingEl) loadingEl.style.display = 'none';
        
        animals.forEach(animal => {
            if (animalsGridEl) {
                animalsGridEl.appendChild(createAnimalCard(animal));
            }
        });
        
        console.log('✅ Animals displayed on page!');
        
    } catch (error) {
        console.error('❌ Error loading animals:', error);
        if (loadingEl) loadingEl.innerHTML = `
            <p style="color: #E65100;">Error loading animals. Please try again later.</p>
        `;
    }
}

function showEmptyState() {
    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyStateEl) emptyStateEl.style.display = 'block';
}

// Load animals when page loads
document.addEventListener('DOMContentLoaded', loadAnimals);

console.log('✨ Animals page ready! (Working version with unique function names)');
