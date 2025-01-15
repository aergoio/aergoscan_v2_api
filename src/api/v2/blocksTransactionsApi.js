import express from 'express';

import { blocks, transactions, contractTx, internalOperations, contractCall, event } from '../../services/v2/blocksTransactionsService';

const apiV2 = express.Router({ mergeParams: true });

apiV2.route('/blocks').get(blocks);
apiV2.route('/transactions').get(transactions);
apiV2.route('/internalOperations').get(internalOperations);
apiV2.route('/contractCall').get(contractCall);
apiV2.route('/contractTx').get(contractTx);
apiV2.route('/event').get(event);

export default apiV2;
