import pm2 from 'pm2'
import { Command } from 'commander'
import path = require('path')
import { timingSafeEqual } from 'crypto'
import { Pm2ProcessStatus, statusFromPM2 } from './pm2'
import merge from 'deepmerge'
import { defaultGuiConfig, guiConfigType, guiConfigSchema } from './config/default-gui-config'
import fs from 'fs'
import * as yaml from 'js-yaml'
import * as cryptoShardus from '@shardus/crypto-utils'
import { getInstalledGuiVersion } from './utils/project-data'
import { File } from './utils'
import crypto from 'crypto'
import Ajv from 'ajv'
import { FailedAttempt } from './config/default-gui-config'
let config = defaultGuiConfig

const validateGuiConfig = new Ajv().compile(guiConfigSchema)

const MAX_ATTEMPTS = 3 // Maximum allowed attempts

cryptoShardus.init('64f152869ca2d473e4ba64ab53f49ccdb2edae22da192c126850970e788af347')

function isNumber(n: string) {
  const parsedN = parseInt(n)
  return !isNaN(parsedN) && isFinite(parsedN)
}

const guiConfigPath = path.join(__dirname, `../${File.GUI_CONFIG}`)
if (fs.existsSync(guiConfigPath)) {
  // eslint-disable-line security/detect-non-literal-fs-filename
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const fileConfig = JSON.parse(fs.readFileSync(guiConfigPath).toString())
  if (validateGuiConfig(fileConfig)) {
    config = merge(config, fileConfig as guiConfigType, { arrayMerge: (target, source) => source })
    // `as guiConfigType` above is valid because validateGuiConfig() passed
  } else {
    console.warn(`warning: config has been ignored due to invalid JSON schema:`)
    console.warn(`${guiConfigPath}`)
  }
}

