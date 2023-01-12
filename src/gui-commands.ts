import pm2 from 'pm2';
import {Command} from 'commander';
import path = require('path');
import {ProcessStatus, statusFromPM2} from './pm2';
import merge from 'deepmerge';
import {defaultGuiConfig} from './config/default-gui-config';
import fs from 'fs';
import * as crypto from '@shardus/crypto-utils'


let config = defaultGuiConfig;

crypto.init('64f152869ca2d473e4ba64ab53f49ccdb2edae22da192c126850970e788af347')

if (fs.existsSync(path.join(process.cwd(), 'gui-config.json'))) {
  const fileConfig = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'gui-config.json')).toString()
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
        const status: ProcessStatus = statusFromPM2(description);
        status.link = `http://localhost:${config.gui.port}/`;
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
            cwd:`${path.join(
              __dirname,
              '../../../gui/'
            )}`,
            script: `npm start`,
            name: 'operator-gui',
            env: {PORT: `${config.gui.port}`},
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
      config.gui.port = parseInt(port);
      fs.writeFile(
        path.join(process.cwd(), 'gui-config.json'),
        JSON.stringify(config, undefined, 2),
        err => {
          if (err) console.log(err);
        }
      );
    });

  gui
    .command('password')
    .arguments('<password>')
    .description('Set the GUI server password')
    .action(password => {
      config.gui.pass = crypto.hash(password);
      fs.writeFile(
        path.join(process.cwd(), 'gui-config.json'),
        JSON.stringify(config, undefined, 2),
        err => {
          if (err) console.log(err);
        }
      );
    });

    gui
    .command('login')
    .arguments('<password>')
    .description('verify GUI password')
    .action(password => {
      if(crypto.hash(password) !== config.gui.pass) {
        return console.log("login: unauthorized")
      }
      console.log("login: authorized")
    });
}
