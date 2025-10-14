# Chart Download System Documentation

## Overview

The Riksdata website features a comprehensive chart download system that allows users to export charts in multiple formats: PNG, HTML, and SVG. This system was designed to provide high-quality, interactive, and standalone chart exports.

## Technical Implementation

### Core Architecture

The download system is built around several key components:

1. **Download Format Picker**: A dropdown menu that appears when users click the download button
2. **Format-Specific Export Functions**: Separate functions for each export format
3. **Chart Data Serialization**: Converts Chart.js instances to serializable formats
4. **Enhanced Rendering**: Uses html2canvas for high-quality image exports

### Key Files

- **`src/js/utils.js`**: Contains all download functionality
- **`src/js/main.js`**: Handles download button events and format picker
- **`src/css/main.css`**: Styles the download format picker

## Download Formats

### 1. PNG Export (`downloadAsPNG`)

**Features:**
- High-resolution export (3x scale)
- White background (non-transparent)
- Includes chart title and subtitle
- Optimized for sharing and presentations

**Technical Details:**
```javascript
const canvas = await html2canvas(tempContainer, {
    scale: 3, // Ultra high resolution
    backgroundColor: '#ffffff', // White background
    useCORS: true,
    allowTaint: true,
    // ... additional options
});
```

**Enhancements Made:**
- Fixed transparent background issue
- Ensured title and subtitle are visible
- Increased resolution for better quality

### 2. HTML Export (`downloadAsHTML`)

**Features:**
- Standalone interactive chart
- Preserves political colors
- Better date formatting (YYYY-MM instead of full ISO)
- Self-contained HTML file with embedded Chart.js

**Technical Details:**
```javascript
// Preserves political colors and formatting
const chartDatasets = datasets.map(dataset => ({
    // ... standard properties
    segment: dataset.segment, // Political color segments
    pointBackgroundColor: dataset.pointBackgroundColor,
    pointBorderColor: dataset.pointBorderColor
}));

// Enhanced date formatting
ticks: {
    callback: function(value, index, ticks) {
        const label = this.getLabelForValue(value);
        if (label && typeof label === 'string') {
            const date = new Date(label);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                return `${year}-${month}`;
            }
        }
        return label;
    }
}
```

**HTML Structure:**
- Embedded Chart.js library
- Responsive container
- Clean, modern styling
- Metadata footer with generation date and source

### 3. SVG Export (`downloadAsSVG`)

**Features:**
- Vector-based graphics
- Scalable without quality loss
- Custom SVG generation from chart data
- Lightweight file size

**Technical Details:**
- Creates SVG elements programmatically
- Calculates scales and positioning
- Renders data points and lines as SVG paths
- Includes grid lines and axis labels

## User Interface

### Download Format Picker

The download system uses a sophisticated dropdown picker that appears when users click the download button:

```css
.download-format-picker {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    z-index: 9999;
    min-width: 150px;
    animation: fadeInDown 0.2s ease-out;
}
```

**Features:**
- Smooth animations
- High z-index to ensure visibility
- Proper positioning relative to download button
- Hover effects and visual feedback

### Event Handling

The system prevents event propagation to avoid conflicts:

```javascript
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.icon-btn');
    if (action === 'download') {
        e.stopPropagation(); // Prevent closing the picker
        showDownloadFormatPicker(btn, card);
    }
});
```

## Chart Data Serialization

### Challenges and Solutions

**Problem**: Chart.js instances contain non-serializable functions and callbacks.

**Solution**: Extract only essential, serializable data:

```javascript
const chartDatasets = datasets.map(dataset => ({
    label: dataset.label,
    data: dataset.data,
    borderColor: dataset.borderColor,
    backgroundColor: dataset.backgroundColor,
    borderWidth: dataset.borderWidth || 2,
    fill: dataset.fill || false,
    tension: dataset.tension || 0.1,
    // Preserve political colors
    segment: dataset.segment,
    pointBackgroundColor: dataset.pointBackgroundColor,
    pointBorderColor: dataset.pointBorderColor
}));
```

### Political Colors Preservation

The system preserves Norwegian political period colors in HTML exports:

- **AP (Arbeiderpartiet)**: Red (#E11926)
- **H (Høyre)**: Light Blue (#87add7)
- **SP (Senterpartiet)**: Green (#4CAF50)
- **V (Venstre)**: Teal (#006666)
- **KRF (Kristelig Folkeparti)**: Yellow (#FDED34)
- **SV (Sosialistisk Venstreparti)**: Pink (#B5317C)
- **FRP (Fremskrittspartiet)**: Dark Blue (#004F80)

## Error Handling and Fallbacks

### Robust Error Management

```javascript
try {
    await downloadAsPNG(cardEl, filename, chartTitle);
} catch (error) {
    console.error('[downloadChartForCard] Error:', error);
    announce?.('Failed to download chart.');
    
    // Fallback to basic PNG
    const canvas = cardEl.querySelector('canvas');
    if (canvas) {
        downloadPNG(canvas, getSuggestedFilename(cardEl, 'png'));
    }
}
```

### Library Availability Checks

```javascript
if (!window.html2canvas) {
    console.error('[downloadChartForCard] html2canvas not available');
    announce?.('Download library not loaded. Please refresh the page.');
    return;
}
```

## Performance Optimizations

### High-Resolution Rendering

- **3x scale** for PNG exports ensures crisp images
- **Image smoothing** enabled for better quality
- **Timeout handling** prevents hanging operations

### Memory Management

- **Temporary containers** are created off-screen
- **Automatic cleanup** removes temporary elements
- **Blob URLs** are properly revoked to prevent memory leaks

## User Experience Features

### Visual Feedback

- **Announcements** inform users of download status
- **Loading states** during export process
- **Error messages** for failed downloads
- **Success confirmations** when downloads complete

### Accessibility

- **ARIA labels** for download buttons
- **Keyboard navigation** support
- **Screen reader** announcements
- **High contrast** support

## Future Enhancements

### Planned Improvements

1. **PDF Export**: Direct PDF generation with jsPDF
2. **Batch Downloads**: Download multiple charts at once
3. **Custom Sizing**: User-selectable export dimensions
4. **Watermarking**: Optional chart watermarks
5. **Metadata Export**: Include data source and methodology

### Technical Considerations

- **Chart.js Plugin System**: Extend with custom plugins
- **Web Workers**: Move heavy processing off main thread
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Caching**: Cache rendered charts for faster re-exports

## Troubleshooting

### Common Issues

1. **Download button not working**: Check if html2canvas is loaded
2. **Empty PNG files**: Verify chart instance exists
3. **Missing political colors**: Ensure segment data is preserved
4. **Large file sizes**: Consider reducing scale factor

### Debug Information

The system includes comprehensive logging:

```javascript
console.log('[downloadChartForCard] Starting download process...', format);
console.log('[downloadChartForCard] Chart title:', chartTitle);
console.log('[downloadChartForCard] Filename:', filename);
```

## Conclusion

The chart download system provides a robust, user-friendly way to export charts from the Riksdata website. It balances quality, functionality, and performance while maintaining the visual integrity of the original charts, including the important political period color coding that makes Norwegian data visualization unique.

The system is designed to be extensible and maintainable, with clear separation of concerns and comprehensive error handling. Future enhancements will continue to improve the user experience while maintaining the high standards of data visualization that Riksdata represents.
