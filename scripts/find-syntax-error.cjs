const fs = require('fs');
const esbuild = require('esbuild');
const filePath = __dirname + '/../app/dashboard/templatesPro/page.tsx';
const code = fs.readFileSync(filePath, 'utf8');
const lines = code.split('\n');
console.log('File has', lines.length, 'lines');

function testWithout(startLine, endLine) {
  const modified = [...lines];
  for (let i = startLine; i <= endLine; i++) modified[i] = '';
  try {
    esbuild.transformSync(modified.join('\n'), { loader: 'tsx', jsx: 'automatic' });
    return true;
  } catch(e) { return false; }
}

// Test removing 50-line sections
for (let i = 0; i < lines.length; i += 50) {
  const end = Math.min(i + 49, lines.length - 1);
  if (testWithout(i, end)) {
    console.log('Removing lines ' + (i+1) + '-' + (end+1) + ' FIXES the issue');
    // Narrow down
    for (let j = i; j <= end; j++) {
      if (testWithout(j, j)) {
        console.log('  Line ' + (j+1) + ': ' + lines[j].trim().substring(0, 80));
      }
    }
    break;
  }
}
