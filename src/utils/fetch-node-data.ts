import path from 'path';
import fs from 'fs';
import {nodeProgressType} from '../config/default-network-config';

export function fetchExitSummary() {
  return fetchFromLog('exit-summary.json');
}

export function fetchStartSummary() {
  return fetchFromLog('start-summary.json');
}

export async function fetchNodeProgress(): Promise<nodeProgressType | null> {
  return fetchFromLog('node-progress.json');
}

export async function getExitInformation() {
  const exitSummary = fetchExitSummary();
  const startSummary = fetchStartSummary();
  // don't show exit reason if the validator is running or was never started
  const showExitReason =
    exitSummary?.exitTime > startSummary?.startTime ||
    (startSummary?.startTime === null && exitSummary?.exitTime !== null);
  const exitMessage = showExitReason ? exitSummary?.message : undefined;
  const exitStatus = showExitReason ? exitSummary?.status : undefined;
  return {exitMessage, exitStatus};
}

export function getProgressData(nodeProgress: nodeProgressType | null) {
  if (!nodeProgress) {
    return {
      state: 'standby',
      totalTimeValidating: '00:00:00',
      lastActive: '',
      lastRotationIndex: '',
      nodeInfo: '',
    };
  }

  const lastRotationIndexSafe = nodeProgress.lastRotationIndex ?? {
    idx: 0,
    total: 0,
  };
  const lastActiveTimeSafe = nodeProgress.lastActiveTime ?? 0;

  const startData = fetchFromLog('start-summary.json');

  if (
    startData.startTime >
    fs.statSync(path.join(__dirname, `../../logs/node-progress.json`)).mtimeMs
  ) {
    nodeProgress.totalActiveTime = 0;
    nodeProgress.nodeInfo.status = 'standby';
  }

  const LastActiveDate = new Date(lastActiveTimeSafe);

  return {
    state: nodeProgress.nodeInfo.status,
    totalTimeValidating: convertMsToDHM(nodeProgress.totalActiveTime),
    lastActive: lastActiveTimeSafe
      ? `${LastActiveDate.toDateString()} ${LastActiveDate.toTimeString()}`
      : '',
    lastRotationIndex: `${lastRotationIndexSafe.idx}/${lastRotationIndexSafe.total}`,
    nodeInfo: nodeProgress.nodeInfo,
  };
}

export function getNodeSettings() {
  if (!fs.existsSync(path.join(__dirname, `../../nodeConfig.json`))) {
    return null;
  }

  const settingsData = path.join(__dirname, `../../nodeConfig.json`);
  return JSON.parse(fs.readFileSync(settingsData).toString());
}

function validatorLogExists(logName: string) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs.existsSync(path.join(__dirname, `../../logs/${logName}`));
}

function fetchFromLog(logName: string) {
  if (!validatorLogExists(logName)) {
    return null;
  }
  const logData = path.join(__dirname, `../../logs/${logName}`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return JSON.parse(fs.readFileSync(logData).toString());
}

function convertMsToDHM(ms: number): string {
  if (ms === 0) return '00:00:00';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;

  const daysString = days > 0 ? `${days} Days ` : '';
  const hoursString = remainingHours > 0 ? `${remainingHours} Hours ` : '';
  const minutesString =
    remainingMinutes > 0 ? `${remainingMinutes} Minutes` : '';

  return `${daysString}${hoursString}${minutesString}`;
}
