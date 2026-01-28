/**
 * File: puppy-gallery.js
 * Created: 2025-01-27
 * Created By: Claude (AI Assistant)
 * Purpose: Load and display puppy photos from Netlify CMS gallery collection
 */

// Global variables
let allPhotos = [];
let currentPhotoIndex = 0;

/**
 * Initialize gallery when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🐕 Puppy Gallery: Initializing...');
    loadGalleryData();
    setupLightbox();
});

/**
 * Load gallery data from CMS
 */
async function loadGalleryData() {
    try {
        console.log('📸 Loading gallery data from CMS...');
        
        // Fetch the gallery markdown file from content/gallery/
        const response = await fetch('content/gallery/gallery.md');
        
        if (!response.ok) {
            console.error('❌ Failed to load gallery data:', response.status);
            showErrorMessage('Unable to load puppy photos. Please try again later.');
            return;
        }
        
        const markdown = await response.text();
        console.log('✅ Gallery data loaded');
        
        // Parse the front matter
        const data = parseFrontMatter(markdown);
        
        if (data && data.litters && data.litters.length > 0) {
            console.log(`✅ Found ${data.litters.length} litter(s)`);
            displayGallery(data.litters);
            populateFilterOptions(data.litters);
        } else {
            console.warn('⚠️ No litters found in gallery data');
            showEmptyMessage();
        }
        
    } catch (error) {
        console.error('❌ Error loading gallery:', error);
        showErrorMessage('Unable to load puppy photos. Please try again later.');
    }
}

/**
 * Parse YAML front matter from markdown
 */
function parseFrontMatter(markdown) {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---/;
    const match = markdown.match(frontMatterRegex);
    
    if (!match) {
        console.error('❌ No front matter found');
        return null;
    }
    
    const yamlContent = match[1];
    
    try {
        // Simple YAML parser for the gallery structure
        const data = { litters: [] };
        const lines = yamlContent.split('\n');
        let currentLitter = null;
        let currentPhoto = null;
        let indent = 0;
        
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            // Count leading spaces
            const leadingSpaces = line.search(/\S/);
            
            // Litter entry
            if (trimmed.startsWith('- name:')) {
                currentLitter = {
                    name: trimmed.substring(7).trim(),
                    date: '',
                    photos: []
                };
                data.litters.push(currentLitter);
                currentPhoto = null;
            }
            // Date entry
            else if (trimmed.startsWith('date:') && currentLitter) {
                currentLitter.date = trimmed.substring(5).trim();
            }
            // Photo entry
            else if (trimmed.startsWith('- image:') && currentLitter) {
                currentPhoto = {
                    image: trimmed.substring(8).trim(),
                    caption: ''
                };
                currentLitter.photos.push(currentPhoto);
            }
            // Caption entry
            else if (trimmed.startsWith('caption:') && currentPhoto) {
                currentPhoto.caption = trimmed.substring(8).trim();
            }
        }
        
        console.log('📊 Parsed data:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error parsing YAML:', error);
        return null;
    }
}

/**
 * Display gallery photos
 */
