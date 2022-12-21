# Aergoscan 2.0 API

This is a REST API server implemented in Node.js using Express.

The server connects to an Elasticsearch cluster that contains Aergo blockchain metadata.
Indices are populated by [aergo-indexer-2.0](https://github.com/aergoio/aergo-indexer-2.0).

It offers the following REST endpoints:

```
/:chainId/v2/chainInfo
/:chainId/v2/maxTokens
/:chainId/v2/bestBlock

/:chainId/v2/blocks
/:chainId/v2/transactions
/:chainId/v2/contractTx

/:chainId/v2/txHistory
/:chainId/v2/mainBlockInfo
/:chainId/v2/RecentTransactions

/:chainId/v2/accounts
/:chainId/v2/names
/:chainId/v2/totalTokens
/:chainId/v2/search
/:chainId/v2/rewards
/:chainId/v2/tokensPrice
/:chainId/v2/existedTxTokenList

/:chainId/v2/token
/:chainId/v2/nft
/:chainId/v2/tokenTransfers
/:chainId/v2/nftTransfers
/:chainId/v2/tokenHolder
/:chainId/v2/nftHolder
/:chainId/v2/tokenBalance
/:chainId/v2/nftInventory
/:chainId/v2/nftGroupCountInventory
```

Search endpoints support the query params `q`, `sort`, `from` and `size`.
These are passed directly to elasticsearch.
For the documentation about `q`, see [this article](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html).

## Authorized Token/NFT
See [DBCONFIG.MD](https://github.com/aergoio/aergoscan_v2_api/blob/develop/DBCONFIG.md)

## Docker-Compose Build & Deploy
Available SELECTED_NETWORK: 'mainnet', 'testnet', 'alpha' and 'local'

        • local deploy
            ○ up
                #sudo docker-compose -f docker-compose.yml -f docker-compose-local.yml up --build -d
            ○ down
                #sudo docker-compose -f docker-compose.yml -f docker-compose-local.yml down
	
        • mainnet deploy
            ○ up
                #sudo docker-compose -f docker-compose.yml -f docker-compose-mainnet.yml up --build -d
            ○ down
                #sudo docker-compose -f docker-compose.yml -f docker-compose-mainnet.yml down
		
	    • testnet deploy
            ○ up
                #sudo docker-compose -f docker-compose.yml -f docker-compose-testnet.yml up --build -d
            ○ down
                #sudo docker-compose -f docker-compose.yml -f docker-compose-testnet.yml down

	    • alpha deploy
            ○ up
                #sudo docker-compose-f docker-compose.yml  -f docker-compose-alpha.yml up --build -d
            ○ down
                #sudo docker-compose -f docker-compose.yml -f docker-compose-alpha.yml down

        • curl localhost:3000/testnet/v2