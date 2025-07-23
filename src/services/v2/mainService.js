import { schedulerDataCache } from '../../caches/caches'
import { heraGrpcProvider } from '../herajs'
import { Contract } from '@herajs/client'
import { Amount } from '@herajs/common'

/**
 * txHistory
 */
const txHistory = async (req, res, next) => {
  console.log('txHistory!!')
  try {
    // if(!schedulerDataCache.has('txHistory')){
    //-- CachedTxHistory 에 있는 함수랑 같음.
    const [txPerDay] = await Promise.all([
      req.apiClient.aggregateBlocks({ gte: 'now-13d/d', lte: 'now' }, '1d'),
    ])

    schedulerDataCache.set('txHistory_' + process.env.SELECTED_NETWORK, {
      txPerDay,
    })
    // }

    // return res.json(schedulerDataCache.get('txHistory_'+process.env.SELECTED_NETWORK));
    return res.json({
      txPerDay,
    })
  } catch (e) {
    console.log('........' + e)
    return res.json({ error: e })
  }
}

/**
 * CachedSchedule - txHistory
 * key list - ['mainBlockInfo_main', 'recentTransactions_main', 'txHistory_main']
 * key list - ['mainBlockInfo_testnet, 'recentTransactions_testnet', 'txHistory_testnet']
 * key list - ['mainBlockInfo_alpha', 'recentTransactions_alpha', 'txHistory_alpha']
 */
const CachedTxHistory = async (req, res, next) => {
  // console.log('CachedTxHistory!!');
  // console.log('qeury = '+req.query);
  try {
    const [txPerDay] = await Promise.all([
      req.apiClient.aggregateBlocks({ gte: 'now-30d/d', lte: 'now' }, '1d'),
    ])

    schedulerDataCache.set(req.query.key, {
      txPerDay,
    })

    return res.json({
      txPerDay,
    })
  } catch (e) {
    return res.json({ error: e })
  }
}

/**
 * txTotal, maxTps, maxTpm
 *  - BP number, Latest Block - hera 에서 가져옴
 */
const mainBlockInfo = async (req, res, next) => {
  // console.log('mainBlockInfo!!');
  try {
    return res.json(
      schedulerDataCache.get('mainBlockInfo_' + process.env.SELECTED_NETWORK)
    )
  } catch (e) {
    return res.json({ error: e })
  }
}

/**
 * CachedSchedule - CacehMainBlockInfo
 * key list - ['mainBlockInfo_main', 'recentTransactions_main', 'txHistory_main']
 * key list - ['mainBlockInfo_testnet, 'recentTransactions_testnet', 'txHistory_testnet']
 * key list - ['mainBlockInfo_alpha', 'recentTransactions_alpha', 'txHistory_alpha']
 */
const CachedMainBlockInfo = async (req, res, next) => {
  // apiRouterV2.route('/CachedMainBlockInfo').get(routeCache.cacheSeconds(5), async (req, res) => {
  // apiRouterV2.route('/CachedMainBlockInfo').get(async (req, res) => {
  // console.log('CachedMainBlockInfo!!');
  // console.log('CachedMainBlockInfo!!' + JSON.stringify(req.query.key));
  try {
    const [
      // txPerMonth,
      txTotal,
      maxTps,
      maxTpm,
      blockCount,
    ] = await Promise.all([
      // req.apiClient.aggregateBlocks({ gte: "now-10y/y", lt: "now" }, "1M"),
      req.apiClient.getTxCount(),

      req.apiClient.searchBlock(
        {
          body: {
            size: 1,
            sort: {
              txs: { order: 'desc' },
            },
          },
        },
        true
      ),
      req.apiClient.getBestBlock(),
      req.apiClient.getBlockCount(),
    ])
    // const txTotal = txPerMonth.map(day => day.sum_txs.value).reduce((a, b) => a + b, 0);

    schedulerDataCache.set(req.query.key, {
      blockCount,
      txTotal,
      maxTps,
      maxTpm,
    })

    return res.json({
      blockCount,
      txTotal,
      maxTps,
      maxTpm,
    })

    /*
        const [
            // txPerMonth,
            txTotal,
            blockCount,

            // maxTps
            maxTpm  //txPerMinute
        ] = await Promise.all([
            req.apiClient.getTxCount(),
            req.apiClient.getBlockCount(), // height가 안맞네


            req.apiClient.searchBlock({
                body: {
                    size: 1,
                    sort: {
                        txs: { "order" : "desc" }
                    },
                }
            }, true),


            // req.apiClient.aggregateBlocks({ gte: "now-60m/m", lt: "now" }, "1m")
            req.apiClient.aggregateBlocks({ gte: "now-30d/d", lt: "now" }, "1d"),
        ]);

        schedulerDataCache.set(req.query.key, {
            txTotal,
            blockCount,
            maxTpm
            // maxTps

        })

        return res.json({
            txTotal,
            blockCount,
            maxTpm
            // maxTps

        })
        */
  } catch (e) {
    return res.json({ error: e })
  }
}

