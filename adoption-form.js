/*
 * File: adoption-form.js
 * Created: 2025-01-16
 * Created By: Claude (AI Assistant)
 * Purpose: Form validation and submission logic for Golden Retriever adoption application
 * Previous Version: N/A (new file)
 */

// ===== CONFIGURATION =====
// UPDATE THIS URL AFTER DEPLOYING GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

// ===== DOM ELEMENTS =====
const form = document.getElementById('adoptionForm');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

// ===== CONDITIONAL FIELD VISIBILITY =====

// Show/hide landlord field based on home ownership
document.querySelectorAll('input[name="homeOwnership"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const landlordField = document.getElementById('landlordField');
        if (this.value === 'rent') {
            landlordField.style.display = 'block';
        } else {
            landlordField.style.display = 'none';
        }
    });
});

// Show/hide children ages field
document.getElementById('children').addEventListener('input', function() {
    const childrenAgesField = document.getElementById('childrenAgesField');
    if (parseInt(this.value) > 0) {
        childrenAgesField.style.display = 'block';
    } else {
        childrenAgesField.style.display = 'none';
    }
});

// Show/hide previous dogs field
document.querySelectorAll('input[name="previousDogOwner"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const previousDogsField = document.getElementById('previousDogsField');
        if (this.value === 'yes') {
            previousDogsField.style.display = 'block';
        } else {
            previousDogsField.style.display = 'none';
        }
    });
});

// Show/hide current pets detail field
document.querySelectorAll('input[name="currentPets"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const currentPetsField = document.getElementById('currentPetsField');
        if (this.value === 'yes') {
            currentPetsField.style.display = 'block';
        } else {
            currentPetsField.style.display = 'none';
        }
    });
});

// ===== FORM VALIDATION =====

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    // Accepts various phone formats
    const re = /^[\d\s\-\(\)\.+]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function validateForm() {
    const errors = [];
    
    // Email validation
    const email = document.getElementById('email').value;
    if (!validateEmail(email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Phone validation
    const phone = document.getElementById('phone').value;
    if (!validatePhone(phone)) {
        errors.push('Please enter a valid phone number (at least 10 digits)');
    }
    
    // Vet phone validation
    const vetPhone = document.getElementById('vetPhone').value;
    if (vetPhone && !validatePhone(vetPhone)) {
        errors.push('Please enter a valid veterinarian phone number');
    }
    
    // Check if all required agreements are checked
    const requiredAgreements = [
        'agreement1', 'agreement2', 'agreement3', 
        'agreement4', 'agreement5', 'agreement6', 'agreement7'
    ];
    
    requiredAgreements.forEach(agreementName => {
        const checkbox = document.querySelector(`input[name="${agreementName}"]`);
        if (!checkbox.checked) {
            errors.push('Please check all required agreements at the bottom of the form');
            return false; // Exit loop on first unchecked
        }
    });
    
    // Landlord approval check
    const homeOwnership = document.querySelector('input[name="homeOwnership"]:checked');
    if (homeOwnership && homeOwnership.value === 'rent') {
        const landlordContact = document.getElementById('landlordContact').value;
        if (!landlordContact.trim()) {
            errors.push('Landlord contact information is required for renters');
        }
    }
    
    return errors;
}

// ===== FORM SUBMISSION =====

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Hide previous messages
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    
    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
        alert('Please fix the following errors:\n\n' + errors.join('\n'));
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    try {
        // Collect form data
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            // Handle checkboxes that might have multiple values
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Add submission timestamp
        data.submissionDate = new Date().toISOString();
        
        // Send to Google Apps Script
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Show success message
        successMessage.style.display = 'block';
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Reset form
        form.reset();
        
        // Optional: Send confirmation email to applicant
        sendConfirmationEmail(data.email, data.firstName);
        
    } catch (error) {
        console.error('Submission error:', error);
        
        // Show error message
        errorMessage.style.display = 'block';
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

// ===== CONFIRMATION EMAIL (Optional) =====

function sendConfirmationEmail(email, firstName) {
    // This is a placeholder - you can integrate with email service
    // For now, we'll just log it
    console.log(`Confirmation email would be sent to: ${email}`);
    console.log(`Dear ${firstName}, thank you for your application!`);
}

// ===== AUTO-SAVE (Optional) =====

// Save form progress to localStorage
function saveFormProgress() {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    localStorage.setItem('adoptionFormProgress', JSON.stringify(data));
    console.log('Form progress saved');
}

// Restore form progress from localStorage
function restoreFormProgress() {
    const savedData = localStorage.getItem('adoptionFormProgress');
    
    if (savedData) {
        const data = JSON.parse(savedData);
        
        for (let [key, value] of Object.entries(data)) {
            const field = form.querySelector(`[name="${key}"]`);
            
            if (field) {
                if (field.type === 'radio' || field.type === 'checkbox') {
                    const option = form.querySelector(`[name="${key}"][value="${value}"]`);
                    if (option) {
                        option.checked = true;
                    }
                } else {
                    field.value = value;
                }
            }
        }
        
        console.log('Form progress restored');
        
        // Ask if they want to continue
        if (confirm('We found a saved application. Would you like to continue where you left off?')) {
            // Trigger change events to show/hide conditional fields
            document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
                radio.dispatchEvent(new Event('change'));
            });
        } else {
            localStorage.removeItem('adoptionFormProgress');
        }
    }
}

// Auto-save every 30 seconds
setInterval(saveFormProgress, 30000);

// Save on form input
form.addEventListener('input', function() {
    // Debounce the save
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(saveFormProgress, 1000);
});

// Restore progress on page load
window.addEventListener('load', function() {
    // Uncomment to enable auto-save/restore
    // restoreFormProgress();
});

// Clear saved progress on successful submission
form.addEventListener('submit', function() {
    localStorage.removeItem('adoptionFormProgress');
});

// ===== SMOOTH SCROLLING TO ERRORS =====

function scrollToFirstError() {
    const firstError = document.querySelector('.error');
    if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ===== ANALYTICS (Optional) =====

function trackFormProgress(section) {
    console.log(`User reached section: ${section}`);
    // You can integrate with Google Analytics here
}

// Track when user scrolls to each section
const sections = document.querySelectorAll('.form-group-section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionTitle = entry.target.querySelector('.section-title');
            if (sectionTitle) {
                trackFormProgress(sectionTitle.textContent);
            }
        }
    });
}, { threshold: 0.5 });

sections.forEach(section => observer.observe(section));

// ===== DEBUGGING =====

console.log('✅ Adoption Form JavaScript Loaded');
console.log('📝 Form ID:', form ? 'Found' : 'NOT FOUND');
console.log('🔗 Google Script URL:', GOOGLE_SCRIPT_URL);

if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
    console.warn('⚠️ WARNING: Google Apps Script URL not configured!');
    console.warn('Update GOOGLE_SCRIPT_URL in adoption-form.js after deploying your script');
}

// END OF SCRIPT
