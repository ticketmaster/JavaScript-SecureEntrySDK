import { createElement } from '../helpers/utils';

const OFF_STATE_TIMEOUT = 10000;
const DEBOUNCE_TIMEOUT = 350;

/**
 * Class representing a button switching between two states. Exposes a callback
 * for when button switches states.
 *
 * @param {Object} options
 * @param {Number} optinos.w - Width of the container, button will be rendered in.
 * @param {Number} optinos.h - Height of the container, button will be rendered in.
 * @param {Function} options.onToggle - Callback when button state is toggled.
 */
export class ToggleButton {
    constructor({ w, h, onToggle }) {
        this._buttonTouchAreaElement = ToggleButton.createTouchAreaButton(w, h);
        this._buttonTouchAreaElement.addEventListener('click', ToggleButton.createToggleEventListener(onToggle));
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
     * @param {Number} w - The width of the button.
     * @param {Number} h - The height of the button.
     *
     * @returns {HTMLDivElement}
     */
    static createTouchAreaButton(w, h) {
        return createElement('div', null,
            {
                position: 'absolute',
                width: `${w}px`,
                height: `${h}px`,
                right: '0px',
                bottom: `0px`
            }
        );
    };

    /**
     * Create the event listener to toggle button states.
     *
     * @param {Function} [toggleCallback] - Callback for when animation is complete.
     *
     * @returns {EventListener}
     */
    static createToggleEventListener(toggleCallback, debounceTimeout = DEBOUNCE_TIMEOUT, offStateTimeout = OFF_STATE_TIMEOUT) {
        let isOnState = true;
        let isToggling = false;
        let offStateTimeoutId;

        const performToggle = () => {
            isToggling = true;
            setTimeout(() => { isToggling = false; }, debounceTimeout);
            typeof toggleCallback === 'function' && toggleCallback(isOnState);
        };

        return () => {
            if (isToggling) { return; }
            if (offStateTimeoutId) { clearTimeout(offStateTimeoutId); }

            isOnState = !isOnState;
            if (!isOnState) {
                offStateTimeoutId = setTimeout(() => {
                    isOnState = true;
                    performToggle();
                }, offStateTimeout);
            }
            performToggle();
        };
    };
}