/**
 * Recent transactions
 */
const RecentTransactions = async (req, res, next) => {
  // console.log('recentTransactions!!');
  try {
    // return res.json(schedulerDataCache.get('recentTransactions_'+req.params.chainId));
    return res.json(
      schedulerDataCache.get(
        'recentTransactions_' + process.env.SELECTED_NETWORK
      )
    )
  } catch (e) {
    return res.json({ error: e })
  }
}

/**
 * CachedSchedule - recentTransactions
 * key list - ['mainBlockInfo_main', 'recentTransactions_main', 'txHistory_main']
 * key list - ['mainBlockInfo_testnet, 'recentTransactions_testnet', 'txHistory_testnet']
 * key list - ['mainBlockInfo_alpha', 'recentTransactions_alpha', 'txHistory_alpha']
 */
const CachedRecentTransactions = async (req, res, next) => {
  // apiRouterV2.route('/CachedRecentTransactions').get(routeCache.cacheSeconds(5), async (req, res) => {
  // apiRouterV2.route('/CachedRecentTransactions').get(async (req, res) => {
  //     console.log('CachedRecentTransactions!!');
  try {
    const txList = await req.apiClient.searchTransactions({
      match_all: {},
    })

    schedulerDataCache.set(req.query.key, {
      txList,
    })

    // console.log(CachedSchedule.get('recentTransactions_'+req.params.chainId));

    return res.json({
      txList,
    })
  } catch (e) {
    return res.json({ error: e })
  }
}

/**
 * @fileoverview Provides gRPC data from Hera.js with direct database bypassing.
 * @description This module handles blockchain-related data
 * by directly interacting with Hera.js gRPC client.
 */

/**
 * Fetch datas from the blockchain network.
 * Bypasses the database and directly retrieves data from the gRPC client.
 */

const peers = async (req, res) => {
  console.log('peers url : ' + req.url)

  let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)
  try {
    let peers = await aergoClientType.getPeers()

    return res.json(peers)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

const chainInfo = async (req, res) => {
  console.log('chainInfo url : ' + req.url)

  let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)
  try {
    let chainInfo = await aergoClientType.getChainInfo()

    return res.json(chainInfo)
  } catch (e) {
    return res.json({ error: e })
  }
}

const serverInfo = async (req, res) => {
  console.log('serverInfo url : ' + req.url)

  let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)
  try {
    let serverInfo = await aergoClientType.getServerInfo()
    const formattedServerInfo = {
      configMap: Array.from(serverInfo.configMap.entries()), // Map -> Array 변환
      statusMap: Array.from(serverInfo.statusMap.entries()), // Map -> Array 변환
    }

    return res.json(formattedServerInfo)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

const nameInfo = async (req, res) => {
  console.log('chainInfo url : ' + req.url)
  const name = req.query.name
  if (!name) {
    return res.status(400).json({ error: 'Name parameter is required' })
  }
  let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)
  try {
    let nameInfo = await aergoClientType.getNameInfo(name)

    return res.json(nameInfo)
  } catch (e) {
    return res.json({ error: e })
  }
}

