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
      state: 'null',
      totalTimeValidating: 0,
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
  const totalTimeValidating =
    startData.startTime < lastActiveTimeSafe ? nodeProgress.totalActiveTime : 0;

  const LastActiveDate = new Date(lastActiveTimeSafe);
  const validatingDuration = new Date(0);
  validatingDuration.setMilliseconds(totalTimeValidating);

  return {
    state: nodeProgress.nodeInfo.status,
    totalTimeValidating: validatingDuration.toISOString().substring(11, 19),
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
  return fs.existsSync(path.join(__dirname, `../../logs/${logName}`));
}

function fetchFromLog(logName: string) {
  if (!validatorLogExists(logName)) {
    return null;
  }
  const logData = path.join(__dirname, `../../logs/${logName}`);
  return JSON.parse(fs.readFileSync(logData).toString());
}
