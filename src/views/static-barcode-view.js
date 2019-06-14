import * as QRCode from 'qrcode';
import { TokenViewBase } from './token-views';
import { createElement } from '../helpers/utils';

/**
 * A class representing a renderable barcode.
 */
export class StaticBarcodeView extends TokenViewBase {
    constructor(options = {}) {
        super(Object.assign({ idPrefix: 'psebarcodeview' }, options));

        this._canvasEl = createElement(
            'canvas',
            { id: `${options.idPrefix}-canvas-${options.id}` },
            {
                backgroundColor: '#fff',
                boxSizing: 'border-box',
                borderRadius: '4px'
            }
        );

        this.el.appendChild(this._canvasEl);

        this.setSize({
            containerWidth: options.w,
            containerHeight: options.h
        });
    }

    setSize({ containerWidth, containerHeight }) {
        const barcodeSize = containerHeight;
        const horizontalMargin = (containerWidth - barcodeSize) * 0.5;

        this._setContainerSize(barcodeSize, barcodeSize, `0px ${horizontalMargin}px`);
        this._setCanvasSize(this._canvasEl, barcodeSize, barcodeSize);
    }

    render(data) {
        QRCode.toCanvas(this._canvasEl, data, { width: this._canvasEl.width });
    }
}
