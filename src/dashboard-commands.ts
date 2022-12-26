import {Command} from 'commander';
import path = require('path');
import {readFileSync} from 'fs';

const dashboardPackageJson = JSON.parse(
  readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
);

export function registerDashboardCommands(program: Command) {
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
      //TODO query min and latest version
    });
}