export function registerGuiCommands(program: Command) {
  const gui = program.command('gui').description('GUI related commands')

  gui
    .command('status')
    .description('Show if GUI is running or not; also the port and URL to connect to it')
    .action(() => {
      pm2.describe('operator-gui', (err, descriptions) => {
        if (err) {
          console.error(err)
          return pm2.disconnect()
        }
        if (descriptions.length === 0) {
          console.log('operator gui not running!')
          return pm2.disconnect()
        }
        const description = descriptions[0]
        const status: Pm2ProcessStatus = statusFromPM2(description)
        status.link = `https://localhost:${config.gui.port}/`
        console.log(yaml.dump(status))
        return pm2.disconnect()
      })
    })

  gui
    .command('start')
    .description('Starts the GUI server')
    .action(async () => await startGui())

  gui
    .command('restart')
    .description('Restarts the GUI server')
    .action(async () => {
      await stopGui()
      await startGui()
    })

  gui
    .command('version')
    .description('Show the GUI version')
    .action(() => {
      console.log(getInstalledGuiVersion())
    })

  gui
    .command('stop')
    .description('Stops the GUI server')
    .action(async () => {
      await stopGui()
    })

  const setCommand = gui.command('set').description('command to set various config parameters')

  setCommand
    .command('port')
    .arguments('<port>')
    .description('Set the GUI server port')
    .action((port) => {
      if (!isNumber(port)) {
        console.error('Port is not a number')
        return
      }
      port = parseInt(port)
      if (port < 1024) {
        console.error('Port is reserved')
        return
      }
      config.gui.port = parseInt(port)
      process.env.DASHPORT = port // set the DASHPORT environment variable

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFile(
        path.join(__dirname, `../${File.GUI_CONFIG}`),
        JSON.stringify(config, undefined, 2),
        (err) => {
          if (err) console.log(err)
        }
      )
    })

  setCommand
    .command('password')
    .arguments('<password>')
    .description('Set the GUI server password')
    .option('-h', 'Changes how the password is hashed. For internal use only')
    .action((password, options) => {
      if (!options.h) {
        password = crypto.createHash('sha256').update(password).digest('hex')
      }
      config.gui.pass = cryptoShardus.hash(password)
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFile(
        path.join(__dirname, `../${File.GUI_CONFIG}`),
        JSON.stringify(config, undefined, 2),
        (err) => {
          if (err) console.error(err)
        }
      )
    })
  gui
    .command('login')
    .arguments('<password>')
    .arguments('<ip>')
    .description('verify GUI password')
    .action((password: string, ip: string) => {
      let failedAttempts: FailedAttempt[] = config.gui.failedAttempts

      const attemptRecord = failedAttempts.find((record) => record.ip === ip)
      // Check if IP is already blocked
      if (attemptRecord && attemptRecord.count >= MAX_ATTEMPTS) {
        console.log(yaml.dump({ login: 'blocked' }))
        return
      }
      if (!timingSafeEqual(Buffer.from(password), Buffer.from(config.gui.pass))) {
        if (attemptRecord) {
          attemptRecord.count += 1
        } else {
          failedAttempts.push({ ip: ip, count: 1 })
        }
        // Write updated config to file
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFile(
          path.join(__dirname, `../${File.GUI_CONFIG}`),
          JSON.stringify(config, undefined, 2),
          (err) => {
            if (err) console.log(err)
          }
        )
        console.log(yaml.dump({ login: 'unauthorized' }))
        return
      }

      // Reset failed attempt count on successful login
      if (attemptRecord) {
        failedAttempts = failedAttempts.filter((record) => record.ip !== ip)
        config.gui.failedAttempts = failedAttempts

        // Write updated config to file
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFile(
          path.join(__dirname, `../${File.GUI_CONFIG}`),
          JSON.stringify(config, undefined, 2),
          (err) => {
            if (err) console.log(err)
          }
        )
      }

      console.log(yaml.dump({ login: 'authorized' }))
    })
  //fucntionality to check ip status of the user
  gui
    .command('ipStatus')
    .arguments('<ip>')
    .description('Check the status of the IP')
    .action((ip: string) => {
      const failedAttempts: FailedAttempt[] = config.gui.failedAttempts

      const attemptRecord = failedAttempts.find((record) => record.ip === ip)
      // Check if IP is already blocked
      if (attemptRecord && attemptRecord.count >= MAX_ATTEMPTS) {
        console.log(yaml.dump({ status: 'blocked' }))
        return
      }
      console.log(yaml.dump({ status: 'unblocked' }))
    })
  //functionality to unblock a ip with the input of the ip address from the gui.
  gui
    .command('unlock')
    .arguments('<ip>')
    .description('Unblock the IP')
    .action((ip: string) => {
      let failedAttempts: FailedAttempt[] = config.gui.failedAttempts
      failedAttempts = failedAttempts.filter((record) => record.ip !== ip)
      config.gui.failedAttempts = failedAttempts
      // Write updated config to file
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFile(
        path.join(__dirname, `../${File.GUI_CONFIG}`),
        JSON.stringify(config, undefined, 2),
        (err) => {
          if (err) console.log(err)
        }
      )
    })

  function startGui() {
    // Exec PM2 to start the GUI server
    return new Promise<void>((resolve, reject) =>
      pm2.connect((err) => {
        if (err) {
          console.error(err)
          reject('Unable to connect to PM2')
        }
        // Start next.js front end on port 3000
        pm2.start(
          {
            name: 'operator-gui',
            cwd: `${path.join(__dirname, '../../../gui')}`,
            script: 'npm',
            args: 'start',
            env: { PORT: `${config.gui.port}` },
          },
          (err) => {
            if (err) {
              console.error(err)
              reject('Unable to start GUI')
            }
            pm2.disconnect()
            resolve()
          }
        )
      })
    )
  }

  function stopGui() {
    return new Promise<void>((resolve, reject) => {
      pm2.connect((err) => {
        if (err) {
          console.error(err)
          reject('Unable to connect to PM2')
        }

        pm2.stop('operator-gui', (err) => {
          if (err) {
            console.log(err)
            reject('Unable to stop gui')
          }
          pm2.disconnect()
          resolve()
        })

        pm2.delete('operator-gui', (err) => {
          if (err) {
            console.log(err)
            reject('Unable to delete gui')
          }
          pm2.disconnect()
          resolve()
        })
      })
    })
  }
}
