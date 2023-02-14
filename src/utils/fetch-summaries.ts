import path from 'path';
import fs from 'fs';

export async function fetchExitSummary() {
  return fetchFromLog('exit-summary.json');
}

export async function fetchStartSummary() {
  return fetchFromLog('start-summary.json');
}

export async function getExitInformation() {
  const exitSummary = await fetchExitSummary();
  const startSummary = await fetchStartSummary();
  // don't show exit reason if the validator is running or was never started
  const showExitReason = exitSummary?.exitTime > startSummary?.startTime;
  const exitMessage = showExitReason ? exitSummary?.message : undefined;
  const exitStatus = showExitReason ? exitSummary?.status : undefined;
  return {exitMessage, exitStatus};
}

function validatorLogExists(logName: string) {
  return fs.existsSync(path.join(__dirname, `../../logs/${logName}`));
}

async function fetchFromLog(logName: string) {
  if (!validatorLogExists(logName)) {
    return null;
  }
  const exitSummaryPath = path.join(__dirname, `../../logs/${logName}`);
  return JSON.parse(fs.readFileSync(exitSummaryPath).toString());
}
