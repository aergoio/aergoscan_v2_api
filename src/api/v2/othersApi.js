import express from 'express';

import {
    accounts,
    names,
    totalTokens,
    search,
    rewards,
    tokensPrice,
    existedTxTokenList,
    transferStats
} from '../../services/v2/othersService';

const apiV2 = express.Router({mergeParams: true});

apiV2.route('/accounts').get(accounts);
apiV2.route('/names').get(names);
apiV2.route('/totalTokens').get(totalTokens); //wait
apiV2.route('/search').get(search)
apiV2.route('/rewards').get(rewards)
apiV2.route('/tokensPrice').get(tokensPrice)

//-- 보유한/보유했던 토큰 리스트
apiV2.route('/existedTxTokenList').get(existedTxTokenList)

//-- Silvermine-scan
apiV2.route('/transferStats').get(transferStats)



export default apiV2