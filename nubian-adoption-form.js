/*
 * File: nubian-adoption-form.js
 * Created: 2025-03-23
 * Purpose: Form validation and submission logic for Mini Nubian adoption application
 */

// ===== CONFIGURATION =====
// UPDATE THIS URL AFTER DEPLOYING GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

// ===== DOM ELEMENTS =====
const form = document.getElementById('nubianAdoptionForm');
const submitBtn = document.getElementById('submitBtn');
const formMessage = document.getElementById('formMessage');

// ===== CONDITIONAL FIELD VISIBILITY =====

// Show landlord field if renting
document.getElementById('homeOwnership').addEventListener('change', function () {
    const landlordSection = document.getElementById('landlordSection');
    landlordSection.style.display = this.value === 'rent' ? 'block' : 'none';
});

// Show goat experience field if they've owned goats
document.getElementById('ownedGoatBefore').addEventListener('change', function () {
    const goatExperienceSection = document.getElementById('goatExperienceSection');
    goatExperienceSection.style.display = this.value === 'yes' ? 'block' : 'none';
});

// Show rehome details if they answered yes
document.getElementById('rehomedAnimal').addEventListener('change', function () {
    const rehomeDetailsSection = document.getElementById('rehomeDetailsSection');
    rehomeDetailsSection.style.display = this.value === 'yes' ? 'block' : 'none';
});

// ===== VALIDATION =====

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[\d\s\-\(\)\.+]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function validateForm() {
    const errors = [];

    const email = document.getElementById('email').value;
    if (!validateEmail(email)) errors.push('Please enter a valid email address');

    const phone = document.getElementById('phone').value;
    if (!validatePhone(phone)) errors.push('Please enter a valid phone number (at least 10 digits)');

    const homeOwnership = document.getElementById('homeOwnership').value;
    if (homeOwnership === 'rent') {
        const landlordPermission = document.getElementById('landlordPermission').value;
        if (!landlordPermission.trim()) errors.push('Landlord contact information is required for renters');
    }

    return errors;
}

// ===== FORM SUBMISSION =====

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    formMessage.style.display = 'none';
    formMessage.className = 'form-message';

    const errors = validateForm();
    if (errors.length > 0) {
        alert('Please fix the following:\n\n' + errors.join('\n'));
        return;
    }

    submitBtn.disabled = true;
    document.querySelector('.button-text').style.display = 'none';
    document.querySelector('.button-loading').style.display = 'inline-flex';

    try {
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
            } else {
                data[key] = value;
            }
        }

        data.submissionDate = new Date().toISOString();
        data.formType = 'Mini Nubian Adoption Application';

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        formMessage.textContent = '🐐 Thank you! Your application has been submitted. Paige will be in touch soon!';
        formMessage.classList.add('success');
        formMessage.style.display = 'block';
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        form.reset();

        // Hide all conditional sections after reset
        document.getElementById('landlordSection').style.display = 'none';
        document.getElementById('goatExperienceSection').style.display = 'none';
        document.getElementById('rehomeDetailsSection').style.display = 'none';

    } catch (error) {
        console.error('Submission error:', error);
        formMessage.textContent = 'Something went wrong. Please email your application directly to Paige.Grauch@gmail.com';
        formMessage.classList.add('error');
        formMessage.style.display = 'block';
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
        submitBtn.disabled = false;
        document.querySelector('.button-text').style.display = 'inline';
        document.querySelector('.button-loading').style.display = 'none';
    }
});

// ===== AUTO-SAVE =====

function saveProgress() {
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) { data[key] = value; }
    localStorage.setItem('nubianFormProgress', JSON.stringify(data));
}

function restoreProgress() {
    const saved = localStorage.getItem('nubianFormProgress');
    if (!saved) return;

    if (confirm('We found a saved application. Would you like to continue where you left off?')) {
        const data = JSON.parse(saved);
        for (let [key, value] of Object.entries(data)) {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) field.value = value;
        }
        // Trigger change events to show conditional fields
        ['homeOwnership', 'ownedGoatBefore', 'rehomedAnimal'].forEach(id => {
            document.getElementById(id).dispatchEvent(new Event('change'));
        });
    } else {
        localStorage.removeItem('nubianFormProgress');
    }
}

// Auto-save every 30 seconds and on input
setInterval(saveProgress, 30000);
form.addEventListener('input', function () {
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(saveProgress, 1000);
});

// Clear saved progress on successful submit
form.addEventListener('submit', function () {
    localStorage.removeItem('nubianFormProgress');
});

// Uncomment to enable restore on load:
// window.addEventListener('load', restoreProgress);

// ===== DEBUG =====
console.log('✅ Nubian Adoption Form JS Loaded');
if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
    console.warn('⚠️ Google Apps Script URL not configured in nubian-adoption-form.js');
}
