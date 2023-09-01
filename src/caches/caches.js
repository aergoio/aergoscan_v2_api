/**
 * cached data key-list : ['mainBlockInfo', 'recentTransactions', 'txHistory']
 */
const schedulerDataCache = new Map();
const tokenCache = new Map();

//-- Token Price
const tokePriceRegisteredCache = new Map();

async function fetchToken(apiClient, address) {
    const result = await apiClient.quickSearchToken(`_id:${address}`);
    if (result.hits && result.hits.length) {
        return result.hits[0];
    }
    return null;
}

function getCachedToken(apiClient, address) {
    const token = tokenCache.get(address);
    if (token) {
        return token;
    }
    const fetch = fetchToken(apiClient, address);
    tokenCache.set(address, fetch);
    return fetch;
}

async function addCachedTokenData(apiClient, hit) {
    try {
        hit.token = await getCachedToken(apiClient, hit.meta.address);
    } catch (e) {
        hit.token = await getCachedToken(apiClient, hit.address);
    }
    return hit;
}

function getCachedTokensPrice(apiClient, address) {
    const token = tokePriceRegisteredCache.get(address);
    if (token) {
        return token;
    }
    const fetch = fetchToken(apiClient, address);
    tokenCache.set(address, fetch);
    return fetch;
}

export {
    schedulerDataCache,
    tokenCache,
    getCachedToken,
    addCachedTokenData,
    tokePriceRegisteredCache,
};
