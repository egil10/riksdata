#!/usr/bin/env python3
"""
Translate HTML chart titles and subtitles to Norwegian
"""

# Read index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Key phrase translations
translations = [
    # Chart action buttons
    ('aria-label="Copy data"', 'aria-label="Kopier data"'),
    ('title="Copy data"', 'title="Kopier data"'),
    ('aria-label="Download chart"', 'aria-label="Last ned diagram"'),
    ('title="Download chart"', 'title="Last ned diagram"'),
    ('aria-label="Fullscreen"', 'aria-label="Fullskjerm"'),
    ('title="Fullscreen"', 'title="Fullskjerm"'),
    
    # Subtitles
    ('NOK (billions)', 'NOK (milliarder)'),
    ('NOK per USD', 'NOK per USD'),
    ('NOK per EUR', 'NOK per EUR'),
    ('NOK per GBP', 'NOK per GBP'),
    ('NOK per I44', 'NOK per I44'),
    ('NOK per CHF', 'NOK per CHF'),
    ('NOK per CNY', 'NOK per CNY'),
    ('NOK per SEK', 'NOK per SEK'),
    ('Reservoir fill percentage by area', 'Magasinf yllingsgrad etter område'),
    ('Reservoir statistics by area', 'Magasinstatistikk etter område'),
    ('Reservoir statistics summary', 'Magasinstatistikk sammendrag'),
    ('Current electricity production & consumption', 'Nåværende elektrisitetsproduksjon og forbruk'),
    ('Complete electricity data', 'Fullstendige elektrisitetsdata'),
]

# Apply translations
translations_applied = 0
for english, norwegian in translations:
    if english in content:
        content = content.replace(english, norwegian)
        translations_applied += 1
        print(f"OK: {english[:50]}... -> {norwegian[:50]}...")

# Write back
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nApplied {translations_applied} translations to index.html")
