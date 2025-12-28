// horses.js - Fetch and display horse profiles from GitHub

// Configuration
const GITHUB_USER = 'David9930';
const GITHUB_REPO = 'WheatandWhisper';
const HORSES_PATH = 'content/horses';

// GitHub API URLs
const API_BASE = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${HORSES_PATH}`;
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${HORSES_PATH}`;

// DOM Elements
const loadingEl = document.getElementById('loading');
const horsesGridEl = document.getElementById('horses-grid');
const emptyStateEl = document.getElementById('empty-state');
const modalEl = document.getElementById('horse-modal');
const modalBodyEl = document.getElementById('modal-body');

// Parse YAML frontmatter and markdown content
function parseMarkdown(content) {
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
                    // It's an object in a list (like gallery items)
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

// Create a horse card
function createHorseCard(horse) {
    const card = document.createElement('div');
    card.className = 'horse-card';
    card.onclick = () => openHorseModal(horse);
    
    // DEBUG: Log what we're getting
    console.log('Horse data:', horse);
    console.log('Featured image value:', horse.featured_image);
    console.log('Featured image type:', typeof horse.featured_image);
    
    const imageUrl = horse.featured_image || '/images/uploads/placeholder-horse.jpg';
    console.log('Final imageUrl:', imageUrl);
    
    const excerpt = horse.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${horse.title}" class="horse-image" onerror="this.style.display='none'">
        <div class="horse-content">
            <h2 class="horse-name">${horse.title}</h2>
            ${horse.breed ? `<p class="horse-breed">${horse.breed}</p>` : ''}
            
            <div class="horse-meta">
                ${horse.age ? `<span class="meta-item"><strong>Age:</strong> ${horse.age}</span>` : ''}
                ${horse.color ? `<span class="meta-item"><strong>Color:</strong> ${horse.color}</span>` : ''}
            </div>
            
            <p class="horse-excerpt">${excerpt}</p>
            
            <div class="horse-badges">
                ${horse.color ? `<span class="badge badge-color">${horse.color}</span>` : ''}
                ${horse.available_visits ? '<span class="badge badge-visit">Available for Visits</span>' : ''}
                ${horse.adoptable ? '<span class="badge badge-adoptable">Adoptable</span>' : ''}
            </div>
        </div>
    `;
    
    return card;
}

// Open horse detail modal
function openHorseModal(horse) {
    const imageUrl = horse.featured_image || '/images/uploads/placeholder-horse.jpg';
    
    let metaHTML = '<div class="modal-meta-grid">';
    if (horse.age) metaHTML += `
        <div class="modal-meta-item">
            <div class="modal-meta-label">Age</div>
            <div class="modal-meta-value">${horse.age}</div>
        </div>
    `;
    if (horse.height) metaHTML += `
        <div class="modal-meta-item">
            <div class="modal-meta-label">Height</div>
            <div class="modal-meta-value">${horse.height} hh</div>
        </div>
    `;
    if (horse.color) metaHTML += `
        <div class="modal-meta-item">
            <div class="modal-meta-label">Color</div>
            <div class="modal-meta-value">${horse.color}</div>
        </div>
    `;
    if (horse.temperament) metaHTML += `
        <div class="modal-meta-item">
            <div class="modal-meta-label">Temperament</div>
            <div class="modal-meta-value">${horse.temperament}</div>
        </div>
    `;
    if (horse.arrival_date) metaHTML += `
        <div class="modal-meta-item">
            <div class="modal-meta-label">Arrived</div>
            <div class="modal-meta-value">${new Date(horse.arrival_date).toLocaleDateString()}</div>
        </div>
    `;
    metaHTML += '</div>';
    
    let traitsHTML = '';
    if (horse.traits && horse.traits.length > 0) {
        traitsHTML = `
            <div class="traits-section">
                <h3 class="section-title">Special Traits</h3>
                <div class="traits-list">
                    ${horse.traits.map(trait => `<span class="trait-badge">${trait}</span>`).join('')}
                </div>
            </div>
        `;
    }
    
    let galleryHTML = '';
    if (horse.gallery && horse.gallery.length > 0) {
        galleryHTML = `
            <div class="gallery-section">
                <h3 class="section-title">Photo Gallery</h3>
                <div class="gallery-grid">
                    ${horse.gallery.map(item => `
                        <div class="gallery-item">
                            <img src="${item.image}" alt="${item.caption || horse.title}" class="gallery-image">
                            ${item.caption ? `<div class="gallery-caption">${item.caption}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    modalBodyEl.innerHTML = `
        <img src="${imageUrl}" alt="${horse.title}" class="modal-header-image" onerror="this.style.display='none'">
        <div class="modal-body">
            <h1 class="modal-title">${horse.title}</h1>
            ${horse.breed ? `<p class="modal-breed">${horse.breed}</p>` : ''}
            
            ${metaHTML}
            
            <div class="modal-story">
                ${horse.content}
            </div>
            
            ${traitsHTML}
            ${galleryHTML}
        </div>
    `;
    
    modalEl.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    modalEl.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners for modal
document.querySelector('.modal-close').addEventListener('click', closeModal);
document.querySelector('.modal-overlay').addEventListener('click', closeModal);

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl.classList.contains('active')) {
        closeModal();
    }
});

// Fetch and display horses
async function loadHorses() {
    try {
        // Fetch the list of files in the horses directory
        const response = await fetch(API_BASE);
        
        if (!response.ok) {
            throw new Error('Failed to fetch horses directory');
        }
        
        const files = await response.json();
        
        // Filter for markdown files
        const markdownFiles = files.filter(file => file.name.endsWith('.md'));
        
        if (markdownFiles.length === 0) {
            loadingEl.style.display = 'none';
            emptyStateEl.style.display = 'block';
            return;
        }
        
        // Fetch and parse each horse file
        const horses = await Promise.all(
            markdownFiles.map(async (file) => {
                const fileResponse = await fetch(`${RAW_BASE}/${file.name}`);
                const content = await fileResponse.text();
                const parsed = parseMarkdown(content);
                
                return {
                    ...parsed.frontmatter,
                    content: markdownToHTML(parsed.content),
                    filename: file.name
                };
            })
        );
        
        // Sort by name
        horses.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        
        // Display horses
        loadingEl.style.display = 'none';
        horses.forEach(horse => {
            horsesGridEl.appendChild(createHorseCard(horse));
        });
        
    } catch (error) {
        console.error('Error loading horses:', error);
        loadingEl.innerHTML = `
            <p style="color: #E65100;">Error loading horses. Please try again later.</p>
            <p style="font-size: 0.9rem; color: #8B6F47;">Make sure horses have been added in the CMS.</p>
        `;
    }
}

// Load horses when page loads
document.addEventListener('DOMContentLoaded', loadHorses);
