const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const distDir = path.resolve(__dirname, '..', 'dist');
const enabled = String(process.env.OBFUSCATE_ENABLED ?? 'true') === 'true';
if (!enabled) process.exit(0);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.isFile() && full.endsWith('.js')) obfuscateFile(full);
  }
}

function obfuscateFile(file) {
  const code = fs.readFileSync(file, 'utf8');
  const result = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    deadCodeInjection: true,
    stringArray: true,
    stringArrayEncoding: ['rc4'],
    rotateStringArray: true,
    renameGlobals: false,
    sourceMap: false
  });
  fs.writeFileSync(file, result.getObfuscatedCode(), 'utf8');
}

if (fs.existsSync(distDir)) walk(distDir);
