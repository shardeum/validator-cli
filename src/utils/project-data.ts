import axios from 'axios';
import path from 'path';
import fs from 'fs';
import {exec} from 'child_process';

const CLI_PROJECT_PATH = 'https://gitlab.com/shardeum/validator/cli/';
const GUI_PROJECT_PATH = 'https://gitlab.com/shardeum/validator/gui/';

const CLI_LOCAL_PATH = path.join(__dirname, '../../');
const GUI_LOCAL_PATH = path.join(__dirname, '../../../../gui');
const VALIDATOR_LOCAL_PATH = path.join(__dirname, '../../../../validator');

export async function getLatestCliVersion() {
  const packageJsonPath = `${CLI_PROJECT_PATH}-/raw/main/package.json`;
  const json = await axios.get<{version: string}>(packageJsonPath);
  return json.data.version;
}

export async function getLatestGuiVersion() {
  const packageJsonPath = `${GUI_PROJECT_PATH}-/raw/main/package.json`;
  const json = await axios.get<{version: string}>(packageJsonPath);
  return json.data.version;
}

export function getInstalledGuiVersion(): string | undefined {
  if (!isGuiInstalled()) {
    return;
  }
  const guiPackageJsonPath = path.join(GUI_LOCAL_PATH, '/package.json');
  const packageJson = JSON.parse(
    fs.readFileSync(guiPackageJsonPath).toString()
  );
  return packageJson.version;
}

export function getInstalledValidatorVersion(): string | undefined {
  if (!isValidatorInstalled()) {
    return;
  }
  const validatorPackageJsonPath = path.join(
    VALIDATOR_LOCAL_PATH,
    '/package.json'
  );
  const packageJson = JSON.parse(
    fs.readFileSync(validatorPackageJsonPath).toString()
  );
  return packageJson.version;
}

export function isGuiInstalled() {
  return fs.existsSync(GUI_LOCAL_PATH);
}

export function isValidatorInstalled() {
  return fs.existsSync(VALIDATOR_LOCAL_PATH);
}

export function getBranchNameForCLI() {
  return getBranchNameFor(CLI_LOCAL_PATH);
}

export function getBranchNameForGUI() {
  return getBranchNameFor(GUI_LOCAL_PATH);
}

export function getBranchNameForValidator() {
  return getBranchNameFor(VALIDATOR_LOCAL_PATH);
}

const getBranchNameFor = (dirPath: string): Promise<string> =>
  new Promise(resolve => {
    // eslint-disable-next-line security/detect-child-process
    exec(
      `git -C ${path.join(dirPath)} branch --show-current`,
      (error, stdout) => resolve(!error ? stdout.trim() : 'unknown')
    );
  });
