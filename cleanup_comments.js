const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'frontend', 'src'),
  path.join(__dirname, 'backend', 'src'),
  path.join(__dirname, 'backend', 'prisma')
];

const extensions = ['.ts', '.tsx', '.js', '.jsx'];

function removeComments(content) {
  // This is a basic regex-based comment remover.
  // It handles most cases but can be tricky with comments in strings.
  // Given the current state of the project, it should be safe enough for most files.
  
  // Remove multi-line comments
  let result = content.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove single-line comments
  // We look for // that are not preceded by a : (to avoid matching http://)
  // and are not inside a string (this regex is simplified)
  result = result.split('\n').map(line => {
    // Basic check for // that isn't part of a URL
    if (line.includes('//') && !line.includes('://')) {
      const index = line.indexOf('//');
      // Very crude check for quotes - if the // is after an odd number of quotes, it might be in a string.
      const beforeStr = line.substring(0, index);
      const quoteCount = (beforeStr.match(/"/g) || []).length + (beforeStr.match(/'/g) || []).length;
      if (quoteCount % 2 === 0) {
        return line.substring(0, index);
      }
    }
    return line;
  }).join('\n');

  // Remove JSX comments
  result = result.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');

  return result;
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (extensions.includes(path.extname(fullPath))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const newContent = removeComments(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf-8');
        console.log(`Cleaned: ${fullPath}`);
      }
    }
  });
}

targetDirs.forEach(processDirectory);
console.log('Global comment removal complete.');
