// Mobile Hamburger Menu for Wheat and Whisper Farm
// Handles menu toggle, animations, and interactions

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }
    
    function initMobileMenu() {
        console.log('🍔 Mobile menu initializing...');
        
        // Get elements
        const hamburger = document.getElementById('hamburger-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileOverlay = document.getElementById('mobile-overlay');
        const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
        const body = document.body;
        
        // Check if elements exist
        if (!hamburger || !mobileMenu || !mobileOverlay) {
            console.warn('⚠️ Mobile menu elements not found - menu will not work');
            return;
        }
        
        console.log('✅ Mobile menu elements found');
        
        // Toggle menu function
        function toggleMenu() {
            const isOpen = mobileMenu.classList.contains('active');
            
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        }
        
        // Open menu
        function openMenu() {
            console.log('📖 Opening menu');
            hamburger.classList.add('active');
            mobileMenu.classList.add('active');
            mobileOverlay.classList.add('active');
            body.classList.add('menu-open');
            
            // Set focus to first menu link for accessibility
            const firstLink = mobileMenu.querySelector('.mobile-menu-link');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 300);
            }
        }
        
        // Close menu
        function closeMenu() {
            console.log('📕 Closing menu');
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            mobileOverlay.classList.remove('active');
            body.classList.remove('menu-open');
            
            // Return focus to hamburger button
            setTimeout(() => hamburger.focus(), 300);
        }
        
        // Hamburger click
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            toggleMenu();
        });
        
        // Overlay click - close menu
        mobileOverlay.addEventListener('click', function(e) {
            e.preventDefault();
            closeMenu();
        });
        
        // Menu link clicks - close menu after clicking
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                console.log('🔗 Menu link clicked');
                // Small delay so user sees the click feedback
                setTimeout(closeMenu, 200);
            });
        });
        
        // ESC key closes menu
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                console.log('⌨️ ESC key pressed - closing menu');
                closeMenu();
            }
        });
        
        // Prevent menu from closing when clicking inside it
        mobileMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // Close menu on window resize if it gets too wide
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                // If screen gets wider than tablet breakpoint, close menu
                if (window.innerWidth > 968 && mobileMenu.classList.contains('active')) {
                    console.log('📐 Screen resized to desktop - closing menu');
                    closeMenu();
                }
            }, 250);
        });
        
        // Smooth scroll for anchor links in mobile menu
        mobileMenuLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        closeMenu();
                        setTimeout(() => {
                            target.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }, 300);
                    }
                });
            }
        });
        
        // Keyboard navigation within menu
        mobileMenu.addEventListener('keydown', function(e) {
            const focusableElements = mobileMenu.querySelectorAll(
                'a, button, [tabindex]:not([tabindex="-1"])'
            );
            const focusableArray = Array.from(focusableElements);
            const currentIndex = focusableArray.indexOf(document.activeElement);
            
            if (e.key === 'Tab') {
                // Trap focus within menu
                if (e.shiftKey) {
                    // Shift + Tab (backwards)
                    if (currentIndex === 0) {
                        e.preventDefault();
                        focusableArray[focusableArray.length - 1].focus();
                    }
                } else {
                    // Tab (forwards)
                    if (currentIndex === focusableArray.length - 1) {
                        e.preventDefault();
                        focusableArray[0].focus();
                    }
                }
            }
        });
        
        console.log('✅ Mobile menu ready!');
    }
    
})();
