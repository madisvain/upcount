const path = require('path');
const { execSync } = require('child_process');

setTimeout(() => {
  execSync('npm run dev:main', { cwd: path.join(__dirname, '..') });
}, 8000);
