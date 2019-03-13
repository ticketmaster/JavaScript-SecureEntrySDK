// TODO: Move these dependencies to vendor
const jsotp = require('./jsotp/jsotp');
const nibbler = require('./jsotp/nibbler/nibbler');
const { Util } = require('./jsotp/util');

const TOKEN_DELIMITER = '::';
const TOTP_INTERVAL = 15;
const VALID_BARCODE_REGEX = /^[0-9]{12,18}[A-Za-z]?$/;

const SegmentType = {
    BARCODE: 'BARCODE',
    ROTATING_SYMBOLOGY: 'ROTATING_SYMBOLOGY',
    UNKNOWN: 'UNKNOWN'
};

// We use WeakMaps to mimic private access modifier.
const _barcode = new WeakMap();
const _rawToken = new WeakMap();
const _customerKey = new WeakMap();
const _eventKey = new WeakMap();
const _segmentType = new WeakMap();

/**
 * Class to sign token's supplied from Presence Delivery Service.
 */
class TokenSigner {
    constructor(encodedToken) {
        let json = { b: 'errorbarcode', segmentType: SegmentType.UNKNOWN };

        try {
            const decodedToken = global.atob(encodedToken);
            json = JSON.parse(decodedToken);
        } catch (e) {
            // Check if we were actually provided a raw barcode, before
            // continuing with assumption we have an invalid token.
            const barcode = encodedToken && encodedToken.match(VALID_BARCODE_REGEX);
            if (barcode) {
                json = { b: barcode[0], segmentType: SegmentType.BARCODE };
            }
        }

        // TODO: Handle invalid input data
        //  - We should always have at least a barcode, but since data is
        //    coming from a potentially untrusted source, how sure can we be we
        //    actually have these values?
        //  - What should we do if we're missing something?
        if (json.t && json.ck) {
            json.segmentType = SegmentType.ROTATING_SYMBOLOGY;
            _rawToken.set(this, json.t);
            _customerKey.set(this, json.ck);
            _eventKey.set(this, json.ek);
        }

        _barcode.set(this, json.b);
        _segmentType.set(this, json.segmentType || SegmentType.BARCODE);
    }

    get barcode() {
        return _barcode.get(this);
    }

    get rawToken() {
        return _rawToken.get(this);
    }

    get customerKey() {
        return _customerKey.get(this);
    }

    get eventKey() {
        return _eventKey.get(this);
    }

    get segmentType() {
        return _segmentType.get(this);
    }

    /**
     * Generates a signed token if this instance's `segmentType` is
     * ROTATING_SYMBOLOGY, otherwise return the barcode string.
     */
    generateSignedToken(time, withCounterPadding = true) {
        if (this.segmentType === SegmentType.ROTATING_SYMBOLOGY) {
            const keys = [this.eventKey, this.customerKey];
            const tokenComponents = keys.reduce((acc, key) => {
                if (key) {
                    let encodedKey;
                    try {
                        encodedKey = nibbler.b32encode(Util.hexToByteString(key));
                    } catch (err) {
                        encodedKey = '';
                    }

                    const totpGenerator = jsotp.TOTP(encodedKey, TOTP_INTERVAL);
                    const totp = totpGenerator.now(time, withCounterPadding);
                    acc.push(totp);
                }
                return acc;
            }, [this.rawToken]);
            return tokenComponents.join(TOKEN_DELIMITER);
        }
        return this.barcode;
    }
}

module.exports = { TokenSigner, SegmentType };
