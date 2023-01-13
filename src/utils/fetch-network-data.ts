import {configType} from '../config/default-config';
import axios from 'axios';
import {BN} from 'ethereumjs-util';

export const networkAccount = '0'.repeat(64);

export async function fetchInitialParameters(config: configType) {
  const url = `http://${config.server.ip.externalIp}:${config.server.ip.externalPort}/account/${networkAccount}?type=5`;
  const initialParams = await axios
    .get(url)
    .then(res => res.data)
    .catch(err => console.error(err));
  if (initialParams.account === null) {
    throw new Error(
      'Node not active in the network. Unable to fetch initial params'
    );
  }
  return initialParams.account.data.current;
}

async function fetchNodeParameters(config: configType, nodePubKey: string) {
  const url = `http://${config.server.ip.externalIp}:${config.server.ip.externalPort}/account/${nodePubKey}?type=9`;
  const nodeParams = await axios
    .get(url)
    .then(res => res.data)
    .catch(err => console.error(err));

  // Check if node is still Inactive (Grey)
  if (nodeParams.account === null) {
    throw new Error(
      'Node not active in the network. Unable to fetch node params'
    );
  }
  return nodeParams.account.data;
}

export async function getLockedStake(config: configType, nodePubKey: string) {
  const nodeData = await fetchNodeParameters(config, nodePubKey);
  const lockedStake = new BN(nodeData.stakeLock, 16);
  return lockedStake;
}

export async function calculateCurrentRewards(
  config: configType,
  nodePubKey: string
) {
  const initParams = await fetchInitialParameters(config);
  const nodeData = await fetchNodeParameters(config, nodePubKey);
  const nodeRewardAmount = new BN(initParams.nodeRewardAmount, 16);
  const nodeRewardInterval = new BN(initParams.nodeRewardInterval);
  const nodeActiveDuration = Date.now() - nodeData.rewardStartTime * 1000;

  const totalReward = nodeRewardAmount.mul(new BN(nodeActiveDuration));
  return totalReward.div(nodeRewardInterval);
}
