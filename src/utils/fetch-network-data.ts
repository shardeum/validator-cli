import {configType} from '../config/default-network-config';
import axios from 'axios';
import {BN} from 'ethereumjs-util';
import {Pm2ProcessStatus, statusFromPM2} from '../pm2';

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
    try {
      getActiveNode(config);
    } catch (e) {
      continue;
    }

    const url = `http://${savedActiveNode.ip}:${savedActiveNode.port}` + query;
    data = await axios
      .get(url)
      .then(res => res.data)
      .catch(err => console.error(err));
  }

  return data;
}

export async function getActiveNode(config: configType) {
  const randomArchiver =
    config.server.p2p.existingArchivers[
      Math.floor(Math.random() * config.server.p2p.existingArchivers.length)
    ];
  const archiverUrl = `http://${randomArchiver.ip}:${randomArchiver.port}/nodelist`;
  const nodeList = await axios
    .get(archiverUrl)
    .then(res => res.data)
    .catch(err => console.error(err));
  if (!nodeList?.nodeList) {
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
  const nodeRewardAmount = new BN(response.nodeRewardAmountUsd, 16);
  const nodeRewardInterval = new BN(response.nodeRewardInterval);

  return {nodeRewardAmount, nodeRewardInterval};
}

async function fetchNodeParameters(config: configType, nodePubKey: string) {
  const nodeParams = await fetchDataFromNetwork(
    config,
    `/account/${nodePubKey}?type=9`,
    data => data.account === null
  );

  return nodeParams.account.data;
}

async function fetchNodeLoad(config: configType) {
  const url = `http://${config.server.ip.externalIp}:${config.server.ip.externalPort}/load`;
  const nodeLoad = await axios.get(url);

  if (nodeLoad === null || nodeLoad.data === null) {
    throw new Error(
      'Node not active in the network. Unable to fetch node load'
    );
  }
  return nodeLoad.data;
}

async function fetchNodeTxStats(config: configType) {
  const url = `http://${config.server.ip.externalIp}:${config.server.ip.externalPort}/tx-stats`;
  const txStats = await axios.get(url);

  if (txStats === null || txStats.data === null) {
    throw new Error(
      'Node not active in the network. Unable to fetch node tx-stats'
    );
  }
  return txStats.data;
}

export async function fetchNodeInfo(config: configType) {
  const url = `http://${config.server.ip.externalIp}:${config.server.ip.externalPort}/nodeinfo`;
  const nodeInfo = await axios
    .get(url, {timeout: 2000})
    .then(res => res.data)
    .catch(res => console.error(res));

  if (nodeInfo === null || nodeInfo.nodeInfo === null) {
    throw new Error(
      'Node not active in the network. Unable to fetch node-info'
    );
  }

  return nodeInfo.data.nodeInfo;
}

async function fetchNetworkStats(config: configType) {
  const networkStats = await fetchDataFromNetwork(
    config,
    '/network-stats',
    data => data === null
  );

  if (networkStats === null) {
    throw new Error('Unable to fetch network-stats');
  }
  return networkStats;
}

export async function getNetworkParams(config: configType) {
  const networkStats = await fetchNetworkStats(config);
  let result = {...networkStats};
  try {
    const status: Pm2ProcessStatus = statusFromPM2(config);
    if (status?.status && status.status !== 'stopped') {
      const nodeLoad = await fetchNodeLoad(config);
      const nodeTxStats = await fetchNodeTxStats(config);
      result = {...result, ...nodeLoad, ...nodeTxStats};
    }
  } catch (e) {
    console.error(e);
  }
  return result;
}

export async function fetchEOADetails(config: configType, eoaAddress: string) {
  const eoaParams = await fetchDataFromNetwork(
    config,
    `/account/${eoaAddress}`,
    data => data.account === null
  );

  return eoaParams.account;
}

export async function fetchValidatorVersions(config: configType) {
  const validatorVersions = await fetchDataFromNetwork(
    config,
    '/nodeinfo',
    data => data === null
  );

  return validatorVersions.nodeInfo.appData;
}

export async function getAccountInfoParams(
  config: configType,
  nodePubKey: string
) {
  // prettier-ignore
  const {
    nodeRewardAmount,
    nodeRewardInterval
  } = await fetchInitialParameters(config);

  let lockedStake, nodeActiveDuration, nominator;

  try {
    const nodeData = await fetchNodeParameters(config, nodePubKey);
    lockedStake = new BN(nodeData.stakeLock, 16).toString();
    const startTime = nodeData.rewardStartTime * 1000;
    const endTime = nodeData.rewardEndTime * 1000;

    if (startTime > 0 && endTime === 0) {
      // Node is earning rewards
      nodeActiveDuration = Date.now() - startTime;
    } else if (startTime > 0 && endTime > 0) {
      // Node has earned rewards but is in standby
      nodeActiveDuration = endTime - startTime;
    } else if (startTime === 0 && endTime === 0) {
      // Node has not earned rewards and is in standby
      nodeActiveDuration = 0;
    } else {
      nodeActiveDuration = 0;
    }
    nominator = nodeData.nominator;
  } catch (err) {
    lockedStake = new BN(0).toString();
    nodeActiveDuration = 0;
    nominator = '';
  }

  const totalReward = nodeRewardAmount.mul(new BN(nodeActiveDuration));

  return {
    lockedStake,
    nominator,
    accumulatedRewards: totalReward.div(nodeRewardInterval),
  };
}

export async function fetchStakeParameters(config: configType) {
  const stakeParams = await fetchDataFromNetwork(
    config,
    '/stake',
    data => !data
  );

  const stakeRequired = new BN(stakeParams.stakeRequired, 16).toString();
  return {
    stakeRequired,
  };
}
