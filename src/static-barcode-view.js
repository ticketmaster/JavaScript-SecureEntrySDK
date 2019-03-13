const QRCode = require('qrcode');
const { TokenViewBase } = require('./token-views');

/**
 * A class representing a renderable barcode.
 */
class StaticBarcodeView extends TokenViewBase {
    constructor(options = {}) {
        super(Object.assign({ idPrefix: 'psebarcodeview' }, options));
    }

    setSize({ containerWidth, containerHeight }) {
        const barcodeSize = containerHeight;
        const horizontalMargin = (containerWidth - barcodeSize) * 0.5;

        this._setContainerSize(barcodeSize, barcodeSize, `0px ${horizontalMargin}px`);
        this._setCanvasSize(barcodeSize, barcodeSize);
    }

    render(data) {
        QRCode.toCanvas(this._canvasEl, data, { width: this._canvasEl.width });
    }
}

module.exports = { StaticBarcodeView };
