const SecureEntryView = require('./secure-entry-view');
const { Logger } = require('./utils');

Logger.log(`Running in ${process.env.NODE_ENV} mode`);

/**
 * The namespace for Presence related JavaScript.
 * @namespace Presence
 * @public
 */

module.exports = { SecureEntryView };
