const expect = require('chai').expect;
const { TokenSigner, DisplayType } = require('../src/token');
const { objectToEncodedToken } = require('./helpers');

const ERROR_BARCODE = 'errorbarcode';

const encodedStaticBarcodeToken = 'eyJiIjoiOTY0NTM3MjgzNDIxIn0=';
const decodedStaticBarcodeToken = { b: '964537283421' };

const encodedRotatingEntryToken = 'eyJiIjoiOTY0NTM3MjgzMDAxIiwidCI6IlRNOjowMzo6MjAxeXRmbmllN2tpZmxzZ2hncHQ5ZDR4N2JudTljaG4zYWNwdzdocjdkOWZzc3MxcyIsImNrIjoiMzRkNmQyNTNiYjNkZTIxOTFlZDkzMGY2MmFkOGQ0ZDM4NGVhZTVmNSJ9';
const decodedRotatingEntryToken = {
    b: '964537283001',
    t: 'TM::03::201ytfnie7kiflsghgpt9d4x7bnu9chn3acpw7hr7d9fsss1s',
    ck: '34d6d253bb3de2191ed930f62ad8d4d384eae5f5'
};

const encodedRETWithEventKey = 'eyJiIjoiMDg2NzM0NjQ3NjA0MTYxNmEiLCJ0IjoiQkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFDR2tmNWxkZWZ3WEh3WmpvRmMzcnNEY0RINkpyY2pqOW0yS0liKyIsImNrIjoiM2QyN2I3N2ViOGJmMWQyMjdiNTRmZGE4OTc4Mzg0M2FhYmUyNDhlNSIsImVrIjoiYjA2ZjBmNmZmODc1MGNiNzg3NWFiMjYwNGYyYzQ4YjQxYzc5ZDgzZiJ9';
const decodedRETWithEventKey = {
    b: '0867346476041616a',
    t: 'BAAAAAAAAAAAAAAAAAAAAAAAAACGkf5ldefwXHwZjoFc3rsDcDH6Jrcjj9m2KIb+',
    ck: '3d27b77eb8bf1d227b54fda89783843aabe248e5',
    ek: 'b06f0f6ff8750cb7875ab2604f2c48b41c79d83f'
};

const tokenToTokenSignerPropertyMap = {
    b: 'barcode',
    t: 'rawToken',
    ck: 'customerKey',
    ek: 'eventKey'
};

