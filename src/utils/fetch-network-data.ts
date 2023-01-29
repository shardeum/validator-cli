import {configType} from '../config/default-config';
import axios from 'axios';
import {BN} from 'ethereumjs-util';

export const networkAccount = '0'.repeat(64);

export async function getActiveNode(config: configType) {
  const archiverUrl = `http://${config.server.p2p.existingArchivers[0].ip}:${config.server.p2p.existingArchivers[0].port}/nodelist`;
  const nodeList = await axios
    .get(archiverUrl)
    .then(res => res.data)
    .catch(err => console.error(err));
  if (nodeList.nodeList === null) {
    throw new Error('Unable to fetch list of nodes in the network');
  }
  return nodeList.nodeList[
    Math.floor(Math.random() * nodeList.nodeList.length)
  ];
}

export async function fetchInitialParameters(config: configType) {
  const activeNode = await getActiveNode(config);
  const url = `http://${activeNode.ip}:${activeNode.port}/account/${networkAccount}?type=5`;
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
  const activeNode = await getActiveNode(config);
  const url = `http://${activeNode.ip}:${activeNode.port}/account/${nodePubKey}?type=9`;
  const nodeParams = await axios
    .get(url)
    .then(res => res.data)
    .catch(err => console.error(err));

  if (nodeParams.account === null) {
    throw new Error('Unable to fetch node params');
  }
  return nodeParams.account.data;
}

export async function fetchEOADetails(config: configType, eoaAddress: string) {
  const activeNode = await getActiveNode(config);
  const url = `http://${activeNode.ip}:${activeNode.port}/account/${eoaAddress}`;
  const eoaParams = await axios
    .get(url)
    .then(res => res.data)
    .catch(err => console.error(err));

  if (eoaParams.account === null) {
    throw new Error('Unable to fetch EOA params');
  }
  return eoaParams.account;
}

export async function getAccountInfoParams(
  config: configType,
  nodePubKey: string
) {
  const initParams = await fetchInitialParameters(config);
  const stakeRequired = new BN(initParams.stakeRequired, 16).toString();
  const nodeRewardAmount = new BN(initParams.nodeRewardAmount, 16);
  const nodeRewardInterval = new BN(initParams.nodeRewardInterval);

  let lockedStake, nodeActiveDuration, nominator;

  try {
    const nodeData = await fetchNodeParameters(config, nodePubKey);
    lockedStake = new BN(nodeData.stakeLock, 16);
    nodeActiveDuration = Date.now() - nodeData.rewardStartTime * 1000;
    nominator = nodeData.nominator;
  } catch (err) {
    lockedStake = new BN(0);
    nodeActiveDuration = 0;
    nominator = '';
  }

  const totalReward = nodeRewardAmount.mul(new BN(nodeActiveDuration));

  return {
    lockedStake,
    stakeRequired,
    nominator,
    accumulatedRewards: totalReward.div(nodeRewardInterval),
  };
}
