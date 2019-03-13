const expect = require('chai').expect;
const Presence = require('../src/index');

describe('Presence', () => {
    it('should expose public API', () => {
        expect(Presence.SecureEntryView).to.exist;
    });
});
