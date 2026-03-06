function parseChangelogSection(content) {
  const match = content.match(/(## .+?)(?=\n## |\s*$)/s);
  if (!match) return content.slice(0, 1000);
  return match[1].trim().slice(0, 1500);
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash = hash & hash;
  }
  return hash.toString(36);
}

module.exports = { parseChangelogSection, hashString };
