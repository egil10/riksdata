// Chart Layout Updater - Updates all chart cards to new layout structure
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the main app to load and charts to be created
    setTimeout(updateAllChartCards, 1000);
});

// Also run when charts are dynamically added
window.addEventListener('charts-loaded', function() {
    updateAllChartCards();
});

function updateAllChartCards() {
    const chartCards = document.querySelectorAll('.chart-card');
    
    chartCards.forEach(card => {
        updateChartCardLayout(card);
    });
}

function updateChartCardLayout(card) {
    const header = card.querySelector('.chart-header');
    if (!header) return;
    
    const headerTop = header.querySelector('.chart-header-top');
    const subtitle = header.querySelector('.chart-subtitle');
    const sourceLink = headerTop.querySelector('.source-link');
    
    if (!headerTop || !subtitle) return;
    
    // Create new subtitle row
    const subtitleRow = document.createElement('div');
    subtitleRow.className = 'chart-subtitle-row';
    
    // Move subtitle to new row
    subtitleRow.appendChild(subtitle);
    
    // Create subtitle actions container for source link
    const subtitleActions = document.createElement('div');
    subtitleActions.className = 'subtitle-actions';
    
    // Move source link to subtitle row
    if (sourceLink) {
        subtitleActions.appendChild(sourceLink);
    }
    
    subtitleRow.appendChild(subtitleActions);
    
    // Update chart actions with new icons and order
    updateChartActions(headerTop);
    
    // Clear header and rebuild structure
    header.innerHTML = '';
    header.appendChild(headerTop);
    header.appendChild(subtitleRow);
}

function updateChartActions(headerTop) {
    const actionsContainer = headerTop.querySelector('.chart-actions');
    if (!actionsContainer) return;
    
    // Clear existing buttons
    actionsContainer.innerHTML = '';
    
    // Create new buttons in order: Copy, Download, Fullscreen
    const copyBtn = createActionButton('copy', 'Copy data', 'copy');
    const downloadBtn = createActionButton('download', 'Download chart', 'arrow-down-to-line');
    const fullscreenBtn = createActionButton('fullscreen', 'Fullscreen', 'maximize');
    
    actionsContainer.appendChild(copyBtn);
    actionsContainer.appendChild(downloadBtn);
    actionsContainer.appendChild(fullscreenBtn);
}

function createActionButton(action, title, iconName) {
    const button = document.createElement('button');
    button.className = 'icon-btn';
    button.setAttribute('data-action', action);
    button.setAttribute('aria-label', title);
    button.setAttribute('title', title);
    
    // Add Lucide icon based on action
    const iconSvg = getLucideIcon(iconName);
    button.innerHTML = iconSvg;
    
    return button;
}

function getLucideIcon(iconName) {
    const icons = {
        'copy': `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>`,
        'arrow-down-to-line': `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 17V3"/>
            <path d="m6 11 6 6 6-6"/>
            <path d="M19 21H5"/>
        </svg>`,
        'maximize': `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
            <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
            <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
            <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
        </svg>`
    };
    
    return icons[iconName] || icons['copy'];
}

// Export for use in other scripts
window.updateChartLayout = updateAllChartCards;
