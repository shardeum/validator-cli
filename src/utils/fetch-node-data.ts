import path from 'path';
import fs from 'fs';
import {nodeProgressType} from '../config/default-config';

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
      totalTimeValidating: 0,
      lastActive: '',
      lastRotationIndex: '',
      nodeInfo: '',
    };
  }

  const startData = fetchFromLog('start-summary.json');
  const totalTimeValidating =
    startData.startTime < nodeProgress.lastActiveTime
      ? nodeProgress.totalActiveTime
      : 0;

  return {
    state: nodeProgress.nodeInfo.status,
    totalTimeValidating: totalTimeValidating,
    lastActive: nodeProgress.lastActiveTime,
    lastRotationIndex: `${nodeProgress.lastRotationIndex.idx}/${nodeProgress.lastRotationIndex.total}`,
    nodeInfo: nodeProgress.nodeInfo,
  };
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
