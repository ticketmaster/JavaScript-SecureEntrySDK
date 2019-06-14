import { TokenViewBase } from './token-views';
import { createElement } from '../helpers/utils';
import { pdf417 } from '../helpers/dimensions';

import loadingImage from '../assets/ret-loading-animation.gif';

export class LoadingView extends TokenViewBase {
    constructor(options = {}) {
        super({ idPrefix: 'pseloadingview', ...options });

        this.el.appendChild(createElement('img', { src: loadingImage }, { width: '100%' }));
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
    }
}
