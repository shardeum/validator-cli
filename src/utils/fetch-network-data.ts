import {configType} from '../config/default-config';
import axios from 'axios';
import {BN} from 'ethereumjs-util';

export const networkAccount = '0'.repeat(64);
let savedActiveNode: {
  id: string;
  ip: string;
  port: string;
  publicKey: string;
};

async function fetchDataFromNetwork(
  config: configType,
  query: string,
  callback: (response: {[id: string]: string}) => boolean
) {
  let retries = 3;
  if (savedActiveNode === undefined) {
    await getActiveNode(config);
  }

  const url = `http://${savedActiveNode.ip}:${savedActiveNode.port}` + query;
  let data = await axios
    .get(url)
    .then(res => res.data)
    .catch(err => console.error(err));

  while (callback(data) && retries--) {
    getActiveNode(config);

    const url = `http://${savedActiveNode.ip}:${savedActiveNode.port}` + query;
    data = await axios
      .get(url)
      .then(res => res.data)
      .catch(err => console.error(err));
  }

  return data;
}

export async function getActiveNode(config: configType) {
  const archiverUrl = `http://${config.server.p2p.existingArchivers[0].ip}:${config.server.p2p.existingArchivers[0].port}/nodelist`;
  const nodeList = await axios
    .get(archiverUrl)
    .then(res => res.data)
    .catch(err => console.error(err));
  if (nodeList.nodeList === null) {
    throw new Error('Unable to fetch list of nodes in the network');
  }
  savedActiveNode =
    nodeList.nodeList[Math.floor(Math.random() * nodeList.nodeList.length)];
}

export async function fetchInitialParameters(config: configType) {
  const initialParams = await fetchDataFromNetwork(
    config,
    `/account/${networkAccount}?type=5`,
    data => data.account === null
  );

  const response = initialParams.account.data.current;
  const stakeRequired = new BN(response.stakeRequired, 16).toString();
  const nodeRewardAmount = new BN(response.nodeRewardAmount, 16);
  const nodeRewardInterval = new BN(response.nodeRewardInterval);

  return {stakeRequired, nodeRewardAmount, nodeRewardInterval};
}

async function fetchNodeParameters(config: configType, nodePubKey: string) {
  const nodeParams = await fetchDataFromNetwork(
    config,
    `/account/${nodePubKey}?type=9`,
    data => data.account === null
  );

  return nodeParams.account.data;
}

export async function fetchEOADetails(config: configType, eoaAddress: string) {
  const eoaParams = await fetchDataFromNetwork(
    config,
    `/account/${eoaAddress}`,
    data => data.account === null
  );

  return eoaParams.account;
}

export async function getAccountInfoParams(
  config: configType,
  nodePubKey: string
) {
  // prettier-ignore
  const {
    stakeRequired,
    nodeRewardAmount,
    nodeRewardInterval,
  } = await fetchInitialParameters(config);

  let lockedStake, nodeActiveDuration, nominator;

  try {
    const nodeData = await fetchNodeParameters(config, nodePubKey);
    lockedStake = new BN(nodeData.stakeLock, 16).toString();
    nodeActiveDuration = Date.now() - nodeData.rewardStartTime * 1000;
    nominator = nodeData.nominator;
  } catch (err) {
    lockedStake = new BN(0).toString();
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
