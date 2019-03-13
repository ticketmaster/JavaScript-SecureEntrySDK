const { container: containerDimensions } = require('./dimensions');
const { createElement, swapElementStyles } = require('./utils');
const onStateSVGDataString = require('./img/Icon-Overflow.svg');
const offStateSVGDataString = require('./img/Icon-Swap.svg');

const BUTTON_MIN_SIZE = 24;
const OFF_STATE_TIMEOUT = 10;

/**
 * Class representing a button switching between two states. Exposes a callback
 * for when button switches states.
 *
 * @param {Object} options
 * @param {Number} optinos.w - Width of the container, button will be rendered in.
 * @param {Function} options.onToggle - Callback when button state is toggled.
 */
class ToggleButton {
    constructor({ w, onToggle }) {
        const stateToggleButtonSize = w * (BUTTON_MIN_SIZE / containerDimensions.minWidth);
        const svgDataStrings = [onStateSVGDataString, offStateSVGDataString];
        const [onStateImageElement, offStateImageElement] = ToggleButton.createButtonStateImageElements(svgDataStrings, stateToggleButtonSize);
        this._buttonTouchAreaElement = ToggleButton.createTouchAreaButton(stateToggleButtonSize, [onStateImageElement, offStateImageElement]);
        this._buttonTouchAreaElement.addEventListener('click', ToggleButton.createToggleEventListener(onStateImageElement, offStateImageElement, onToggle));
    }

    /**
     * Return the underlying HTMLDivElement for this instance.
     *
     * @returns {HTMLElement}
     */
    get el() {
        return this._buttonTouchAreaElement;
    }

    /**
     * Create the actual button element.
     *
     * @param {Number} size - The size of the square button.
     * @param {Array.<HTMLElement>} children - The child elements
     *
     * @returns {HTMLDivElement}
     */
    static createTouchAreaButton(size, children) {
        return createElement('div', null,
            {
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                right: '0px',
                bottom: `0px`
            },
            children
        );
    };

    /**
     * Create the event listener to toggle button states.
     *
     * @param {HTMLImageElement} onElement - Element to show when in on state.
     * @param {HTMLImageElement} offElement - Element to show when in off state.
     * @param {Function} [toggleCallback] - Callback for when animation is complete.
     *
     * @returns {EventListener}
     */
    static createToggleEventListener(onElement, offElement, toggleCallback, offStateTimeout = OFF_STATE_TIMEOUT) {
        let isOnState = true;
        let isAnimating = false;
        let timeoutId;

        const performToggle = () => {
            isAnimating = true;
            // Call `toggleCallback` first, so it can start it's animations at same time.
            typeof toggleCallback === 'function' && toggleCallback(isOnState);
            swapElementStyles(onElement, offElement, ['opacity'], () => { isAnimating = false; });
        };

        return () => {
            if (isAnimating) { return; }
            if (timeoutId) { clearTimeout(timeoutId); }

            isOnState = !isOnState;
            if (!isOnState) {
                timeoutId = setTimeout(() => {
                    isOnState = true;
                    performToggle();
                }, offStateTimeout * 1000);
            }
            performToggle();
        };
    };

    /**
     * Provided an array SVG files as strings, create and return array of `HTMLImageElement`s for each
     * file's data.
     *
     * @param {Array.<String>} svgDataStrings - Array of SVG file content to convert to `HTMLImageElement`s.
     * @param {Number} imageSize - The images size
     *
     * @returns {Array.<HTMLImageElement>}
     */
    static createButtonStateImageElements(svgDataStrings, imageSize, minImageSize = BUTTON_MIN_SIZE) {
        return svgDataStrings.map((svgDataString, index) => {
            return createElement('img',
                {
                    src: `data:image/svg+xml;base64,${global.btoa(svgDataString)}`,
                    width: minImageSize,
                    height: minImageSize
                },
                {
                    position: 'absolute',
                    // Scale to fit desired `imageSize`.
                    transform: `scale(${imageSize / minImageSize})`,
                    transformOrigin: 'top left',
                    left: '0px',
                    top: '0px',
                    opacity: index === 0 ? 100 : 0
                }
            );
        });
    };
}

module.exports = { ToggleButton };
