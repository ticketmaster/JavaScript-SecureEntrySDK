import { Logger, getRandomIdentifier } from './utils';

const SERVER_TIME_RESOURCE = 'https://app.ticketmaster.com/safetix/configuration/v1/config';

let isRequestInProgress = false;
const requestTimeout = 3000;
const requestRetryTime = 500;

const timeDeltaCacheTTL = 15 * 60 * 1000;

export const storageKey = 'pse-td';

let storageProvider = global.localStorage;

/**
 * Allows setting the internal storage provider.
 *
 * @param {Object} [provider] - An object implementing the Web Storage API. Defaults to `window.localStorage`.
 */
export const setStorageProvider = provider => {
    storageProvider = provider || global.localStorage;
};

/**
 * Calculate and cache a time delta between a server provided time and the device's current time.
 *
 * @param {Number} [providedTimeDelta] - Difference between known-to-be-accurate time and this device's time.
 * @param {Function} [callback] - Called with time delta provided, cached or fetch from server.
 */
export const syncTime = (providedTimeDelta, callback) => {
    Logger.debug('syncTime: Initiated');

    if (typeof providedTimeDelta === 'number') {
        Logger.debug(`syncTime: Using provided time delta: ${providedTimeDelta}`);
        cacheTimeDelta(providedTimeDelta);
        typeof callback === 'function' && callback(providedTimeDelta);
        return;
    }

    // TODO: Allow to purge cache?
    const cachedTimeDelta = getCachedTimeDeltaInternal();
    if (cachedTimeDelta !== null) {
        Logger.debug(`syncTime: Using cached time delta of ${cachedTimeDelta}`);
        typeof callback === 'function' && callback(cachedTimeDelta);
        return;
    }

    if (isRequestInProgress) {
        Logger.debug(`syncTime: Network request for time is already in flight. Will try to load from cache in ${requestRetryTime} ms`);
        setTimeout(() => {
            syncTime(providedTimeDelta, callback);
        }, requestRetryTime);
        return;
    }

    isRequestInProgress = true;
    fetchServerTime(serverTime => {
        isRequestInProgress = false;
        const serverTimeDelta = calculateTimeDelta(serverTime, new Date());
        cacheTimeDelta(serverTimeDelta);

        Logger.debug(`syncTime: Completed server request with returned time of '${serverTime.toISOString()}' and time delta of '${serverTimeDelta}'`);
        typeof callback === 'function' && callback(serverTimeDelta);
    });
};

/**
 * Returns cached time delta or 0 if no value is found in cache.
 *
 * @returns Number
 */
export const getCachedTimeDelta = () => {
    return getCachedTimeDeltaInternal() || 0;
};

/**
 * Returns a `Date` object taking into account the provided time delta.
 *
 * @param {Number} timeDelta
 * @param {Date} [dateTime] - Date to use in calculating date. Defaults to current date and time.
 *
 * @returns Date
 */
export const dateFromTimeDelta = (timeDelta, dateTime) => {
    let date = new Date(dateTime);
    if (!isValidDate(date)) {
        date = new Date();
    }

    return new Date(date.getTime() + timeDelta);
};

/**
 * Returns whether or not the provided value is a valida Date.
 *
 * @param {Number|String|Date} value - The date to test.
 */
export const isValidDate = value => value instanceof Date && `${value}` !== 'Invalid Date';

const cacheTimeDelta = timeDelta => {
    const data = {
        td: timeDelta,
        ts: (new Date()).getTime() + timeDeltaCacheTTL
    };
    storageProvider.setItem(storageKey, JSON.stringify(data));
};

// We need a separate function to internally handle fetching time delta from server if there is no
// cached time delta.
const getCachedTimeDeltaInternal = () => {
    const data = storageProvider.getItem(storageKey);

    let json = {};
    try {
        json = JSON.parse(data) || {};
    } catch (e) {
        return null;
    }

    const expiry = new Date(json.ts);
    if (new Date() > expiry) {
        return null;
    }

    const delta = json.td;
    return isNaN(delta) ? null : delta;
};

const fetchServerTime = callback => {
    Logger.debug('fetchServerTime: Starting network request for server time');
    const xhr = new window.XMLHttpRequest();
    xhr.open('GET', `${SERVER_TIME_RESOURCE}?cb=${getRandomIdentifier()}`);

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            let serverDateTime = new Date();

            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.response);

                // TODO: Factor in latency
                serverDateTime = new Date(response.serverTime);
                Logger.debug(`fetchServerTime: Server response succeeded using server time: ${serverDateTime.toISOString()}`);
            } else {
                Logger.debug(`fetchServerTime: Server response failed using device time: ${serverDateTime.toISOString()}`);
            }

            callback(serverDateTime);
        }
    };

    xhr.timeout = requestTimeout;
    xhr.ontimeout = () => {
        const now = new Date();
        Logger.debug(`fetchServerTime: Server exceeded timed out of ${requestTimeout}, using device time: ${now.toISOString()}`);
        callback(now);
    };

    xhr.send();
};

const calculateTimeDelta = (timeA, timeB) => timeA.getTime() - timeB.getTime();
