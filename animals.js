// Wheat and Whisper Farm - Meet the Animals Page
// Photo/Video Toggle Functionality

// Configuration
const GITHUB_USER = 'David9930';
const GITHUB_REPO = 'WheatandWhisper';
const ANIMALS_PATH = 'content/animals';
const SETTINGS_PATH = 'content/pages/animals-settings.md';

// GitHub API URLs
const API_BASE = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents`;
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main`;

// ===== UTILITY FUNCTIONS =====

// Extract YouTube video ID from various URL formats
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

// Parse YAML frontmatter from markdown
function parseYAMLFrontmatter(content) {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return { frontmatter: {}, content: content };
    
    const yaml = match[1];
    const markdownContent = match[2] || '';
    const data = {};
    
    const lines = yaml.split('\n');
    lines.forEach(line => {
        if (!line.trim() || line.startsWith('#')) return;
        
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;
        
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // Remove quotes
        value = value.replace(/^["']|["']$/g, '');
        
        // Parse booleans
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        
        data[key] = value;
    });
    
    return { frontmatter: data, content: markdownContent.trim() };
}

// ===== PAGE SETTINGS =====

// Load and apply page background settings
async function loadPageSettings() {
    try {
        const response = await fetch(`${RAW_BASE}/${SETTINGS_PATH}`);
        if (!response.ok) {
            console.log('⚠️ No settings file found, using defaults');
            return;
        }
        
        const content = await response.text();
        const { frontmatter } = parseYAMLFrontmatter(content);
        
        console.log('📊 Page settings loaded:', frontmatter);
        
        // Apply background
        if (frontmatter.use_background_image && frontmatter.background_image) {
            document.body.classList.add('has-background-image');
            document.body.style.backgroundImage = `url('${frontmatter.background_image}')`;
            console.log('✅ Background image applied');
        } else {
            // Use plain wheat background (default in CSS)
            console.log('✅ Using plain wheat background');
        }
        
    } catch (error) {
        console.log('⚠️ Could not load page settings, using defaults');
    }
}

// ===== ANIMAL CARDS =====

// Create an animal card with photo/video toggle
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
            <button 
                class="meet-button" 
                data-animal="${animal.name}"
                ${!hasVideo ? 'disabled' : ''}
            >
                ${hasVideo ? `Meet ${animal.name}` : 'Video Coming Soon'}
            </button>
        </div>
    `;
    
    // Add click handler for video toggle
    if (hasVideo) {
        const button = card.querySelector('.meet-button');
        const photo = card.querySelector('.animal-photo');
        const video = card.querySelector('.animal-video');
        
        let isShowingVideo = false;
        
        button.addEventListener('click', () => {
            if (!isShowingVideo) {
                // SWITCH TO VIDEO
                console.log(`🎬 Playing video for ${animal.name}`);
                
                // Show loading state
                button.classList.add('loading');
                button.disabled = true;
                
                // Fade out photo
                photo.classList.remove('active');
                
                // Load and show video
                setTimeout(() => {
                    video.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0`;
                    video.classList.add('active');
                    
                    // Update button after video loads
                    setTimeout(() => {
                        button.classList.remove('loading');
                        button.disabled = false;
                        button.textContent = 'Back to Photo';
                        isShowingVideo = true;
                    }, 500);
                }, 300);
                
            } else {
                // SWITCH BACK TO PHOTO
                console.log(`📷 Showing photo for ${animal.name}`);
                
                // Fade out video
                video.classList.remove('active');
                
                // Stop video
                setTimeout(() => {
                    video.src = '';
                }, 500);
                
                // Fade in photo
                photo.classList.add('active');
                
                // Update button
                button.textContent = `Meet ${animal.name}`;
                isShowingVideo = false;
            }
        });
    }
    
    return card;
}

// ===== LOAD ANIMALS =====

// Load animals from GitHub
async function loadAnimals() {
    try {
        console.log('🔄 Loading animals...');
        
        // Fetch the list of files in the animals directory
        const response = await fetch(`${API_BASE}/${ANIMALS_PATH}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch animals directory');
        }
        
        const files = await response.json();
        
        // Filter for markdown files
        const markdownFiles = files.filter(file => file.name.endsWith('.md'));
        
        if (markdownFiles.length === 0) {
            console.log('⚠️ No animal files found');
            showEmptyState();
            return;
        }
        
        // Fetch and parse each animal file
        const animals = await Promise.all(
            markdownFiles.map(async (file) => {
                const fileResponse = await fetch(`${RAW_BASE}/${ANIMALS_PATH}/${file.name}`);
                const content = await fileResponse.text();
                const { frontmatter } = parseYAMLFrontmatter(content);
                
                return {
                    name: frontmatter.name || 'Unknown',
                    photo: frontmatter.photo || 'images/uploads/placeholder-animal.jpg',
                    video_url: frontmatter.video_url || '',
                    short_description: frontmatter.short_description || 'A wonderful animal.',
                    order: frontmatter.order || 999
                };
            })
        );
        
        // Sort by order
        animals.sort((a, b) => a.order - b.order);
        
        console.log('✅ Loaded animals:', animals);
        
        // Display animals
        const grid = document.getElementById('animals-grid');
        animals.forEach(animal => {
            grid.appendChild(createAnimalCard(animal));
        });
        
    } catch (error) {
        console.error('❌ Error loading animals:', error);
        showEmptyState();
    }
}

// Show empty state if no animals
function showEmptyState() {
    const grid = document.getElementById('animals-grid');
    grid.innerHTML = `
        <div style="
            grid-column: 1 / -1;
            text-align: center;
            padding: 80px 20px;
        ">
            <p style="
                font-family: 'Lora', serif;
                font-size: 1.3rem;
                color: var(--medium-brown);
                font-style: italic;
            ">
                No animals have been added yet.<br>
                Check back soon to meet our farm family! 🐴
            </p>
        </div>
    `;
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Animals page initialized');
    
    // Load page settings (background)
    await loadPageSettings();
    
    // Load animals
    await loadAnimals();
});

// Analytics tracking
function trackPageView() {
    const pageData = {
        page: 'animals',
        timestamp: new Date().toISOString(),
        referrer: document.referrer
    };
    console.log('📊 Page view:', pageData);
}

window.addEventListener('load', trackPageView);

console.log('✨ Animals page script loaded!');
