# 📸 Political Timeline & Infographics Guide

## Overview

Complete political timeline data for creating infographics about Norwegian governments (1965-2025).

## Data Sources

### 1. JavaScript Configuration (`src/js/config.js`)

Two exported constants for real-time use:

#### `POLITICAL_PERIODS` Array
Complete period data with all metadata:
```javascript
import { POLITICAL_PERIODS } from './config.js';

// Each period includes:
{
    name: "Jonas Gahr Støre (Ap, Sp)",
    start: "2021-10-14",
    end: "2025-09-08",
    color: "#E11926",
    backgroundColor: "rgba(225, 25, 38, 0.7)",
    primeMinister: "Jonas Gahr Støre",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/...",
    party: "Ap",
    coalition: ["Sp"]
}
```

#### `PARTY_LOGOS` Object
Party information with logos:
```javascript
import { PARTY_LOGOS } from './config.js';

// Each party includes:
{
    name: "Arbeiderpartiet",
    shortName: "Ap",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/...",
    color: "#E11926"
}
```

#### Helper Functions
```javascript
import { getPartyLogo, getCoalitionLogos } from './config.js';

// Get single party logo
const apLogo = getPartyLogo('Ap'); 
// Returns: "https://upload.wikimedia.org/wikipedia/commons/3/36/Arbeidarpartiet.svg"

// Get all coalition logos
const coalitionLogos = getCoalitionLogos(['Ap', 'Sp']);
// Returns array of party logo objects
```

### 2. JSON Data File (`data/static/political-timeline.json`)

Comprehensive JSON export for external tools:
- Complete government data (1965-2025)
- All party information with logos
- Wikipedia URLs for each government
- Statistics and breakdowns

## Available Images

### Prime Minister Photos (Wikimedia Commons)

