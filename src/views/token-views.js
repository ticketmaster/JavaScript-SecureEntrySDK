import { createElement, applyStyle } from '../helpers/utils';

// TODO: Document
/**
 * @param {Object} options
 * @param {String} options.idPrefix
 * @param {String} options.id
 */
export class TokenViewBase {
    constructor(options = {}) {
        this._idPrefix = options.idPrefix;
        this._id = options.id;

        this._containerEl = createElement(
            'div',
            { id: this.generateElementId('div') },
            {
                position: 'absolute',
                boxSizing: 'border-box',
                fontFamily: 'Averta-Semibold, -apple-system, BlinkMacSystemFont, "Roboto", "Fira Sans", "Helvetica Neue", sans-serif'
            }
        );

        this._color = options.color;
    }

    /**
     * Returns a "scoped" ID suitable for use as an element ID.
     *
     * @param {String} baseName
     * @param {String} delimiter
     *
     * @returns String
     */
    generateElementId(baseName, delimiter = '-') {
        return [this._idPrefix, baseName, this._id].join(delimiter);
    }

    /**
     * Returns the underlying HTML element for this view.
     *
     * @returns HTMLDivElement
     */
    get el() {
        return this._containerEl;
    }

    /**
     * Override this to do the actual rendering of the barcode.
     *
     * @param {String} data - The barcode data to render.
     */
    render(data) { }

    /**
     * Override this with an implementation to set the container and canvas
     * element sizes. You should use the `_setContainerSize` and
     * `_setCanvaseSize` methods to do so.
     *
     * @param {Object} size
     * @param {Number} size.containerWidth
     * @param {Number} size.containerHeight
     */
    setSize(size) { }

    /**
     * Set the container size and margin.
     *
     * @param {Number} width - Container width in pixels
     * @param {Number} height - Container height in pixels
     * @param {String} margin - CSS text value for container margin value
     */
    _setContainerSize(width, height, margin, padding) {
        /** @type CSSStyleDeclaration */
        const containerStyle = this._containerEl.style;
        containerStyle.width = `${width}px`;
        containerStyle.height = `${height}px`;
        containerStyle.margin = margin;
        if (padding) {
            containerStyle.padding = padding;
        }
    }

    /**
     * Set the canvas size and margin.
     *
     * @param {Number} width - Canvas element width
     * @param {Number} height - Canvas element height
     * @param {String} margin - CSS text value for the canvas margin value
     */
    _setCanvasSize(canvas, width, height, margin = '0px', padding = '0px') {
        canvas.width = width;
        canvas.height = height;
        applyStyle(canvas, { margin, padding });
    }
}
