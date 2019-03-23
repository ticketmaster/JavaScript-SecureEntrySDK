const { createElement, applyStyle } = require('./utils');

// TODO: Document
/**
 * @param {Object} options
 * @param {String} options.idPrefix
 * @param {String} options.id
 */
class TokenViewBase {
    constructor(options = {}) {
        this._canvasEl = createElement(
            'canvas',
            { id: `${options.idPrefix}-canvas-${options.id}` },
            {
                backgroundColor: '#fff',
                boxSizing: 'border-box',
                borderRadius: '4px'
            }
        );

        this._containerEl = createElement(
            'div',
            { id: `${options.idPrefix}-div-${options.id}` },
            {
                position: 'absolute',
                boxSizing: 'border-box'
            },
            [this._canvasEl]
        );

        this._color = options.color;

        this.setSize({
            containerWidth: options.w,
            containerHeight: options.h
        });
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
    _setCanvasSize(width, height, margin = '0px', padding = '0px') {
        this._canvasEl.width = width;
        this._canvasEl.height = height;
        applyStyle(this._canvasEl, { margin, padding });
    }
}

module.exports = { TokenViewBase };