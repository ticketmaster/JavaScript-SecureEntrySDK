import { TokenViewBase } from './token-views';
import * as barcode from '../helpers/barcode';
import { OverlayView } from './overlay';
import { pdf417 } from '../helpers/dimensions';
import { createElement, applyStyle } from '../helpers/utils';

const DEFAULT_SUBTITLE_COLOR = '#515151';

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
                borderBottomLeftRadius: borderRadius,
                borderBottomRightRadius: borderRadius,
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
        const padding = Math.floor((barcodeContainerWidth * pdf417.paddingPercentage) * 0.5);
        const doublePadding = padding * 2;
        const canvasWidth = barcodeContainerWidth - doublePadding;
        const canvasHeight = canvasWidth * pdf417.ratio;
        const barcodeContainerHeight = canvasHeight + doublePadding;
        const margin = `${Math.floor((containerHeight - barcodeContainerHeight - doublePadding) * 0.5)}px auto`;

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

        if (this.subtitle) {
            const fontSize = 12;
            applyStyle(
                this._subtitleEl,
                {
                    width: `100%`,
                    height: `${doublePadding}px`,
                    fontSize: `${fontSize}px`,
                    lineHeight: `${fontSize}px`
                }
            );

            // Canvas bottom corner radius is not needed because of subtitle.
            // Maybe wrap these in a container and set radius there?
            applyStyle(
                this.el,
                {
                    borderBottomLeftRadius: '0px',
                    borderBottomRightRadius: '0px'
                }
            );
        }
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
