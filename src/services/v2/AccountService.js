import { getCachedToken } from "../../caches/caches";


/**
 * 삭제예정
 */
const accountTokens = async (req, res, next) => {
    try {
        async function makeQuery(value) {
            const result = await req.apiClient.searchTokenTransfersRaw({
                match: {
                    to: {
                        query: value
                    }
                }
            }, {
                size: 0,
                aggs: {
                    address_unique: {
                        terms: {
                            field: 'address',
                            size: 100,
                            order: { max_blockno: 'desc' }
                        },
                        aggs: {
                            transfer: { top_hits: {
                                    size: 1,
                                    sort: { blockno: 'desc' },
                                    _source: { include: ['ts', 'blockno', 'tx_id'] }
                                }},
                            max_blockno: {
                                max: {
                                    field: "blockno"
                                }
                            }
                        }
                    }
                }
            }, {
                filterPath: [
                    'aggregations.address_unique.buckets.key',
                    'aggregations.address_unique.buckets.doc_count',
                    'aggregations.address_unique.buckets.transfer.hits.hits._source.ts',
                    'aggregations.address_unique.buckets.transfer.hits.hits._source.blockno',
                    'aggregations.address_unique.buckets.transfer.hits.hits._source.tx_id',
                ],
            })
            if (!result.aggregations) return [];
            console.log('aggregation = ' + JSON.stringify(result.aggregations));
            return result.aggregations.address_unique.buckets;
        }

        async function convBucket(bucket) {
            console.log('convBucket = '+JSON.stringify(bucket));

            const token = await getCachedToken(req.apiClient, bucket.key);
            if (!token) return null;
            return {
                ...bucket,
                token,
                transfer: bucket.transfer.hits.hits[0]._source
            }
        }

        async function convBucketContract(bucket) {
            console.log('convBucket = '+JSON.stringify(bucket));

            console.log('req query (contract) = '+ req.query.contract);

            const token = await getCachedToken(req.apiClient, bucket.key);
            if (!token) return null;
            return {
                ...bucket,
                token,
                transfer: bucket.transfer.hits.hits[0]._source
            }
        }

        const sort = 'max_blockno';
        let results = await makeQuery(req.query.address);
        // const mapped = await Promise.all(results.map(convBucket));

        let mapped;
        if(req.query.contract){
            console.log("......exist contract");
            for(let i = 0; i < results.length; i++){
                if(req.query.contract == results.key) {
                    console.log("............results[i] = " + results[i]);
                    results = results[i]
                    results = results[i]
                }
            }
            mapped = await Promise.all(results.map(convBucketContract));
        }else{
            console.log("......not exist contract");
            mapped = await Promise.all(results.map(convBucket));
        }


        return res.json({ objects: mapped.filter(a => a).sort((a, b) => b[sort] - a[sort]) });
    } catch(e) {
        console.log(e);
        return res.json({error: ''+e});
    }
}

export { accountTokens }
