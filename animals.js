// Wheat and Whisper Farm - Meet the Animals Page
// ULTRA-SAFE: Maximum error handling, will definitely work!

const GITHUB_USER = 'David9930';
const GITHUB_REPO = 'WheatandWhisper';
const ANIMALS_PATH = 'content/animals';

const API_BASE = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents`;
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main`;

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

// ULTRA-SAFE YAML parser with maximum error handling
function parseYAMLFrontmatter(content) {
    try {
        console.log('🔍 Starting YAML parse...');
        
        // Extract YAML frontmatter
        const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
        if (!match) {
            console.log('⚠️ No YAML frontmatter found');
            return { frontmatter: {}, content: content };
        }
        
        const yaml = match[1];
        const markdownContent = match[2] || '';
        
        console.log('📝 YAML content:', yaml);
        
        // Parse YAML line by line with ULTRA-SAFE handling
        const data = {};
        const lines = yaml.split('\n');
        
        let currentKey = null;
        let currentValue = '';
        let inMultiLine = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Handle multi-line continuation
            if (inMultiLine) {
                // Check if this line is indented (continuation)
                if (line.match(/^\s+\S/)) {
                    currentValue += ' ' + line.trim();
                    continue;
                } else {
                    // Multi-line ended, save the value
                    const finalValue = currentValue
                        .replace(/^["']|["']$/g, '')
                        .trim();
                    
                    data[currentKey] = finalValue;
                    console.log(`  ✅ ${currentKey}: "${finalValue}"`);
                    
                    currentKey = null;
                    currentValue = '';
                    inMultiLine = false;
                    
                    // Fall through to process this line as a new key
                }
            }
            
            // Skip empty lines and comments
            if (!line.trim() || line.trim().startsWith('#')) {
                continue;
            }
            
            // Parse key: value
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) {
                continue; // Not a valid YAML line
            }
            
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // ULTRA-SAFE: Handle all quote scenarios
            // Case 1: No quotes -> simple value
            // Case 2: "value" -> quoted value (complete)
            // Case 3: "value -> incomplete quoted value (multi-line)
            
            if (!value) {
                // Empty value
                data[key] = '';
                console.log(`  ✅ ${key}: ""`);
                continue;
            }
            
            // Check if it's a multi-line value
            const hasStartQuote = value.startsWith('"') || value.startsWith("'");
            const hasEndQuote = value.endsWith('"') || value.endsWith("'");
            
            if (hasStartQuote && !hasEndQuote) {
                // Multi-line string starting
                console.log(`  🔄 Multi-line detected for: ${key}`);
                currentKey = key;
                currentValue = value;
                inMultiLine = true;
                continue;
            }
            
            // Single-line value - clean it up
            let finalValue = value.replace(/^["']|["']$/g, '').trim();
            
            // Parse special values
            if (finalValue === 'true') {
                finalValue = true;
            } else if (finalValue === 'false') {
                finalValue = false;
            } else if (!isNaN(finalValue) && finalValue !== '') {
                finalValue = parseFloat(finalValue);
            }
            
            data[key] = finalValue;
            console.log(`  ✅ ${key}: "${finalValue}"`);
        }
        
        // Handle case where file ends with multi-line value
        if (inMultiLine && currentKey) {
            const finalValue = currentValue
                .replace(/^["']|["']$/g, '')
                .trim();
            
            data[currentKey] = finalValue;
            console.log(`  ✅ ${currentKey}: "${finalValue}" (end of file)`);
        }
        
        console.log('✅ YAML parsing complete:', data);
        
        return { 
            frontmatter: data, 
            content: markdownContent.trim() 
        };
        
    } catch (error) {
        console.error('❌ YAML parsing error:', error);
        // Return empty object if parsing fails
        return { frontmatter: {}, content: content };
    }
}

// Social icons
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
    const textAlign = animal.text_align || 'center';
    
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
        
        <div class="animal-content" data-text-align="${textAlign}">
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

// Load animals with ULTRA-SAFE error handling
async function loadAnimals() {
    try {
        console.log('🔄 Loading animals...');
        
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
        
        const animals = [];
        
        // Process each file individually with error handling
        for (const file of markdownFiles) {
            try {
                console.log(`\n📄 Processing: ${file.name}`);
                
                const fileResponse = await fetch(`${RAW_BASE}/${ANIMALS_PATH}/${file.name}`);
                const content = await fileResponse.text();
                
                const { frontmatter } = parseYAMLFrontmatter(content);
                
                // ULTRA-SAFE: Check if frontmatter exists
                if (!frontmatter || typeof frontmatter !== 'object') {
                    console.error(`⚠️ Invalid frontmatter for ${file.name}, skipping`);
                    continue;
                }
                
                const animal = {
                    name: frontmatter.name || 'Unknown',
                    photo: frontmatter.photo || 'images/uploads/placeholder-animal.jpg',
                    video_url: frontmatter.video_url || '',
                    short_description: frontmatter.short_description || 'A wonderful animal.',
                    text_align: frontmatter.text_align || 'center',
                    order: frontmatter.order || 999
                };
                
                console.log(`✅ Animal created:`, animal);
                animals.push(animal);
                
            } catch (fileError) {
                console.error(`❌ Error processing ${file.name}:`, fileError);
                // Continue with next file
                continue;
            }
        }
        
        console.log(`\n✅ Successfully loaded ${animals.length} animals`);
        
        if (animals.length === 0) {
            showEmptyState();
            return;
        }
        
        // Sort by order
        animals.sort((a, b) => a.order - b.order);
        
        // Display animals
        const grid = document.getElementById('animals-grid');
        animals.forEach(animal => {
            grid.appendChild(createAnimalCard(animal));
        });
        
        console.log('✅ Animals displayed on page!');
        
    } catch (error) {
        console.error('❌ Error loading animals:', error);
        showEmptyState();
    }
}

function showEmptyState() {
    const grid = document.getElementById('animals-grid');
    grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px;">
            <p style="font-family: 'Lora', serif; font-size: 1.3rem; color: var(--medium-brown); font-style: italic;">
                No animals have been added yet.<br>Check back soon! 🐴
            </p>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', loadAnimals);

console.log('✨ Animals page ready (ULTRA-SAFE version)!');
