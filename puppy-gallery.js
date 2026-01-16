/*
 * File: puppy-gallery.js
 * Created: 2025-01-16
 * Created By: Claude (AI Assistant)
 * Purpose: Handles gallery loading, filtering, and lightbox for puppy photos
 * Previous Version: N/A (new file)
 */

// ===== GLOBAL STATE =====

let allPhotos = [];
let currentLitterFilter = 'all';
let currentLightboxIndex = 0;

// ===== LOAD GALLERY CONTENT =====

async function loadGallery() {
    try {
        const response = await fetch('content/gallery/puppies.md');
        const text = await response.text();
        
        // Parse YAML frontmatter with photo array
        const frontmatterMatch = text.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) {
            console.error('No frontmatter found in puppies.md');
            showNoResults();
            return;
        }
        
        const data = parseGalleryYAML(frontmatterMatch[1]);
        
        if (!data.litters || data.litters.length === 0) {
            showNoResults();
            return;
        }
        
        // Flatten photos from all litters
        allPhotos = [];
        data.litters.forEach(litter => {
            if (litter.photos) {
                litter.photos.forEach(photo => {
                    allPhotos.push({
                        image: photo.image,
                        caption: photo.caption || '',
                        litter: litter.name || 'Unknown Litter',
                        date: litter.date || ''
                    });
                });
            }
        });
        
        // Populate litter filter dropdown
        populateFilters(data.litters);
        
        // Display all photos
        displayPhotos(allPhotos);
        
    } catch (error) {
        console.error('Error loading gallery:', error);
        showNoResults('Error loading gallery. Please try again later.');
    }
}

// ===== PARSE GALLERY YAML =====

function parseGalleryYAML(yamlText) {
    const data = { litters: [] };
    let currentLitter = null;
    let currentPhoto = null;
    const lines = yamlText.split('\n');
    
    lines.forEach(line => {
        const trimmed = line.trim();
        const indent = line.search(/\S/);
        
        // Litter entry
        if (trimmed.startsWith('- name:')) {
            if (currentLitter) {
                data.litters.push(currentLitter);
            }
            currentLitter = {
                name: trimmed.substring(7).trim().replace(/^["']|["']$/g, ''),
                photos: []
            };
        }
        // Litter date
        else if (trimmed.startsWith('date:') && currentLitter) {
            currentLitter.date = trimmed.substring(5).trim().replace(/^["']|["']$/g, '');
        }
        // Photos array start
        else if (trimmed.startsWith('photos:')) {
            // Starting photos array
        }
        // Photo entry
        else if (trimmed.startsWith('- image:')) {
            if (currentPhoto && currentLitter) {
                currentLitter.photos.push(currentPhoto);
            }
            currentPhoto = {
                image: trimmed.substring(8).trim().replace(/^["']|["']$/g, ''),
                caption: ''
            };
        }
        // Photo caption
        else if (trimmed.startsWith('caption:') && currentPhoto) {
            currentPhoto.caption = trimmed.substring(8).trim().replace(/^["']|["']$/g, '');
        }
    });
    
    // Push last photo and litter
    if (currentPhoto && currentLitter) {
        currentLitter.photos.push(currentPhoto);
    }
    if (currentLitter) {
        data.litters.push(currentLitter);
    }
    
    return data;
}

// ===== POPULATE FILTER DROPDOWN =====

function populateFilters(litters) {
    const filterSelect = document.getElementById('litterFilter');
    
    // Clear existing options except "All Litters"
    filterSelect.innerHTML = '<option value="all">All Litters</option>';
    
    // Add option for each litter
    litters.forEach(litter => {
        const option = document.createElement('option');
        option.value = litter.name;
        option.textContent = litter.name;
        filterSelect.appendChild(option);
    });
    
    // Add change event listener
    filterSelect.addEventListener('change', (e) => {
        currentLitterFilter = e.target.value;
        filterPhotos();
    });
}

// ===== FILTER PHOTOS =====

function filterPhotos() {
    if (currentLitterFilter === 'all') {
        displayPhotos(allPhotos);
    } else {
        const filtered = allPhotos.filter(photo => photo.litter === currentLitterFilter);
        displayPhotos(filtered);
    }
}

// ===== DISPLAY PHOTOS =====

function displayPhotos(photos) {
    const grid = document.getElementById('galleryGrid');
    
    if (photos.length === 0) {
        showNoResults('No photos found for this litter.');
        return;
    }
    
    grid.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.index = index;
        item.dataset.litter = photo.litter;
        
        item.innerHTML = `
            <img src="${photo.image}" alt="${photo.caption}" class="gallery-item-image">
            <div class="gallery-item-caption">
                <h3 class="gallery-item-title">${photo.caption || 'Adorable Puppy'}</h3>
                <p class="gallery-item-litter">${photo.litter}</p>
            </div>
        `;
        
        // Click to open lightbox
        item.addEventListener('click', () => {
            openLightbox(index, photos);
        });
        
        grid.appendChild(item);
    });
}

// ===== SHOW NO RESULTS =====

function showNoResults(message = 'No photos available yet. Check back soon!') {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = `<div class="no-results">${message}</div>`;
}

// ===== LIGHTBOX FUNCTIONS =====

function openLightbox(index, photos) {
    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightboxImage');
    const caption = document.getElementById('lightboxCaption');
    const litter = document.getElementById('lightboxLitter');
    
    currentLightboxIndex = index;
    
    const photo = photos[currentLightboxIndex];
    image.src = photo.image;
    image.alt = photo.caption;
    caption.textContent = photo.caption || 'Adorable Puppy';
    litter.textContent = photo.litter;
    
    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Store photos array for navigation
    lightbox.dataset.totalPhotos = photos.length;
    window.currentGalleryPhotos = photos; // Store for navigation
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function navigateLightbox(direction) {
    const photos = window.currentGalleryPhotos;
    if (!photos) return;
    
    currentLightboxIndex += direction;
    
    // Wrap around
    if (currentLightboxIndex < 0) {
        currentLightboxIndex = photos.length - 1;
    } else if (currentLightboxIndex >= photos.length) {
        currentLightboxIndex = 0;
    }
    
    const photo = photos[currentLightboxIndex];
    const image = document.getElementById('lightboxImage');
    const caption = document.getElementById('lightboxCaption');
    const litter = document.getElementById('lightboxLitter');
    
    // Fade out
    image.style.opacity = '0';
    
    setTimeout(() => {
        image.src = photo.image;
        image.alt = photo.caption;
        caption.textContent = photo.caption || 'Adorable Puppy';
        litter.textContent = photo.litter;
        
        // Fade in
        image.style.opacity = '1';
    }, 150);
}

// ===== EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', () => {
    // Load gallery
    loadGallery();
    
    // Lightbox controls
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext.addEventListener('click', () => navigateLightbox(1));
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox');
        if (lightbox.style.display !== 'block') return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox(-1);
        } else if (e.key === 'ArrowRight') {
            navigateLightbox(1);
        }
    });
    
    console.log('✅ Puppy gallery loaded with lightbox functionality');
});

// END OF SCRIPT