function displayGallery(litters) {
    const galleryGrid = document.getElementById('galleryGrid');
    galleryGrid.innerHTML = ''; // Clear loading message
    
    allPhotos = []; // Reset global photos array
    let photoIndex = 0;
    
    litters.forEach((litter, litterIndex) => {
        // Create litter section
        const litterSection = document.createElement('div');
        litterSection.className = 'litter-section';
        litterSection.setAttribute('data-litter', litter.name);
        
        // Litter header
        const litterHeader = document.createElement('div');
        litterHeader.className = 'litter-header-inline';
        litterHeader.innerHTML = `
            <h2 class="litter-title">${litter.name}</h2>
            <p class="litter-date">${litter.date}</p>
        `;
        litterSection.appendChild(litterHeader);
        
        // Photos grid for this litter
        const photosGrid = document.createElement('div');
        photosGrid.className = 'photos-grid';
        
        if (litter.photos && litter.photos.length > 0) {
            litter.photos.forEach((photo, photoIdx) => {
                // Add to global photos array
                allPhotos.push({
                    image: photo.image,
                    caption: photo.caption,
                    litterName: litter.name,
                    litterDate: litter.date
                });
                
                // Create photo card
                const photoCard = document.createElement('div');
                photoCard.className = 'photo-card';
                photoCard.setAttribute('data-photo-index', photoIndex);
                photoCard.onclick = () => openLightbox(photoIndex);
                
                photoCard.innerHTML = `
                    <img src="${photo.image}" alt="${photo.caption}" class="gallery-photo">
                    <div class="photo-caption">${photo.caption}</div>
                `;
                
                photosGrid.appendChild(photoCard);
                photoIndex++;
            });
        } else {
            photosGrid.innerHTML = '<p class="no-photos">No photos yet for this litter.</p>';
        }
        
        litterSection.appendChild(photosGrid);
        galleryGrid.appendChild(litterSection);
    });
    
    console.log(`✅ Displayed ${photoIndex} photo(s) from ${litters.length} litter(s)`);
}

/**
 * Populate filter dropdown options
 */
function populateFilterOptions(litters) {
    const filterSelect = document.getElementById('litterFilter');
    
    // Clear existing options except "All Litters"
    filterSelect.innerHTML = '<option value="all">All Litters</option>';
    
    litters.forEach(litter => {
        const option = document.createElement('option');
        option.value = litter.name;
        option.textContent = `${litter.name} - ${litter.date}`;
        filterSelect.appendChild(option);
    });
    
    // Add event listener for filter changes
    filterSelect.addEventListener('change', filterGallery);
}

/**
 * Filter gallery by litter
 */
function filterGallery() {
    const filterValue = document.getElementById('litterFilter').value;
    const litterSections = document.querySelectorAll('.litter-section');
    
    litterSections.forEach(section => {
        if (filterValue === 'all' || section.getAttribute('data-litter') === filterValue) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

/**
 * Setup lightbox functionality
 */
function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    
    // Close lightbox
    lightboxClose.onclick = closeLightbox;
    lightboxOverlay.onclick = closeLightbox;
    
    // Previous/Next navigation
    lightboxPrev.onclick = () => navigateLightbox(-1);
    lightboxNext.onclick = () => navigateLightbox(1);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        }
    });
}

/**
 * Open lightbox with photo
 */
function openLightbox(photoIndex) {
    currentPhotoIndex = photoIndex;
    const photo = allPhotos[photoIndex];
    
    if (!photo) return;
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxLitter = document.getElementById('lightboxLitter');
    
    lightboxImage.src = photo.image;
    lightboxImage.alt = photo.caption;
    lightboxCaption.textContent = photo.caption;
    lightboxLitter.textContent = `${photo.litterName} - ${photo.litterDate}`;
    
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

/**
 * Close lightbox
 */
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

/**
 * Navigate lightbox (previous/next)
 */
function navigateLightbox(direction) {
    currentPhotoIndex += direction;
    
    // Wrap around
    if (currentPhotoIndex < 0) {
        currentPhotoIndex = allPhotos.length - 1;
    } else if (currentPhotoIndex >= allPhotos.length) {
        currentPhotoIndex = 0;
    }
    
    openLightbox(currentPhotoIndex);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    const galleryGrid = document.getElementById('galleryGrid');
    galleryGrid.innerHTML = `
        <div class="error-message">
            <p>😔 ${message}</p>
        </div>
    `;
}

/**
 * Show empty gallery message
 */
function showEmptyMessage() {
    const galleryGrid = document.getElementById('galleryGrid');
    galleryGrid.innerHTML = `
        <div class="empty-message">
            <p>🐕 No puppy photos yet! Check back soon for adorable golden baby pictures.</p>
        </div>
    `;
}

console.log('✅ Puppy Gallery JS loaded');
