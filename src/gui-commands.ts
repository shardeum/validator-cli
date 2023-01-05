import pm2 from 'pm2';
import {Command} from 'commander';
import path = require('path');
import {ProcessStatus, statusFromPM2} from './pm2';

export function registerGuiCommands(program: Command) {
  const guiPort = process.env.GUI_PORT || '8080';
  const gui = program.command('gui').description('GUI related commands');

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
        if (descriptions.length === 0) {
          console.log('operator gui not running!');
          return pm2.disconnect();
        }
        const description = descriptions[0];
        const status: ProcessStatus = statusFromPM2(description);
        status.link = `http://localhost:${guiPort}/`;
        console.log(status);
        return pm2.disconnect();
      });
    });

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
            env: {PORT: `${guiPort}`},
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

  gui
    .command('port')
    .arguments('<port>')
    .description('Set the GUI server port')
    .action(port => {
      // TODO write to the config file
    });

  gui
    .command('password')
    .arguments('<password>')
    .description('Set the GUI server password')
    .action(() => {
      // TODO write to the config file
    });
}
