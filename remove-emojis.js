const fs = require('fs');

// Read the file
const content = fs.readFileSync('src/js/drilldown-configs.js', 'utf8');

// Remove all emojis from title fields using a comprehensive regex
// This regex matches most emojis and symbols
const emojiRegex = /[\u{1F1E6}-\u{1F1FF}]{2}|[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2300}-\u{23FF}]/gu;

// Replace emojis followed by space in title fields
const cleaned = content.replace(/(title:\s*['"])([^\'"]*)/g, (match, prefix, titleContent) => {
  // Remove emojis and trim extra spaces
  const cleanedTitle = titleContent.replace(emojiRegex, '').trim();
  return prefix + cleanedTitle;
});

// Write back
fs.writeFileSync('src/js/drilldown-configs.js', cleaned, 'utf8');

console.log('✅ Emojis removed from drilldown-configs.js');

