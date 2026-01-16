/*
 * File: retrievers.js
 * Created: 2025-01-16
 * Created By: Claude (AI Assistant)
 * Purpose: Handles CMS content loading, announcement banner, and video toggles for Retrievers page
 * Previous Version: N/A (new file)
 */

// ===== LOAD CMS CONTENT =====

async function loadPageContent() {
    try {
        const response = await fetch('content/pages/retrievers.md');
        const text = await response.text();
        
        // Parse YAML frontmatter
        const frontmatterMatch = text.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) {
            console.error('No frontmatter found in retrievers.md');
            return;
        }
        
        const frontmatter = parseYAML(frontmatterMatch[1]);
        
        // Apply content to page
        applyContent(frontmatter);
        
        // Initialize video toggles
        initializeVideoToggles(frontmatter);
        
        // Show announcement banner if content exists
        showAnnouncementBanner(frontmatter);
        
    } catch (error) {
        console.error('Error loading page content:', error);
    }
}

// ===== PARSE YAML =====

function parseYAML(yamlText) {
    const lines = yamlText.split('\n');
    const data = {};
    let currentKey = null;
    let currentValue = '';
    let inMultiline = false;
    
    lines.forEach(line => {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('- ')) {
            // Array item (not used in this page, but keep for compatibility)
            return;
        }
        
        if (trimmed.includes(':') && !inMultiline) {
            if (currentKey) {
                data[currentKey] = currentValue.trim();
            }
            
            const colonIndex = trimmed.indexOf(':');
            currentKey = trimmed.substring(0, colonIndex).trim();
            let value = trimmed.substring(colonIndex + 1).trim();
            
            if (value.startsWith('|') || value.startsWith('>')) {
                inMultiline = true;
                currentValue = '';
            } else {
                currentValue = value.replace(/^["']|["']$/g, '');
                inMultiline = false;
            }
        } else if (inMultiline && trimmed) {
            currentValue += (currentValue ? '\n' : '') + trimmed;
        } else if (!trimmed && inMultiline) {
            data[currentKey] = currentValue.trim();
            currentKey = null;
            currentValue = '';
            inMultiline = false;
        }
    });
    
    if (currentKey) {
        data[currentKey] = currentValue.trim();
    }
    
    return data;
}

// ===== APPLY CONTENT TO PAGE =====

function applyContent(data) {
    // Hero section
    if (data.hero_title) {
        document.getElementById('heroTitle').textContent = data.hero_title;
    }
    if (data.hero_subtitle) {
        document.getElementById('heroSubtitle').textContent = data.hero_subtitle;
    }
    
    // Box 1
    if (data.box_1_title) document.getElementById('box1Title').textContent = data.box_1_title;
    if (data.box_1_subtitle) document.getElementById('box1Subtitle').textContent = data.box_1_subtitle;
    if (data.box_1_body) document.getElementById('box1Body').innerHTML = marked.parse || marked(data.box_1_body);
    if (data.box_1_contact) document.getElementById('box1Contact').innerHTML = marked.parse || marked(data.box_1_contact);
    if (data.box_1_image) document.getElementById('box1Image').src = data.box_1_image;
    
    // Box 2
    if (data.box_2_title) document.getElementById('box2Title').textContent = data.box_2_title;
    if (data.box_2_subtitle) document.getElementById('box2Subtitle').textContent = data.box_2_subtitle;
    if (data.box_2_body) document.getElementById('box2Body').innerHTML = marked.parse || marked(data.box_2_body);
    if (data.box_2_contact) document.getElementById('box2Contact').innerHTML = marked.parse || marked(data.box_2_contact);
    if (data.box_2_image) document.getElementById('box2Image').src = data.box_2_image;
    
    // Box 3
    if (data.box_3_title) document.getElementById('box3Title').textContent = data.box_3_title;
    if (data.box_3_subtitle) document.getElementById('box3Subtitle').textContent = data.box_3_subtitle;
    if (data.box_3_body) document.getElementById('box3Body').innerHTML = marked.parse || marked(data.box_3_body);
    if (data.box_3_contact) document.getElementById('box3Contact').innerHTML = marked.parse || marked(data.box_3_contact);
    if (data.box_3_image) document.getElementById('box3Image').src = data.box_3_image;
    
    // Box 4
    if (data.box_4_title) document.getElementById('box4Title').textContent = data.box_4_title;
    if (data.box_4_subtitle) document.getElementById('box4Subtitle').textContent = data.box_4_subtitle;
    if (data.box_4_body) document.getElementById('box4Body').innerHTML = marked.parse || marked(data.box_4_body);
    if (data.box_4_contact) document.getElementById('box4Contact').innerHTML = marked.parse || marked(data.box_4_contact);
    if (data.box_4_image) document.getElementById('box4Image').src = data.box_4_image;
    
    // CTA section
    if (data.cta_title) document.getElementById('ctaTitle').textContent = data.cta_title;
    if (data.cta_text) document.getElementById('ctaText').textContent = data.cta_text;
    if (data.cta_button_text) document.getElementById('ctaButton').textContent = data.cta_button_text;
}

// ===== SHOW ANNOUNCEMENT BANNER (NEW!) =====

function showAnnouncementBanner(data) {
    const banner = document.getElementById('announcementBanner');
    const textContainer = document.getElementById('announcementText');
    
    if (data.announcement_text && data.announcement_text.trim()) {
        // Convert line breaks to <p> tags
        const lines = data.announcement_text.trim().split('\n');
        const html = lines.map(line => `<p>${line}</p>`).join('');
        
        textContainer.innerHTML = html;
        banner.style.display = 'block';
    } else {
        banner.style.display = 'none';
    }
}

// ===== INITIALIZE VIDEO TOGGLES (NEW!) =====

function initializeVideoToggles(data) {
    // Box 1
    if (data.box_1_video_url) {
        setupVideoToggle(1, data.box_1_video_url);
    }
    
    // Box 2
    if (data.box_2_video_url) {
        setupVideoToggle(2, data.box_2_video_url);
    }
    
    // Box 3
    if (data.box_3_video_url) {
        setupVideoToggle(3, data.box_3_video_url);
    }
    
    // Box 4
    if (data.box_4_video_url) {
        setupVideoToggle(4, data.box_4_video_url);
    }
}

// ===== SETUP VIDEO TOGGLE FOR A BOX =====

function setupVideoToggle(boxNumber, videoUrl) {
    const toggleContainer = document.getElementById(`box${boxNumber}Toggle`);
    const imageElement = document.getElementById(`box${boxNumber}Image`);
    const videoContainer = document.getElementById(`box${boxNumber}VideoContainer`);
    const videoIframe = document.getElementById(`box${boxNumber}Video`);
    
    // Extract YouTube video ID
    const videoId = extractYouTubeId(videoUrl);
    
    if (!videoId) {
        console.error(`Invalid YouTube URL for box ${boxNumber}:`, videoUrl);
        return;
    }
    
    // Show toggle buttons
    toggleContainer.style.display = 'flex';
    
    // Set up iframe src (but don't load yet)
    const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`;
    
    // Get toggle buttons
    const buttons = toggleContainer.querySelectorAll('.toggle-btn');
    const photoBtn = buttons[0];
    const videoBtn = buttons[1];
    
    // Photo button click
    photoBtn.addEventListener('click', () => {
        photoBtn.classList.add('active');
        videoBtn.classList.remove('active');
        
        imageElement.style.display = 'block';
        videoContainer.style.display = 'none';
        
        // Pause video if playing
        videoIframe.src = '';
    });
    
    // Video button click
    videoBtn.addEventListener('click', () => {
        videoBtn.classList.add('active');
        photoBtn.classList.remove('active');
        
        imageElement.style.display = 'none';
        videoContainer.style.display = 'block';
        
        // Load video
        videoIframe.src = embedUrl;
    });
}

// ===== EXTRACT YOUTUBE VIDEO ID =====

function extractYouTubeId(url) {
    if (!url) return null;
    
    // Regular YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
    let match = url.match(/[?&]v=([^&]+)/);
    if (match) return match[1];
    
    // Short YouTube URL: https://youtu.be/VIDEO_ID
    match = url.match(/youtu\.be\/([^?&]+)/);
    if (match) return match[1];
    
    // Embed URL: https://www.youtube.com/embed/VIDEO_ID
    match = url.match(/embed\/([^?&]+)/);
    if (match) return match[1];
    
    // If it's just the video ID
    if (url.length === 11 && !url.includes('/')) {
        return url;
    }
    
    return null;
}

// ===== MARKED.JS FALLBACK =====

// Simple markdown parser if marked.js isn't available
if (typeof marked === 'undefined') {
    window.marked = function(text) {
        if (!text) return '';
        
        // Convert markdown to HTML
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n- /g, '\n• ')
            .replace(/\n/g, '<br>');
    };
}

// ===== INITIALIZE ON PAGE LOAD =====

document.addEventListener('DOMContentLoaded', () => {
    loadPageContent();
    console.log('✅ Retrievers page loaded with video toggles and announcement banner');
});

// END OF SCRIPT
