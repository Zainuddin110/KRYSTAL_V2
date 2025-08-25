// Mobile Menu Toggle
const burgerMenu = document.getElementById('burgerMenu');
const navMenu = document.getElementById('navMenu');

burgerMenu.addEventListener('click', () => {
    burgerMenu.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navMenu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        burgerMenu.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe all product items
document.querySelectorAll('.product-item').forEach(item => {
    observer.observe(item);
});

// Header background on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(10, 22, 40, 0.98)';
    } else {
        header.style.background = 'rgba(10, 22, 40, 0.95)';
    }
});

// CTA Button scroll to products
document.querySelector('.cta-button').addEventListener('click', () => {
    document.querySelector('#video-section').scrollIntoView({
        behavior: 'smooth'
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const video = document.querySelector('.hero-section video');
    if (video) {
        video.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Simple Video Auto-play on Scroll
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('youtubeVideo');
    const videoSection = document.getElementById('video-section');
    
    if (!video || !videoSection) return;

    // Intersection Observer for auto-play
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !video.src) {
                // Load and start video when section comes into view
                video.src = video.dataset.src;
                video.classList.add('loaded');
            }
        });
    }, {
        threshold: 0.2, // Trigger when 50% of the section is visible
        rootMargin: '0px 0px -100px 0px'
    });

    videoObserver.observe(videoSection);
});

// Scroll Animation for Products Showcase
document.addEventListener('DOMContentLoaded', function() {
    const showcaseItems = document.querySelectorAll('.showcase-item');
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe all showcase items
    showcaseItems.forEach(item => {
        observer.observe(item);
    });
    
    // Add staggered animation delay
    showcaseItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.2}s`;
    });
});
