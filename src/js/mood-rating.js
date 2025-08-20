// Mood Rating System
document.addEventListener('DOMContentLoaded', function() {
    initializeMoodRating();
});

function initializeMoodRating() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    
    moodButtons.forEach(button => {
        button.addEventListener('click', handleMoodClick);
    });
    
    // Initialize Lucide icons for mood buttons
    if (window.lucide) {
        lucide.createIcons({ attrs: { width: 20, height: 20 } });
    }
}

function handleMoodClick(event) {
    const button = event.currentTarget;
    const mood = button.getAttribute('data-mood');
    
    // Store original icon if not already stored
    if (!button.dataset.originalIcon) {
        button.dataset.originalIcon = button.innerHTML;
    }
    
    // Define mood icon mappings
    const moodIcons = {
        happy: {
            default: 'smile',
            active: 'laugh'
        },
        neutral: {
            default: 'meh',
            active: 'annoyed'
        },
        sad: {
            default: 'frown',
            active: 'angry'
        }
    };
    
    const currentMood = moodIcons[mood];
    if (!currentMood) return;
    
    // Change to active icon
    const activeIcon = document.createElement('i');
    activeIcon.setAttribute('data-lucide', currentMood.active);
    activeIcon.setAttribute('aria-hidden', 'true');
    button.innerHTML = '';
    button.appendChild(activeIcon);
    
    // Re-render Lucide icon
    if (window.lucide) {
        lucide.createIcons({ attrs: { width: 20, height: 20 } });
    }
    
    // Add success feedback class for color change
    button.classList.add('success-feedback');
    
    // Log the mood rating (for fun analytics)
    console.log(`Mood rating: ${mood}`);
    
    // Restore original icon after 1.5 seconds
    setTimeout(() => {
        button.innerHTML = button.dataset.originalIcon;
        button.classList.remove('success-feedback');
        
        // Re-render Lucide icon
        if (window.lucide) {
            lucide.createIcons({ attrs: { width: 20, height: 20 } });
        }
    }, 1500);
}

// Export for potential use in other scripts
window.initializeMoodRating = initializeMoodRating;
