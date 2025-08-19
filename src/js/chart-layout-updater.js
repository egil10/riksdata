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
    
    // Render the Lucide icons for the new buttons
    if (window.lucide) {
        lucide.createIcons({ attrs: { width: 18, height: 18 } });
    }
}

function createActionButton(action, title, iconName) {
    const button = document.createElement('button');
    button.className = 'icon-btn';
    button.setAttribute('data-action', action);
    button.setAttribute('aria-label', title);
    button.setAttribute('title', title);
    
    // Add Lucide icon using data-lucide attribute
    const iconElement = document.createElement('i');
    iconElement.setAttribute('data-lucide', iconName);
    iconElement.setAttribute('aria-hidden', 'true');
    button.appendChild(iconElement);
    
    return button;
}

// Export for use in other scripts
window.updateChartLayout = updateAllChartCards;
