import {ProcessStatus, statusFromPM2} from './pm2';
import * as pm2 from 'pm2';
import {Command} from 'commander';
import path = require('path');
import {exec} from 'child_process';

export function registerNodeCommands(program: Command) {
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
        if (descriptions.length === 0) {
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
    .option(
      '-f, --force',
      'stops the node even if it is participating and could get slashed'
    )
    .action(options => {
      // Exec PM2 to stop the shardeum validator
      pm2.connect(err => {
        if (err) {
          console.error(err);
          throw 'Unable to connect to PM2';
        }

        if (!options.force) {
          //TODO check to make sure the node is not participating
        }

        pm2.stop('validator', err => {
          if (err) console.log(err);
          return pm2.disconnect();
        });
      });
    });

  program
    .command('joined')
    .description('Check the validator state standby/syncing/active')
    .action(() => {
      //TODO interact with node
    });

  program
    .command('reward_address')
    .description('Query the validator reward address')
    .action(() => {
      //TODO interact with node
    });

  program
    .command('stake_address')
    .description('Query the validator stake address')
    .action(() => {
      //TODO interact with node
    });

  program
    .command('version')
    .description('Shows my version, latest version and minimum version')
    .action(() => {
      //TODO interact with node
    });

  program
    .command('update')
    .description('Shows instructions for version update')
    .action(() => {
      console.log('Run the ./update.sh script in the installer root directory');
    });

  const setCommand = program
    .command('set')
    .description('command to set various config parameters');

  setCommand
    .command('port')
    .description('Set the port for the validator')
    .action(() => {
      //TODO interact with node
    });

  setCommand
    .command('reward')
    .arguments('<address>')
    .description('Set the port for the validator')
    .action(address => {
      //TODO interact with node
    });

  setCommand
    .command('archiver')
    .arguments('<URL>')
    .description('Set the URL for the archiver')
    .action(url => {
      //TODO interact with node
    });

  setCommand
    .command('stake')
    .arguments('<address>')
    .description('Set the stake address')
    .action(url => {
      //TODO interact with node
    });
}
