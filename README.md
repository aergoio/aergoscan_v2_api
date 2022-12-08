# Aergoscan 2.0 API

This is a REST API server implemented in Node.js using Express.

The server connects to an Elasticsearch cluster that contains Aergo blockchain metadata.
Indices are populated by [aergo-esindexer](https://github.com/aergoio/aergo-esindexer).

It offers the following REST endpoints:

```
/:chainId/mainBlockInfo
/:chainId/recentTransactions
/:chainId/txHistory
/:chainId/blocks
/:chainId/transactions
/:chainId/contractTx
/:chainId/existedTxTokenList
/:chainId/search
/:chainId/token
/:chainId/tokenTransfers
/:chainId/tokenHolder
/:chainId/nft
/:chainId/nftTransfers
/:chainId/nftHolder
/:chainId/nftInventory
/:chainId/nftGroupCountInventory
```

Custom search endpoints

```
/:chainId/transferStats
```

Search endpoints support the query params `q`, `sort`, `from` and `size`.
These are passed directly to elasticsearch.
For the documentation about `q`, see [this article](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html).

## DB Configuration
    DB schema:
        CREATE TABLE `token_list` (
            `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'idx',
            `network` varchar(10) DEFAULT NULL COMMENT 'main(mainnet), testnet(testnet), chain(alpah)',
            `type` varchar(4) DEFAULT NULL COMMENT 'ARC1, ARC2',
            `token_address` varchar(60) DEFAULT NULL COMMENT 'token address',
            `token_name` varchar(20) DEFAULT NULL COMMENT 'name',
            `token_symbol` varchar(20) DEFAULT NULL COMMENT 'symbol',
            `token_url` varchar(45) DEFAULT NULL COMMENT 'homepage',
            `token_image` varchar(200) DEFAULT NULL COMMENT 'image url',
            `status` varchar(10) DEFAULT NULL COMMENT 'request:1, view:2, confirm:3, reject:4',
            `is_view` char(1) DEFAULT NULL COMMENT 'view - Y/N',
            `author` varchar(45) DEFAULT NULL COMMENT 'admin',
            `email` varchar(45) DEFAULT NULL COMMENT 'email',
            `comment` text COMMENT 'comment',
            `regdate` datetime DEFAULT NULL COMMENT 'regitration date',
        PRIMARY KEY (`id`),
        KEY `uix-token_list_type` (`type`) USING BTREE
        ) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

    Create File : /.env
        SCAN_DB_HOST=host
        SCAN_DB_DATABASE=database
        SCAN_DB_USERNAME=user
        SCAN_DB_PASSWORD=password

## Docker Compose Build & Deploy
Available SELECTED_NETWORK: 'mainnet', 'testnet', 'alpha' and 'local'

    • testnet deploy (docker-compose-mainnet.yml, docker-compose-testnet.yml, docker-compose-alpha.yml, docker-compose-local).yml
	    ○ up
		#docker-compose -f docker-compose.yml -f docker-compose-testnet.yml up --build -d
        ○ down
		#docker-compose -f docker-compose.yml -f docker-compose-testnet.yml down

    • curl localhost:3000/testnet/v2