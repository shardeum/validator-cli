#!/usr/bin/env node

import * as pm2 from 'pm2';
import {Command} from 'commander';
import {readFileSync} from 'fs';
import path = require('path');
import {exec} from 'child_process';

import cliPackageJson = require('../package.json');
const dashboardPackageJson = JSON.parse(
  readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
);

const program = new Command();

program
  .name('operator-cli')
  .description('CLI part of the operator dashboard')
  .version(cliPackageJson.version);

/** === DASHBOARD === */

const dashboard = program
  .command('dashboard')
  .description('Dashboard related commands');

dashboard
  .command('version')
  .description(
    'Shows the installed version, latest version and minimum version of the operator dashboard'
  )
  .action(() => {
    console.log(dashboardPackageJson.version);
  });

/** === GUI === */

const gui = program.command('gui').description('GUI related commands');

interface ProcessStatus {
  name?: string;
  uptimeInSeconds?: number;
  restarts?: number;
  status?: string;
  cpuUsagePercent?: number;
  memUsedInBytes?: number;
  link?: string;
}

gui
  .command('status')
  .description(
    'Show if GUI is running or not; also the port and URL to connect to it'
  )
  .action(() => {
    pm2.describe('operator-gui', (err, descriptions) => {
      if (err) {
        console.error(err);
        return pm2.disconnect();
      }
      if (descriptions.length == 0) {
        console.log('operator gui not running!');
        return pm2.disconnect();
      }
      const description = descriptions[0];
      const status: ProcessStatus = statusFromPM2(description);
      status.link = 'http://localhost:8080/';
      console.log(status);
      return pm2.disconnect();
    });
  });

function statusFromPM2(pm2Description: any): ProcessStatus {
  return {
    name: pm2Description.name,
    uptimeInSeconds: pm2Description.pm2_env?.pm_uptime
      ? (Date.now() - pm2Description.pm2_env?.pm_uptime) / 1000
      : 0,
    restarts: pm2Description.pm2_env?.restart_time,
    status: pm2Description.pm2_env?.status,
    cpuUsagePercent: pm2Description.monit?.cpu,
    memUsedInBytes: pm2Description.monit?.memory,
  };
}

gui
  .command('start')
  .description('Starts the GUI server')
  .action(() => {
    // Exec PM2 to start the GUI server
    pm2.connect(err => {
      if (err) {
        console.error(err);
        throw 'Unable to connect to PM2';
      }
      pm2.start(
        {
          script: `${path.join(
            __dirname,
            '../../../gui/backend/build/src/index.js'
          )}`,
          name: 'operator-gui',
        },
        err => {
          if (err) console.error(err);
          return pm2.disconnect();
        }
      );
    });
  });

gui
  .command('stop')
  .description('Stops the GUI server')
  .action(() => {
    // Exec PM2 to stop the GUI server
    pm2.connect(err => {
      if (err) {
        console.error(err);
        throw 'Unable to connect to PM2';
      }
      pm2.stop('operator-gui', err => {
        if (err) console.log(err);
        return pm2.disconnect();
      });
    });
  });

/** === NODE === */

program
  .command('status')
  .description(
    'Show if validator is running or not; also the port and URL to connect to it'
  )
  .action(() => {
    pm2.describe('validator', (err, descriptions) => {
      if (err) {
        console.error(err);
        return pm2.disconnect();
      }
      if (descriptions.length == 0) {
        console.log('validator not running!');
        return pm2.disconnect();
      }
      const description = descriptions[0];
      const status: ProcessStatus = statusFromPM2(description);
      console.log(status);
      return pm2.disconnect();
    });
  });

program
  .command('start')
  .description('Starts the validator')
  .action(() => {
    // Run the validators clean script
    exec(
      `node ${path.join(__dirname, '../../../validator/scripts/clean.js')}`,
      () => {
        // Exec PM2 to start the shardeum validator
        pm2.connect(err => {
          if (err) {
            console.error(err);
            throw 'Unable to connect to PM2';
          }
          pm2.start(
            {
              script: `${path.join(
                __dirname,
                '../../../validator/dist/src/index.js'
              )}`,
              name: 'validator',
            },
            err => {
              if (err) console.error(err);
              return pm2.disconnect();
            }
          );
        });
      }
    );
  });

program
  .command('stop')
  .description('Stops the validator')
  .action(() => {
    // Exec PM2 to stop the shardeum validator
    pm2.connect(err => {
      if (err) {
        console.error(err);
        throw 'Unable to connect to PM2';
      }
      pm2.stop('validator', err => {
        if (err) console.log(err);
        return pm2.disconnect();
      });
    });
  });

program.parse();
