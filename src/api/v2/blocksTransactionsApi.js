import express from "express";

import {
    blocks,
    transactions,
    contractTx,
} from "../../services/v2/blocksTransactionsService";

const apiV2 = express.Router({ mergeParams: true });

apiV2.route("/blocks").get(blocks);
apiV2.route("/transactions").get(transactions);
apiV2.route("/contractTx").get(contractTx);

export default apiV2;