const consensusInfo = async (req, res) => {
  console.log('consensusInfo url : ' + req.url)

  let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)
  try {
    let consensusInfo = await aergoClientType.getConsensusInfo()

    return res.json(consensusInfo)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

const bestBlock = async (req, res) => {
  console.log('bestBlock url : ' + req.url)

  let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)
  try {
    let bestBlock = await aergoClientType.blockchain()

    return res.json(bestBlock)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

const accountState = async (req, res) => {
  console.log('accountState url : ' + req.url)
  const address = req.query.address
  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' })
  }
  let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)

  try {
    let accountState = await aergoClientType.getState(address)

    return res.json(accountState)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

const staking = async (req, res) => {
  console.log('staking url : ' + req.url)
  const address = req.query.address
  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' })
  }
  let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)

  try {
    let staking = await aergoClientType.getStaking(address)

    return res.json(staking)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

const block = async (req, res) => {
  console.log('block url : ' + req.url)
  const blockNoOrHash = req.query.blockNoOrHash
  if (!blockNoOrHash) {
    return res
      .status(400)
      .json({ error: 'blockNoOrHash parameter is required' })
  }
  let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)

  try {
    let block = await aergoClientType.getBlock(blockNoOrHash)

    return res.json(block)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

const blockMetadata = async (req, res) => {
  console.log('blockMetadata url : ' + req.url)
  const blockNo = parseInt(req.query.blockNo, 10)
  if (!blockNo || isNaN(blockNo)) {
    return res.status(400).json({ error: 'blockNo must be a valid number' })
  }
  let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)

  try {
    let blockMetaData = await aergoClientType.getBlockMetadata(blockNo)

    return res.json(blockMetaData)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

const accountVotes = async (req, res) => {
  console.log('accountVotes url : ' + req.url)
  const address = req.query.address
  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' })
  }
  let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)

  try {
    let accountVotes = await aergoClientType.getAccountVotes(address)
    accountVotes = {
      ...accountVotes,
      totalVotingPower: accountVotes
        .getVotingList()
        .map((vote) => new Amount(vote.getAmount(), 'aer'))
        .reduce((a, b) => a.add(b), new Amount(0))
        .formatNumber('aergo'),
    }

    return res.json(accountVotes)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

const topVotes = async (req, res) => {
  console.log('topVotes url : ' + req.url)
  const count = req.query.count
  if (!count) {
    return res.status(400).json({ error: 'Count parameter is required' })
  }
  let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)

  try {
    let topVotes = await aergoClientType.getTopVotes(count)

    return res.json(topVotes)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

const abi = async (req, res) => {
  console.log('getABI url : ' + req.url)
  const address = req.query.address
  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' })
  }
  let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)

  try {
    let abi = await aergoClientType.getABI(address)

    return res.json(abi)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

const transactionReceipt = async (req, res) => {
  console.log('transactionReceipt url : ' + req.url)
  const hash = req.query.hash
  if (!hash) {
    return res.status(400).json({ error: 'hash parameter is required' })
  }
  let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)

  try {
    let transactionReceipt = await aergoClientType.getTransactionReceipt(hash)

    return res.json(transactionReceipt)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

const queryContract = async (req, res) => {
  try {
    const { address, name, args } = req.body
    const aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)
    const abi = await aergoClientType.getABI(address)

    if (!address || !name) {
      return res.status(400).json({
        error: "Missing required parameters: 'abi', 'address', or 'name'",
      })
    }
    const contract = Contract.fromAbi(abi).setAddress(address)
    const result = await aergoClientType.queryContract(
      contract[name](...(args || []))
    )

    return res.status(200).json(result)
  } catch (error) {
    console.error('[Error querying contract]:', error)
    return res.status(500).json({
      error: error.message || 'Internal Server Error',
    })
  }
}

const queryContractState = async (req, res) => {
  try {
    const { address, stateNames } = req.body

    if (!address || !stateNames) {
      return res.status(400).json({
        error: "Missing or invalid parameters: 'address' or 'stateNames'",
      })
    }

    const aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK)

    const variables =
      Array.isArray(stateNames) && stateNames.length === 1
        ? stateNames[0]
        : stateNames

    const result = await aergoClientType.queryContractState(address, variables)

    return res.status(200).json(result)
  } catch (error) {
    console.error('[Error querying contract]:', error)
    return res.status(500).json({
      error: error.message || 'Internal Server Error',
    })
  }
}

export {
  txHistory,
  CachedTxHistory,
  mainBlockInfo,
  CachedMainBlockInfo,
  RecentTransactions,
  CachedRecentTransactions,
  peers,
  serverInfo,
  chainInfo,
  nameInfo,
  consensusInfo,
  bestBlock,
  accountState,
  staking,
  block,
  blockMetadata,
  accountVotes,
  topVotes,
  abi,
  transactionReceipt,
  queryContract,
  queryContractState,
}
