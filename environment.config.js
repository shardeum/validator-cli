const path = require('path');
const fs = require('fs');

const nodeConfig = JSON.parse(fs.readFileSync(path.join(__dirname, './build/nodeConfig.json')).toString());

module.exports = [
  {
    script: path.join(__dirname, '../validator/dist/src/index.js'),
    stop_exit_codes: [1],
    name: 'validator',
    output: path.join(__dirname, './validator-logs.txt'),
    cwd: path.join(__dirname, './build'),
    autorestart: nodeConfig.autorestart,
  },
];
