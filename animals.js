// TRY-CATCH VERSION - Wraps parser in error handler to catch the issue
const GITHUB_USER = 'David9930';
const GITHUB_REPO = 'WheatandWhisper';
const ANIMALS_PATH = 'content/animals';

const API_BASE = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents`;
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main`;

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

// WRAPPED IN TRY-CATCH to catch any errors
function parseYAMLFrontmatter(content) {
    try {
        console.log('🔍 Parser called, content length:', content.length);
        
        // Extract YAML
        const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
        
        if (!match) {
            console.log('❌ No regex match found');
            return { frontmatter: {}, content: content };
        }
        
        console.log('✅ Regex matched!');
        
        const yaml = match[1];
        console.log('📝 YAML length:', yaml.length);
        console.log('📝 YAML:\n' + yaml);
        
        const data = {};
        const lines = yaml.split('\n');
        
        let currentKey = null;
        let currentValue = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Multi-line continuation
            if (currentKey && line.match(/^\s+/)) {
                currentValue += ' ' + line.trim();
                continue;
            }
            
            // Save previous multi-line
            if (currentKey) {
                data[currentKey] = currentValue.replace(/^["']|["']$/g, '').trim();
                currentKey = null;
                currentValue = '';
            }
            
            // Skip empty
            if (!line.trim()) continue;
            
            // Parse key: value
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) continue;
            
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // Multi-line start?
            if ((value.startsWith('"') && !value.endsWith('"')) || 
                (value.startsWith("'") && !value.endsWith("'"))) {
                currentKey = key;
                currentValue = value;
                continue;
            }
            
            // Single-line value
            const cleaned = value.replace(/^["']|["']$/g, '').trim();
            
            if (cleaned === 'true') data[key] = true;
            else if (cleaned === 'false') data[key] = false;
            else if (!isNaN(cleaned) && cleaned !== '') data[key] = parseFloat(cleaned);
            else data[key] = cleaned;
        }
        
        // Final multi-line
        if (currentKey) {
            data[currentKey] = currentValue.replace(/^["']|["']$/g, '').trim();
        }
        
        console.log('✅ Parsed data:', data);
        
        return { 
            frontmatter: data, 
            content: content.substring(match[0].length).trim() 
        };
        
    } catch (error) {
        console.error('❌ PARSER ERROR:', error);
        console.error('   Error message:', error.message);
        console.error('   Error stack:', error.stack);
        // Return empty object so app doesn't crash
        return { frontmatter: {}, content: content };
    }
}

const socialIconsSVG = {
    facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    twitter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    linkedin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
};

function createAnimalCard(animal) {
    const card = document.createElement('div');
    card.className = 'animal-card';
    
    const videoId = extractYouTubeVideoId(animal.video_url);
    const hasVideo = !!videoId;
    
    card.innerHTML = `
        <div class="media-container">
            <img src="${animal.photo}" alt="${animal.name}" class="animal-photo active">
            ${hasVideo ? `<iframe class="animal-video" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>` : ''}
        </div>
        <div class="animal-content">
            <h2 class="animal-name">${animal.name}</h2>
            <p class="animal-description">${animal.short_description}</p>
            <div class="animal-social-icons">
                <a href="#" aria-label="Facebook">${socialIconsSVG.facebook}</a>
                <a href="#" aria-label="Twitter">${socialIconsSVG.twitter}</a>
                <a href="#" aria-label="LinkedIn">${socialIconsSVG.linkedin}</a>
            </div>
            ${hasVideo ? `<button class="meet-button">Meet ${animal.name}</button>` : ''}
        </div>
    `;
    
    if (hasVideo) {
        const button = card.querySelector('.meet-button');
        const photo = card.querySelector('.animal-photo');
        const video = card.querySelector('.animal-video');
        let isShowing = false;
        
        button.addEventListener('click', () => {
            if (!isShowing) {
                photo.classList.remove('active');
                setTimeout(() => {
                    video.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                    video.classList.add('active');
                    button.textContent = 'Back to Photo';
                    isShowing = true;
                }, 300);
            } else {
                video.classList.remove('active');
                setTimeout(() => { video.src = ''; }, 500);
                photo.classList.add('active');
                button.textContent = `Meet ${animal.name}`;
                isShowing = false;
            }
        });
    }
    
    return card;
}

async function loadAnimals() {
    try {
        console.log('🔄 Loading animals...');
        
        const response = await fetch(`${API_BASE}/${ANIMALS_PATH}`);
        const files = await response.json();
        const markdownFiles = files.filter(f => f && f.name && f.name.endsWith('.md'));
        
        console.log(`📊 Found ${markdownFiles.length} files`);
        
        const animals = [];
        
        for (const file of markdownFiles) {
            console.log(`\n📄 Processing: ${file.name}`);
            
            const fileResponse = await fetch(`${RAW_BASE}/${ANIMALS_PATH}/${file.name}`);
            const content = await fileResponse.text();
            
            console.log(`📊 Content length: ${content.length}`);
            
            const result = parseYAMLFrontmatter(content);
            console.log(`📊 Parse result:`, result);
            
            const { frontmatter } = result;
            
            if (!frontmatter || Object.keys(frontmatter).length === 0) {
                console.error(`⚠️ Empty frontmatter for ${file.name}`);
                continue;
            }
            
            const animal = {
                name: frontmatter.name || 'Unknown',
                photo: frontmatter.photo || 'images/uploads/placeholder-animal.jpg',
                video_url: frontmatter.video_url || '',
                short_description: frontmatter.short_description || 'A wonderful animal.',
                order: frontmatter.order || 999
            };
            
            console.log(`✅ Animal:`, animal);
            animals.push(animal);
        }
        
        console.log(`\n✅ Loaded ${animals.length} animals`);
        
        if (animals.length === 0) {
            showEmptyState();
            return;
        }
        
        animals.sort((a, b) => a.order - b.order);
        
        const grid = document.getElementById('animals-grid');
        animals.forEach(a => grid.appendChild(createAnimalCard(a)));
        
        console.log('✅ Done!');
        
    } catch (error) {
        console.error('❌ Load error:', error);
        showEmptyState();
    }
}

function showEmptyState() {
    document.getElementById('animals-grid').innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px;">
            <p style="font-family: 'Lora', serif; font-size: 1.3rem; color: #8B6F47; font-style: italic;">
                No animals found 🐴
            </p>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', loadAnimals);

console.log('✨ TRY-CATCH version ready!');
