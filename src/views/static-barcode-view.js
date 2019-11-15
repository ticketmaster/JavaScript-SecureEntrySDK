import * as QRCode from 'qrcode';
import { TokenViewBase } from './token-views';
import { createElement, applyStyle } from '../helpers/utils';

const DEFAULT_SUBTITLE_COLOR = '#262626';

/**
 * A class representing a renderable barcode.
 */
export class StaticBarcodeView extends TokenViewBase {
    constructor(options = {}) {
        super({ idPrefix: 'psebarcodeview', ...options });

        // TODO: Do full CSS reset on `TokenView`.
        applyStyle(
            this.el,
            {
                fontSize: '0px',
                lineHeight: '0px',
                backgroundColor: '#fff',
                borderRadius: '4px'
            }
        );

        this._canvasEl = createElement(
            'canvas',
            { id: this.generateElementId('canvas') },
            { boxSizing: 'border-box' }
        );
        this.el.appendChild(this._canvasEl);

        this._subtitleEl = createElement(
            'p',
            { id: this.generateElementId('subtitle') },
            {
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: options.useBrandingColorForSubtitle ? options.color : DEFAULT_SUBTITLE_COLOR
            }
        );
        this.subtitle = options.subtitle;

        // Cache container size for resizing later.
        this.w = options.w;
        this.h = options.h;

        this.setSize({
            containerWidth: options.w,
            containerHeight: options.h
        });
    }

    setSize({ containerWidth, containerHeight }) {
        const padding = 12; // Padding matches minimum readable text size
        const doublePadding = padding * 2;
        const barcodeContainerWidth = containerHeight;

        let canvasSize = barcodeContainerWidth;
        let canvasSideMargin = 0;
        let containerSideMargin = (containerWidth - canvasSize) * 0.5;

        if (this.subtitle) {
            canvasSize -= doublePadding;
            canvasSideMargin = padding;

            applyStyle(
                this._subtitleEl,
                {
                    margin: '0px',
                    padding: '0px',
                    width: `${barcodeContainerWidth}px`,
                    height: `${doublePadding}px`,
                    fontSize: `${padding}px`,
                    lineHeight: `${padding}px`
                }
            );
        }

        this._setContainerSize(barcodeContainerWidth, containerHeight, `0px ${containerSideMargin}px`);
        this._setCanvasSize(this._canvasEl, canvasSize, canvasSize, `0px ${canvasSideMargin}px`, `${padding}px`);
    }

    get subtitle() {
        return this._subtitle;
    }

    // Currently this should be called before `render`
    set subtitle(subtitle) {
        this._subtitle = subtitle;
        if (subtitle && typeof subtitle === 'string') {
            this._subtitleEl.innerText = subtitle;
            this.el.appendChild(this._subtitleEl);
        } else {
            this._subtitleEl.remove();
        }
    }

    render(data) {
        // Resize container to hanlde potentially added subtitle.
        this.setSize({ containerWidth: this.w, containerHeight: this.h });
        QRCode.toCanvas(this._canvasEl, data, { margin: 0, width: this._canvasEl.width });
    }
}
