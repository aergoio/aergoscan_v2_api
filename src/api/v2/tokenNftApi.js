import express from "express";

import {
    token,
    nft,
    tokenNftTransfers,
    tokenNftHolder,
    tokenNftBalance,
    nftInventory,
    nftGroupCountInventory,
} from "../../services/v2/tokenNftService";

const apiV2 = express.Router({ mergeParams: true });

apiV2.route("/token").get(token);
apiV2.route("/nft").get(nft);
apiV2.route("/tokenTransfers|nftTransfers").get(tokenNftTransfers);
apiV2.route("/tokenHolder|nftHolder").get(tokenNftHolder);
apiV2.route("/tokenBalance").get(tokenNftBalance); // |nftBalance - 사용 안함
apiV2.route("/nftInventory").get(nftInventory);
apiV2.route("/nftGroupCountInventory").get(nftGroupCountInventory);

export default apiV2;
