const expect = require('chai').expect;
const { Util } = require('../src/jsotp/util');

describe('utils', () => {
    describe('rightPadByteString', () => {
        const hexString = '3de5';

        it('should pad with a value greater than byte string length', () => {
            const byteString = Util.hexToByteString(hexString);
            const paddedByteString = Util.rightPadByteString(byteString, 10);
            const paddedHexString = Util.byteStringToHex(paddedByteString);

            expect(paddedByteString.length).to.equal(10);
            expect(paddedHexString).to.equal('3de50000000000000000');
        });

        it('should not pad with a value less than byte string length', () => {
            const byteString = Util.hexToByteString(hexString);
            const paddedByteString = Util.rightPadByteString(byteString, 1);
            const paddedHexString = Util.byteStringToHex(paddedByteString);

            expect(paddedByteString.length).to.equal(byteString.length);
            expect(paddedHexString).to.equal(hexString);
        });
    });
});
