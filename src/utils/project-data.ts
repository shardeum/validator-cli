import axios from 'axios';
import path from 'path';
import fs from 'fs';

const CLI_PROJECT_PATH = 'https://gitlab.com/shardeum/validator/cli/';
const GUI_PROJECT_PATH = 'https://gitlab.com/shardeum/validator/gui/';

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
  const guiPackageJsonPath = path.join(
    __dirname,
    '../../../../gui/package.json'
  );
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
    __dirname,
    '../../../../validator/package.json'
  );
  const packageJson = JSON.parse(
    fs.readFileSync(validatorPackageJsonPath).toString()
  );
  return packageJson.version;
}

export function isGuiInstalled() {
  return fs.existsSync(path.join(__dirname, '../../../../gui'));
}

export function isValidatorInstalled() {
  return fs.existsSync(path.join(__dirname, '../../../../validator'));
}
