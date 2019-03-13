const { TokenViewBase } = require('./token-views');
const barcode = require('./barcode');
const OverlayView = require('./overlay');
const { pdf417 } = require('./dimensions');

// TODO: Better name that isn't so close to SecureEntryView
/**
 * A class representing a renderable secure token.
 */
class SecureTokenView extends TokenViewBase {
    constructor(options = {}) {
        super(Object.assign({ idPrefix: 'psetokenview' }, options));
        this._scale = -1;
    }

    setSize({ containerWidth, containerHeight }) {
        const barcodeContainerWidth = containerWidth;
        const padding = Math.floor((barcodeContainerWidth * pdf417.paddingPercentage) * 0.5);
        const doublePadding = padding * 2;
        const canvasWidth = barcodeContainerWidth - doublePadding;
        const canvasHeight = canvasWidth * pdf417.ratio;
        const barcodeContainerHeight = canvasHeight + doublePadding;
        const margin = `${Math.floor((containerHeight - barcodeContainerHeight) * 0.5)}px auto`;

        this._setContainerSize(barcodeContainerWidth, barcodeContainerHeight, margin);
        this._setCanvasSize(canvasWidth, canvasHeight, '0px', `${padding}px`);

        // TODO: Dont' recreate
        const overlay = new OverlayView(
            this._color,
            barcodeContainerWidth,
            barcodeContainerHeight,
            padding
        );
        this._containerEl.appendChild(overlay.el);
        overlay.playAnimation();
    }

    render(data) {
        // Vertically flip the barcode for a more obvious visual change.
        this._canvasEl.style.transform = `scaleY(${this._scale = -this._scale})`;
        barcode.drawBarcodeInCanvas(this._canvasEl.getContext('2d'), data);
    }
}

module.exports = { SecureTokenView };