| Prime Minister | Period | Image URL |
|----------------|--------|-----------|
| Per Borten | 1965-1971 | [Photo](https://upload.wikimedia.org/wikipedia/commons/a/a2/Statsminister_Per_Borten_-_PA-0797_4133_001.jpg) |
| Trygve Bratteli | 1971-1972, 1973-1976 | [Photo](https://upload.wikimedia.org/wikipedia/commons/f/f0/Trygve_Bratteli_%285Fo30141709010076%29.jpg) |
| Lars Korvald | 1972-1973 | [Photo](https://upload.wikimedia.org/wikipedia/commons/7/7a/Lars_Korvald_%284Fo30141709010050%29.jpg) |
| Odvar Nordli | 1976-1981 | [Photo](https://upload.wikimedia.org/wikipedia/commons/1/17/Odvar_Nordli_1976.jpg) |
| Gro Harlem Brundtland | 1981, 1986-1989, 1990-1996 | [Photo](https://upload.wikimedia.org/wikipedia/commons/9/9d/Gro_Harlem_Brundtland_ca.1974%E2%80%931979.jpg) |
| Kåre Willoch | 1981-1986 | [Photo](https://upload.wikimedia.org/wikipedia/commons/6/61/Willoch_1983_%28high_resolution%2C_cropped%29.jpg) |
| Jan P. Syse | 1989-1990 | [Photo](https://upload.wikimedia.org/wikipedia/commons/4/47/Jan_P._Syse.JPG) |
| Thorbjørn Jagland | 1996-1997 | [Photo](https://upload.wikimedia.org/wikipedia/commons/8/8d/Thorbj%C3%B8rn_Jagland%2C_Secretary_General%2C_Council_of_Europe_%2822167149560%29_%28cropped%29.jpg) |
| Kjell Magne Bondevik | 1997-2000, 2001-2005 | [Photo](https://upload.wikimedia.org/wikipedia/commons/d/da/Kjell_Magne_Bondevik%2C_Norges_statsminister%2C_under_presskonferens_vid_Nordiska_radets_session_i_Stockholm.jpg) |
| Jens Stoltenberg | 2000-2001, 2005-2013 | [Photo](https://upload.wikimedia.org/wikipedia/commons/e/ef/Jens_Stoltenberg_2020.jpg) |
| Erna Solberg | 2013-2021 | [Photo](https://upload.wikimedia.org/wikipedia/commons/5/5d/31.08.2013%2C_Erna_Solberg.2.jpg) |
| Jonas Gahr Støre | 2021-Present | [Photo](https://upload.wikimedia.org/wikipedia/commons/3/37/Jonas_Gahr_St%C3%B8re_%282025%29_%28cropped%29.jpg) |

### Party Logos (Wikimedia Commons)

| Party | Name | Logo URL |
|-------|------|----------|
| Ap | Arbeiderpartiet | [SVG](https://upload.wikimedia.org/wikipedia/commons/3/36/Arbeidarpartiet.svg) |
| Sp | Senterpartiet | [PNG](https://upload.wikimedia.org/wikipedia/commons/4/4a/Senterpartiets_logo.png) |
| H | Høyre | [PNG](https://upload.wikimedia.org/wikipedia/commons/8/8a/Flag_of_H%C3%B8yre.png) |
| KrF | Kristelig Folkeparti | [JPG](https://upload.wikimedia.org/wikipedia/commons/b/b6/KrF_logo.jpg) |
| FrP | Fremskrittspartiet | [SVG](https://upload.wikimedia.org/wikipedia/commons/f/f2/Fremskrittspartiet_logo.svg) |
| V | Venstre | [PNG](https://upload.wikimedia.org/wikipedia/commons/3/3c/Venstres_logo.png) |
| SV | Sosialistisk Venstreparti | [SVG](https://upload.wikimedia.org/wikipedia/commons/b/b5/Sosialistisk_Venstreparti_logo.svg) |

## Infographic Ideas

### 1. **Timeline Visualization**
Display all governments in chronological order with:
- Prime minister photo
- Party color bar
- Coalition party logos
- Years in office
- Key achievements

### 2. **Party Dominance Chart**
Show which parties have led the government:
- Ap: 8 governments
- H: 3 governments
- KrF: 2 governments
- Sp: 1 government

### 3. **Coalition Patterns**
Visualize common coalition partnerships:
- H + KrF + Sp (appeared multiple times)
- Ap + SV + Sp (Red-Green Coalition)
- H + FrP + V + KrF (Blue Coalition)

### 4. **Female Leadership Timeline**
Highlight Norway's female prime ministers:
- Gro Harlem Brundtland (3 terms: 1981, 1986-1989, 1990-1996)
- Erna Solberg (2013-2021)

### 5. **Economic Indicators by Government**
Overlay economic data (GDP, unemployment, etc.) with government periods:
- Show which governments presided over economic growth/recession
- Color-coded by party

## Code Examples

### Example 1: Display Prime Minister Photos

```javascript
import { POLITICAL_PERIODS } from './config.js';

// Create timeline gallery
POLITICAL_PERIODS.forEach(period => {
    if (period.imageUrl) {
        const card = document.createElement('div');
        card.innerHTML = `
            <img src="${period.imageUrl}" alt="${period.primeMinister}">
            <h3>${period.primeMinister}</h3>
            <p>${period.party} - ${period.years}</p>
        `;
        gallery.appendChild(card);
    }
});
```

### Example 2: Show Coalition Logos

```javascript
import { PARTY_LOGOS, getCoalitionLogos } from './config.js';

const solbergCoalition = ['H', 'FrP', 'V', 'KrF'];
const logos = getCoalitionLogos(solbergCoalition);

logos.forEach(party => {
    const img = document.createElement('img');
    img.src = party.imageUrl;
    img.alt = party.name;
    container.appendChild(img);
});
```

### Example 3: Create Political Timeline

```javascript
// Load JSON data for external use
fetch('./data/static/political-timeline.json')
    .then(res => res.json())
    .then(data => {
        data.governments.forEach(gov => {
            console.log(`${gov.name} (${gov.years})`);
            console.log(`  Photo: ${gov.imageUrl}`);
            console.log(`  Party: ${gov.party}`);
            console.log(`  Coalition: ${gov.coalition.join(', ')}`);
        });
    });
```

### Example 4: Color-Coded Timeline Bar

```javascript
import { POLITICAL_PERIODS } from './config.js';

// Create visual timeline
const timeline = document.createElement('div');
timeline.className = 'political-timeline';

POLITICAL_PERIODS.forEach(period => {
    const startYear = new Date(period.start).getFullYear();
    const endYear = new Date(period.end).getFullYear();
    const duration = endYear - startYear + 1;
    
    const bar = document.createElement('div');
    bar.style.background = period.color;
    bar.style.width = `${duration * 10}px`; // 10px per year
    bar.title = `${period.primeMinister} (${startYear}-${endYear})`;
    
    timeline.appendChild(bar);
});
```

## Image Usage & Licensing

All images are from **Wikimedia Commons** and are in the **public domain** or under free licenses:
- Prime minister photos: Public domain or CC licenses
- Party logos: Official logos used for educational/informational purposes
- Always credit Wikimedia Commons when using these images

### Attribution Example
```
Image credits: Wikimedia Commons
- Per Borten photo: Norwegian National Archives
- Party logos: Official party materials via Wikimedia Commons
```

## Future Enhancements

### Missing Data (Pre-1965)
If you want to add governments before 1965, you'll need to find images for:
- Einar Gerhardsen (1945-1951, 1955-1963, 1963-1965)
- Oscar Torp (1951-1955)
- John Lyng (1963)

### Additional Metadata Ideas
Consider adding:
- Major events during each government
- Economic indicators (GDP growth, unemployment at start/end)
- Key policies implemented
- Election results
- International context

### Infographic Tools
Recommended tools for creating infographics:
1. **D3.js** - Interactive timeline visualizations
2. **Canvas API** - Custom graphics
3. **Chart.js** - Bar charts of government durations
4. **SVG** - Scalable vector graphics

## Example Infographic Layout

```
┌────────────────────────────────────────────────────────┐
│  Norwegian Political Timeline (1965-2025)              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [Photo]  Per Borten (Sp)                    1965-71  │
│  ▓▓▓▓▓▓  Coalition: H, V, KrF                         │
│                                                        │
│  [Photo]  Trygve Bratteli (Ap)               1971-72  │
│  ▓▓▓▓▓▓  Minority government                          │
│                                                        │
│  [Photo]  Lars Korvald (KrF)                 1972-73  │
│  ▓▓▓▓▓▓  Coalition: Sp, V                             │
│                                                        │
│  ... (continues for all governments) ...              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Statistics & Fun Facts

### Party Leadership Count
- **Arbeiderpartiet (Ap)**: 8 governments
- **Høyre (H)**: 3 governments  
- **Kristelig Folkeparti (KrF)**: 2 governments
- **Senterpartiet (Sp)**: 1 government

### Notable Firsts
- **First female PM**: Gro Harlem Brundtland (1981)
- **Longest single term**: Gro Harlem Brundtland III (1990-1996, 6 years)
- **Most terms**: Gro Harlem Brundtland (3 separate governments)
- **First Red-Green Coalition**: Stoltenberg II (2005-2013)

### Coalition Patterns
- **Most common**: Center-right coalitions (H + KrF + Sp/V)
- **Longest coalition**: Solberg government (2013-2021, 8 years)
- **Unique**: Red-Green Coalition (Ap + SV + Sp, 2005-2013)

## Quick Access Functions

### Get Current Government
```javascript
import { POLITICAL_PERIODS } from './config.js';

function getCurrentGovernment() {
    const now = new Date();
    return POLITICAL_PERIODS.find(period => {
        const start = new Date(period.start);
        const end = new Date(period.end);
        return now >= start && now <= end;
    });
}

const current = getCurrentGovernment();
// Returns: Jonas Gahr Støre (Ap, Sp)
```

### Get Government by Year
```javascript
function getGovernmentByYear(year) {
    const targetDate = new Date(year, 0, 1);
    return POLITICAL_PERIODS.find(period => {
        const start = new Date(period.start);
        const end = new Date(period.end);
        return targetDate >= start && targetDate <= end;
    });
}

const gov2008 = getGovernmentByYear(2008);
// Returns: Jens Stoltenberg II (Ap, SV, Sp)
```

### Get All Governments by Party
```javascript
function getGovernmentsByParty(partyCode) {
    return POLITICAL_PERIODS.filter(period => period.party === partyCode);
}

const apGovernments = getGovernmentsByParty('Ap');
// Returns: 8 Arbeiderpartiet governments
```

## Infographic Templates

### Template 1: Vertical Timeline

```html
<div class="timeline-vertical">
    <div class="timeline-item" 
         style="background: linear-gradient(to right, #E11926 0%, #E11926 100%)">
        <img src="[Støre photo]" alt="Jonas Gahr Støre">
        <div class="timeline-info">
            <h3>Jonas Gahr Støre</h3>
            <p>Ap + Sp | 2021-Present</p>
        </div>
        <div class="coalition-logos">
            <img src="[Ap logo]">
            <img src="[Sp logo]">
        </div>
    </div>
    <!-- Repeat for each government -->
</div>
```

### Template 2: Horizontal Bar Chart

```javascript
// Create horizontal bars showing government durations
POLITICAL_PERIODS.forEach(period => {
    const start = new Date(period.start);
    const end = new Date(period.end);
    const years = (end - start) / (365.25 * 24 * 60 * 60 * 1000);
    
    const bar = document.createElement('div');
    bar.style.width = `${years * 50}px`; // 50px per year
    bar.style.background = period.color;
    bar.title = `${period.primeMinister} (${years.toFixed(1)} years)`;
    
    chart.appendChild(bar);
});
```

### Template 3: Photo Grid with Stats

```html
<div class="pm-grid">
    <div class="pm-card">
        <img src="[Photo]" class="pm-photo">
        <div class="pm-info">
            <h3>Erna Solberg</h3>
            <span class="party-badge" style="background: #87add7">H</span>
            <p class="duration">8 years (2013-2021)</p>
            <div class="coalition">
                <img src="[FrP logo]" title="FrP">
                <img src="[V logo]" title="V">
                <img src="[KrF logo]" title="KrF">
            </div>
        </div>
    </div>
    <!-- Repeat for each PM -->
</div>
```

## CSS Styling Examples

### Timeline Card Styling
```css
.pm-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-left: 4px solid var(--party-color);
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.pm-photo {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--party-color);
}

.party-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    font-size: 0.75rem;
}

.coalition img {
    width: 30px;
    height: 30px;
    margin-right: 4px;
    object-fit: contain;
}
```

### Animated Timeline Bar
```css
.timeline-bar {
    display: flex;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.timeline-segment {
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
}

.timeline-segment:hover {
    transform: scaleY(1.1);
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.timeline-segment::before {
    content: attr(data-pm);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.timeline-segment:hover::before {
    opacity: 1;
}
```

## Data Structure Reference

### Political Period Object
```typescript
interface PoliticalPeriod {
    name: string;              // "Jonas Gahr Støre (Ap, Sp)"
    start: string;             // "2021-10-14" (ISO date)
    end: string;               // "2025-09-08"
    color: string;             // "#E11926" (hex color)
    backgroundColor: string;   // "rgba(225, 25, 38, 0.7)"
    primeMinister: string;     // "Jonas Gahr Støre"
    imageUrl: string;          // Wikimedia Commons URL
    party: string;             // "Ap" (leading party code)
    coalition: string[];       // ["Sp"] (coalition partners)
}
```

### Party Logo Object
```typescript
interface PartyLogo {
    name: string;          // "Arbeiderpartiet"
    shortName: string;     // "Ap"
    imageUrl: string;      // Wikimedia Commons URL
    color: string;         // "#E11926"
}
```

## Implementation Roadmap

### Phase 1: Basic Timeline ✅
- [x] Add all image URLs to config
- [x] Create JSON data file
- [x] Add helper functions
- [x] Document usage

### Phase 2: Interactive Timeline (Future)
- [ ] Create timeline component
- [ ] Add hover effects
- [ ] Show government details on click
- [ ] Add filtering by party

### Phase 3: Infographics (Future)
- [ ] PM photo gallery
- [ ] Coalition network diagram
- [ ] Party dominance chart
- [ ] Economic performance by government

### Phase 4: Advanced Features (Future)
- [ ] Animated transitions
- [ ] Export as PDF/PNG
- [ ] Share on social media
- [ ] Embed in articles

## Tips for Creating Infographics

### 1. **Image Optimization**
```javascript
// Optimize Wikimedia Commons images
const optimizeImageUrl = (url, width = 300) => {
    // Wikimedia supports thumbnail sizing
    return url.replace('/commons/', `/commons/thumb/`) + `/${width}px-filename.jpg`;
};
```

### 2. **Responsive Design**
- Use CSS Grid for photo galleries
- Stack vertically on mobile
- Make photos circular for consistency
- Use party colors as accents

### 3. **Accessibility**
- Always include alt text for images
- Use sufficient color contrast
- Provide text alternatives for visual data
- Support keyboard navigation

### 4. **Performance**
- Lazy load images below the fold
- Use WebP format where supported
- Implement placeholder images
- Cache images in service worker

## Resources

### Image Sources
- **Wikimedia Commons**: Free, high-quality political photos
- **Norwegian National Archives**: Historical photos
- **Party Websites**: Official party logos

### Design Inspiration
- Norwegian Parliament website
- Political news outlets
- Data journalism sites
- Historical archives

### Tools
- **Figma**: Design mockups
- **D3.js**: Interactive visualizations
- **Canvas API**: Custom graphics
- **Chart.js**: Political timeline bars

---

**Status**: ✅ **ALL POLITICAL DATA WITH IMAGES READY FOR INFOGRAPHICS!**

**Next Steps**: Start building your infographics using the data and images provided!