describe('TokenSigner', () => {
    it('should decode and parse a static barcode token', () => {
        const tokenSigner = new TokenSigner(encodedStaticBarcodeToken);
        expectMappedPropertiesToEqual(decodedStaticBarcodeToken, tokenSigner);
    });

    it('should decode and parse a rotating entry token', () => {
        const tokenSigner = new TokenSigner(encodedRotatingEntryToken);
        expectMappedPropertiesToEqual(decodedRotatingEntryToken, tokenSigner);
    });

    it('should decode and parse a rotating entry token with event key', () => {
        let tokenSigner = new TokenSigner(encodedRETWithEventKey);
        expectMappedPropertiesToEqual(decodedRETWithEventKey, tokenSigner);
    });

    it('should handle valid raw barcode', () => {
        const validBarcodes = [
            decodedStaticBarcodeToken.b,

            // Minimum digits
            '123456789012',
            '123456789012a',
            '123456789012A',

            // In between digits
            '12345678901234',
            '12345678901234b',
            '12345678901234B',

            // Maximum digits
            '123456789012345678',
            '123456789012345678z',
            '123456789012345678Z'
        ];

        validBarcodes.forEach(barcode => {
            const tokenSigner = new TokenSigner(barcode);
            expect(tokenSigner.displayType).to.equal(DisplayType.STATIC_QR);
            expectMappedPropertiesToEqual({ b: barcode }, tokenSigner);
        });
    });

    it('should handle invalid raw barcode', () => {
        const invalidBarcodes = [
            // Not enough digits
            '1',
            '12345678901',
            'abcdedfghijkl',

            // Too many digits
            '1234567890123456789',
            '1234567890123456789a',

            // Too many trailing charaters
            '123456789012ab',
            '1234567890123ab',
            '1234567890123456Zz',

            // Invalid characters
            '123456789012!',
            '123456789012%'
        ];

        invalidBarcodes.forEach(barcode => {
            const tokenSigner = new TokenSigner(barcode);
            expect(tokenSigner.displayType).to.equal(DisplayType.INVALID);
            expectMappedPropertiesToEqual({ b: 'errorbarcode' }, tokenSigner);
        });
    });

    it('should be immutable', () => {
        const tokenSigner = new TokenSigner(encodedRotatingEntryToken);

        Object.keys(tokenToTokenSignerPropertyMap).forEach(key => {
            const tokenSignerProperty = tokenToTokenSignerPropertyMap[key];
            expect(tokenSigner[tokenSignerProperty]).to.equal(decodedRotatingEntryToken[key]);

            tokenSigner[tokenSignerProperty] = `new-${tokenSignerProperty}-value`;
            expect(tokenSigner[tokenSignerProperty], `topic [${tokenSignerProperty}]`).to.equal(decodedRotatingEntryToken[key]);
        });

        const originalDisplayType = tokenSigner.displayType;
        tokenSigner.displayType = 'new-segment-type';
        expect(tokenSigner.displayType).to.equal(originalDisplayType);
    });

    it('should create an "errorbarcode" when provided invalid token strings', () => {
        const invalidTokenStrings = [
            '1', // Invalid base64 data
            btoa('{invalidjson')
        ];

        invalidTokenStrings.forEach(tokenString => {
            const tokenSigner = new TokenSigner(tokenString);
            expect(tokenSigner.barcode).to.equal(ERROR_BARCODE);
            expect(tokenSigner.displayType).to.equal(DisplayType.INVALID);
        });
    });

    it('should not throw error with unknown keys in provided token', () => {
        let tokenSigner;
        let err;
        try {
            tokenSigner = new TokenSigner(objectToEncodedToken({ uknownKey: 'unknownKey' }));
        } catch (e) {
            err = e;
        }
        expect(tokenSigner).to.exist;
        expect(err).to.not.exist;
    });

    describe('generateSignedToken', () => {
        it('should return a barcode for BARCODE segment type', () => {
            let tokenSigner = new TokenSigner(encodedStaticBarcodeToken);
            expect(tokenSigner.generateSignedToken()).to.equal(decodedStaticBarcodeToken.b);
        });

        it('should return a barcode for UKNOWN segment type', () => {
            let tokenSigner = new TokenSigner(btoa('{invalidjson'));
            expect(tokenSigner.generateSignedToken()).to.equal(ERROR_BARCODE);
        });

        it('should return a signed token for ROTATING_SYMBOLOGY segment type', () => {
            let tokenSigner = new TokenSigner(encodedRotatingEntryToken);

            const signedToken = tokenSigner.generateSignedToken();

            const [, originalToken, totp] = signedToken.match(RegExp(`(${decodedRotatingEntryToken.t})::(.+)`)) || [];
            expect(originalToken, 'token').to.exist;
            expect(totp, 'totp').to.exist;
            expect(totp.length, 'totp').to.equal(6);
        });

        it('should return a signed token for ROTATING_SYMBOLOGY segment type with event key', () => {
            let tokenSigner = new TokenSigner(objectToEncodedToken(decodedRETWithEventKey));

            const signedToken = tokenSigner.generateSignedToken(1548364791161);

            const [, originalToken, ektotp, cktotp] = signedToken.match(/(.+?)::([0-9]{6})::([0-9]{6})/) || [];

            expect(originalToken, 'token').to.equal(decodedRETWithEventKey.t);
            expect(ektotp, 'ektotp').to.equal('958774');
            expect(cktotp, 'cktotp').to.equal('269251');
        });

        it('should generate proper TOTP without padding', () => {
            let token = {
                b: '012801000001',
                t: 'TM::03::3g14cs4cs8p73o9ccpoovht2ua8svwnmknxbirt8eahfg8my9',
                ck: '3d27b77eb8bf1d227b54fda89783843aabe248e5'
            };

            let tokenSigner = new TokenSigner(objectToEncodedToken(token));

            const signedToken = tokenSigner.generateSignedToken(1548364791161, false);
            const [, , totp] = signedToken.match(RegExp(`(TM::.+::.+)::(.+)`)) || [];
            expect(totp).to.equal('376211');
        });

        it('should generate proper TOTP with padding', () => {
            let token = {
                b: '012801000001',
                t: 'TM::03::3g14cs4cs8p73o9ccpoovht2ua8svwnmknxbirt8eahfg8my9',
                ck: '3d27b77eb8bf1d227b54fda89783843aabe248e5'
            };

            let tokenSigner = new TokenSigner(objectToEncodedToken(token));

            const signedToken = tokenSigner.generateSignedToken(1548364791161, true);
            const [, , totp] = signedToken.match(RegExp(`(TM::.+::.+)::(.+)`)) || [];
            expect(totp).to.equal('269251');
        });
    });
});

/**
 * Compare property values for two objects with mapped property names.
 *
 * @param {Object} actual
 * @param {Object} expected
 * @param {Object} propertyMap - Map of `expected` object properties to `actual` object properties.
 */
function compareMappedProperties(actual, expected, propertyMap) {
    Object.keys(actual).forEach(property => {
        const mappedProperty = propertyMap[property];
        const msg = `Values for '${mappedProperty}' and '${property}' are not equal`;
        expect(expected[mappedProperty], msg).to.equal(actual[property]);
    });
}

function expectMappedPropertiesToEqual(actual, expected) {
    compareMappedProperties(actual, expected, tokenToTokenSignerPropertyMap);
}
