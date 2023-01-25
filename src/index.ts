#!/usr/bin/env node

import {Command} from 'commander';

import cliPackageJson = require('../package.json');
import dotenv = require('dotenv');
import {registerGuiCommands} from './gui-commands';
import {registerNodeCommands} from './node-commands';

dotenv.config();

const program = new Command();

program
  .name('operator-cli')
  .description('CLI part of the operator dashboard')
  .version(cliPackageJson.version);

/** === NODE === */
registerNodeCommands(program);

/** === GUI === */
registerGuiCommands(program);

// Run the program and parse the cli
program.parse();
