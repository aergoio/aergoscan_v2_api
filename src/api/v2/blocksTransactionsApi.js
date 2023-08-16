import express from "express";

import {
    blocks,
    transactions,
    contractTx,
    txEvent,
    contractEvent,
} from "../../services/v2/blocksTransactionsService";

const apiV2 = express.Router({ mergeParams: true });

apiV2.route("/blocks").get(blocks);
apiV2.route("/transactions").get(transactions);
apiV2.route("/contractTx").get(contractTx);
apiV2.route("/txEvent").get(txEvent);
apiV2.route("/contractEvent").get(contractEvent);

export default apiV2;
