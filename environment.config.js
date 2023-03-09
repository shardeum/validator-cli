const path = require('path');

module.exports = [
  {
    script: path.join(__dirname, '../validator/dist/src/index.js'),
    stop_exit_codes: [1],
    name: 'validator',
    output: path.join(__dirname, './validator-logs.txt'),
    cwd: path.join(__dirname, './build'),
    autorestart: true,
  },
];
