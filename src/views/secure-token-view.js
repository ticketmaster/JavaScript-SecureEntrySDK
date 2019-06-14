import { TokenViewBase } from './token-views';
import * as barcode from '../helpers/barcode';
import { OverlayView } from './overlay';
import { pdf417 } from '../helpers/dimensions';
import { createElement } from '../helpers/utils';

// TODO: Better name that isn't so close to SecureEntryView
/**
 * A class representing a renderable secure token.
 */
export class SecureTokenView extends TokenViewBase {
    constructor(options = {}) {
        super(Object.assign({ idPrefix: 'psetokenview' }, options));

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
        this._scale = -1;

        this.setSize({
            containerWidth: options.w,
            containerHeight: options.h
        });
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
        this._setCanvasSize(this._canvasEl, canvasWidth, canvasHeight, '0px', `${padding}px`);

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
