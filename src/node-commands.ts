import {ProcessStatus, statusFromPM2} from './pm2';
import pm2 from 'pm2';
import {Command} from 'commander';
import path from 'path';
import {exec} from 'child_process';
import merge from 'deepmerge';
import axios from 'axios';

let config = {
  ip: {
    externalIp: '127.0.0.1',
    externalPort: 9001,
    internalIp: '127.0.0.1',
    internalPort: 10001,
  },
};

if (process.env.APP_IN_PORT) {
  config = merge(
    config,
    {
      ip: {
        internalPort: parseInt(process.env.APP_IN_PORT),
      },
    },
    {arrayMerge: (target, source) => source}
  );
}

if (process.env.APP_EX_PORT) {
  config = merge(
    config,
    {
      ip: {
        externalPort: parseInt(process.env.APP_EX_PORT),
      },
    },
    {arrayMerge: (target, source) => source}
  );
}

export function registerNodeCommands(program: Command) {
  program
    .command('status')
    .description(
      'Show if validator is running or not; also the port and URL to connect to it'
    )
    .action(() => {
      pm2.describe('validator', async (err, descriptions) => {
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
        const nodeInfo = await axios
          .get(
            `http://${config.ip.externalIp}:${config.ip.externalPort}/nodeinfo`
          )
          .then(res => res.data)
          .catch(err => console.log(err));

        console.log(merge(status, nodeInfo));
        return pm2.disconnect();
      });
    });

  program
    .command('start')
    .description('Starts the validator')
    .action(() => {
      // Run the validators clean script
      exec(
        `node ${path.join(__dirname, '../../../server/scripts/clean.js')}`,
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
                  '../../../server/dist/src/index.js'
                )}`,
                name: 'validator',
                output: './validator-logs.txt',
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
