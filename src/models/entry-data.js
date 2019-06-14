// TODO: Move these dependencies to vendor
import * as jsotp from '../jsotp/jsotp';
import * as nibbler from '../jsotp/nibbler/nibbler';
import { Util } from '../jsotp/util';

const TOKEN_DELIMITER = '::';
const TOTP_INTERVAL = 15;
const RAW_BARCODE_REGEX = /^[0-9]{12,18}[A-Za-z]?$/;

const RenderType = {
    BARCODE: 'BARCODE',
    ROTATING_SYMBOLOGY: 'ROTATING_SYMBOLOGY',
    UNKNOWN: 'UNKNOWN'
};

export const DisplayType = {
    INVALID: 'INVALID',
    STATIC_QR: 'STATIC_QR',
    STATIC_PDF: 'STATIC_PDF',
    ROTATING: 'ROTATING'
};

// We use WeakMaps to mimic private access modifier.
const _barcode = new WeakMap();
const _rawToken = new WeakMap();
const _customerKey = new WeakMap();
const _eventKey = new WeakMap();
const _renderType = new WeakMap();
const _displayType = new WeakMap();

/**
 * Class to sign token's supplied from Presence Delivery Service.
 */
export class EntryData {
    constructor(encodedToken) {
        let json = { b: 'errorbarcode', rt: RenderType.UNKNOWN };

        try {
            const decodedToken = global.atob(encodedToken);
            json = JSON.parse(decodedToken);
            if (json.rt) {
                json.rt = json.rt.toUpperCase();
            }
        } catch (e) {
            const rawBarcode = encodedToken && encodedToken.match(RAW_BARCODE_REGEX);
            if (rawBarcode) {
                json = { b: rawBarcode[0], rt: RenderType.BARCODE };
            }
        }

        // TODO: Handle invalid input data
        //  - We should always have at least a barcode, but since data is
        //    coming from a potentially untrusted source, how sure can we be we
        //    actually have these values?
        //  - What should we do if we're missing something?
        if (json.t && json.ck) {
            _rawToken.set(this, json.t);
            _customerKey.set(this, json.ck);
            _eventKey.set(this, json.ek);
        }

        _barcode.set(this, json.b);
        _renderType.set(this, json.rt);

        let displayType = DisplayType.INVALID;
        if ((json.rt === RenderType.BARCODE)) {
            displayType = DisplayType.STATIC_QR;
        } else if (json.rt === RenderType.ROTATING_SYMBOLOGY || !json.rt) {
            displayType = (json.t) ? DisplayType.ROTATING : DisplayType.STATIC_PDF;
        }
        _displayType.set(this, displayType);
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

    get renderType() {
        return _renderType.get(this);
    }

    get displayType() {
        return _displayType.get(this);
    }

    /**
     * Generates a signed token if this instance's `renderType` is
     * ROTATING_SYMBOLOGY and we have an encoded token, otherwise return the
     * barcode string.
     */
    generateSignedToken(time, withCounterPadding = true) {
        if (this.displayType === DisplayType.ROTATING) {
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
