import axios from 'axios';

const CLI_PROJECT_PATH = 'https://gitlab.com/shardeum/validator/cli/';

export async function getLatestCliVersion() {
  const packageJsonPath = `${CLI_PROJECT_PATH}-/raw/main/package.json`;
  const json = await axios.get<{version: string}>(packageJsonPath);
  return json.data.version;
}
