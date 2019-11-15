import { TokenViewBase } from './token-views';
import * as barcode from '../helpers/barcode';
import { OverlayView } from './overlay';
import { pdf417 } from '../helpers/dimensions';
import { createElement, applyStyle } from '../helpers/utils';

const DEFAULT_SUBTITLE_COLOR = '#262626';
const SUBTITLE_PADDING = 12;
const SUBTITLE_FONT_SIZE = 14;

// TODO: Better name that isn't so close to SecureEntryView
/**
 * A class representing a renderable secure token.
 */
export class SecureTokenView extends TokenViewBase {
    constructor(options = {}) {
        super({ idPrefix: 'psetokenview', ...options });

        const backgroundColor = '#fff';
        const borderRadius = '4px';

        // TODO: Do full CSS reset on `TokenView`.
        applyStyle(
            this.el,
            {
                fontSize: '0px',
                lineHeight: '0px',
                backgroundColor,
                borderRadius
            }
        );

        this._canvasEl = createElement(
            'canvas',
            { id: this.generateElementId('canvas') },
            { boxSizing: 'border-box' }
        );

        this.el.appendChild(this._canvasEl);
        this._scale = -1;

        this._subtitleEl = createElement(
            'p',
            { id: this.generateElementId('subtitle') },
            {
                margin: '0px',
                padding: '0px',
                backgroundColor,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: options.useBrandingColorForSubtitle ? options.color : DEFAULT_SUBTITLE_COLOR
            }
        );
        this.subtitle = options.subtitle;

        this.setSize({
            containerWidth: options.w,
            containerHeight: options.h
        });
    }

    setSize({ containerWidth, containerHeight }) {
        const barcodeContainerWidth = containerWidth;
        const barcodeSafeArea = Math.floor((barcodeContainerWidth * pdf417.paddingPercentage) * 0.5);
        const doubleBarcodeSafeArea = barcodeSafeArea * 2;
        const barcodeWidth = barcodeContainerWidth - doubleBarcodeSafeArea;
        const barcodeHeight = barcodeWidth * pdf417.ratio;

        // Render canvas at appropriate native pixel resolution, but use CSS to display correct
        // logical pixel resolution.
        const dpr = global.devicePixelRatio || 1;
        this._setCanvasSize(this._canvasEl, barcodeWidth * dpr, barcodeHeight * dpr, `${barcodeSafeArea}px`);
        applyStyle(this._canvasEl, { width: `${barcodeWidth}px`, height: `${barcodeHeight}px` });

        let subtitleHeight = 0;
        if (this.subtitle) {
            subtitleHeight = SUBTITLE_FONT_SIZE + (SUBTITLE_PADDING * 2);
            applyStyle(
                this._subtitleEl,
                {
                    width: `100%`,
                    marginTop: `${SUBTITLE_PADDING - barcodeSafeArea * 0.5}px`,
                    height: `${SUBTITLE_FONT_SIZE + 2}px`,
                    fontSize: `${SUBTITLE_FONT_SIZE}px`,
                    lineHeight: `${SUBTITLE_FONT_SIZE}px`
                }
            );
        }

        // The total container height must account for the optional subtitle.
        const barcodeContainerHeight = barcodeHeight + doubleBarcodeSafeArea + subtitleHeight;
        const barcodeContainerMargin = Math.floor((containerHeight - barcodeContainerHeight) * 0.5);
        this._setContainerSize(barcodeContainerWidth, barcodeContainerHeight, `${barcodeContainerMargin}px auto`);

        // TODO: Dont' recreate
        const overlay = new OverlayView(
            this._color,
            barcodeContainerWidth,
            barcodeHeight + doubleBarcodeSafeArea,
            barcodeSafeArea
        );
        this._containerEl.appendChild(overlay.el);
        overlay.playAnimation();
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
        // Vertically flip the barcode for a more obvious visual change.
        this._canvasEl.style.transform = `scaleY(${this._scale = -this._scale})`;
        barcode.drawBarcodeInCanvas(this._canvasEl.getContext('2d'), data);
    }
}
