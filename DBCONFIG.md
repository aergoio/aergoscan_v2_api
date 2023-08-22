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
