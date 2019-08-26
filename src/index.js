import { SecureEntryView } from './views/secure-entry-view';
import { Logger } from './helpers/utils';
import { syncTime } from './helpers/time-sync';

Logger.log(`Running in ${process.env.NODE_ENV} mode`);

/**
 * The namespace for Presence related JavaScript.
 * @namespace Presence
 * @public
 */

/**
 * @public
 * @description
 * Initialize the SDK.
 *
 * @param {Object} [options]
 * @param {Number} [options.timeDelta] - The time difference (in milliseconds) between a trusted server and the local device.
 * @example
 * // Accept default time sync.
 * Presence.init();
 *
 * // Provide your own trusted time delta of 3.5 minutes in milliseconds.
 * Presence.init({ timeDelta: 210000 });
 */
const init = options => {
    syncTime((options && options.timeDelta) || null);
};

export { SecureEntryView, init };
