import pm2 from 'pm2';
import {Command} from 'commander';
import path = require('path');
import {timingSafeEqual} from 'crypto';
import {Pm2ProcessStatus, statusFromPM2} from './pm2';
import merge from 'deepmerge';
import {defaultGuiConfig} from './config/default-gui-config';
import fs from 'fs';
import * as yaml from 'js-yaml';
import * as crypto from '@shardus/crypto-utils';
import {getInstalledGuiVersion} from './utils/project-data';
import {File} from './utils'

let config = defaultGuiConfig;

crypto.init('64f152869ca2d473e4ba64ab53f49ccdb2edae22da192c126850970e788af347');

// eslint-disable-next-line security/detect-non-literal-fs-filename
if (fs.existsSync(path.join(__dirname, `../${File.GUI_CONFIG}`))) {
  const fileConfig = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(path.join(__dirname, `../${File.GUI_CONFIG}`)).toString()
  );
  config = merge(config, fileConfig, {arrayMerge: (target, source) => source});
}

export function registerGuiCommands(program: Command) {
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
        const status: Pm2ProcessStatus = statusFromPM2(description);
        status.link = `http://localhost:${config.gui.port}/`;
        console.log(yaml.dump(status));
        return pm2.disconnect();
      });
    });

  gui
    .command('start')
    .description('Starts the GUI server')
    .action(async () => await startGui());

  gui
    .command('restart')
    .description('Restarts the GUI server')
    .action(async () => {
      await stopGui();
      await startGui();
    });

  gui
    .command('version')
    .description('Show the GUI version')
    .action(() => {
      console.log(getInstalledGuiVersion());
    });

  gui
    .command('stop')
    .description('Stops the GUI server')
    .action(async () => {
      await stopGui();
    });

  const setCommand = gui
    .command('set')
    .description('command to set various config parameters');

  setCommand
    .command('port')
    .arguments('<port>')
    .description('Set the GUI server port')
    .action(port => {
      config.gui.port = parseInt(port);
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFile(
        path.join(__dirname, `../${File.GUI_CONFIG}`),
        JSON.stringify(config, undefined, 2),
        err => {
          if (err) console.log(err);
        }
      );
    });

  setCommand
    .command('password')
    .arguments('<password>')
    .description('Set the GUI server password')
    .action(password => {
      config.gui.pass = crypto.hash(password);
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFile(
        path.join(__dirname, `../${File.GUI_CONFIG}`),
        JSON.stringify(config, undefined, 2),
        err => {
          if (err) console.error(err);
        }
      );
    });

  gui
    .command('login')
    .arguments('<password>')
    .description('verify GUI password')
    .action(password => {
      if (
        !timingSafeEqual(Buffer.from(password), Buffer.from(config.gui.pass))
      ) {
        console.log(yaml.dump({login: 'unauthorized'}));
        return;
      }
      console.log(yaml.dump({login: 'authorized'}));
    });

  function startGui() {
    // Exec PM2 to start the GUI server
    return new Promise<void>((resolve, reject) =>
      pm2.connect(err => {
        if (err) {
          console.error(err);
          reject('Unable to connect to PM2');
        }
        // Start next.js front end on port 3000
        pm2.start(
          {
            name: 'operator-gui',
            cwd: `${path.join(__dirname, '../../../gui')}`,
            script: 'npm',
            args: 'start',
            env: {PORT: `${config.gui.port}`},
          },
          err => {
            if (err) {
              console.error(err);
              reject('Unable to start GUI');
            }
            pm2.disconnect();
            resolve();
          }
        );
      })
    );
  }

  function stopGui() {
    return new Promise<void>((resolve, reject) => {
      pm2.connect(err => {
        if (err) {
          console.error(err);
          reject('Unable to connect to PM2');
        }

        pm2.stop('operator-gui', err => {
          if (err) {
            console.log(err);
            reject('Unable to stop gui');
          }
          pm2.disconnect();
          resolve();
        });

        pm2.delete('operator-gui', err => {
          if (err) {
            console.log(err);
            reject('Unable to delete gui');
          }
          pm2.disconnect();
          resolve();
        });
      });
    });
  }
}
