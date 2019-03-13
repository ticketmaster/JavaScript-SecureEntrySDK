const { InternalRenderer, RenderModes } = require('./internal-renderer');

// We use WeakMaps to mimic private access modifier.
const _renderer = new WeakMap();

/**
 * @public
 * @description
 *
 * Class for rendering secure entry tokens in PDF417 format.
 *
 * A token will be rendered immediately after the instance is "renderable".
 *
 * A renderable token has a valid CSS query selector and token. These can be
 * provided on object instantiation or via setter methods afterward.
 *
 * @param {Object} options - Configuration options for the renderer.
 * @param {String} options.selector - A selector for the HTML container element the token will render in.
 * @param {String} options.token - A secure token retrieved from the Presence Delivery API.
 * @param {String} [options.brandingColor] - A CSS hex color value.
 * @param {String} [options.errorText] - The error text to use if token parsing fails. Defaults to "Reload ticket"
 *
 * @example
 * const seView = new Presence.SecureEntryView({
 *     selector: '#token-container',
 *     token: '1234567890'
 * });
 */
class SecureEntryView {
    constructor(options, _diRenderer) {
        if (_diRenderer instanceof InternalRenderer) {
            _renderer.set(this, _diRenderer);
            _renderer.get(this).setConfiguration(options);
        } else {
            _renderer.set(this, new InternalRenderer({ renderMode: RenderModes.IMMEDIATE, ...options }));
        }
    }

    /**
     * @public
     * @description
     * Set the selector of the containing HTML element for this renderer to
     * render into.
     *
     * If a valid token is already set, the token will be rendered immediately.
     *
     * @param {String} - A selector for the HTML container element the token will render in.
     * @example
     * const seView = new Presence.SecureEntryView();
     * seView.setSelector('#token-container');
     */
    setSelector(sel) {
        _renderer.get(this).selector = sel;
    }

    /**
     * @public
     * @description
     * Set the token for this renderer.
     *
     * If a valid selector is already set, the token will be rendered immediately.
     *
     * @param {String} - A secure token retrieved from the Presence Delivery API.
     * @example
     * const seView = new Presence.SecureEntryView();
     * seView.setToken('123456');
     */
    setToken(token) {
        _renderer.get(this).token = token;
    }

    /**
     * @public
     * @description
     * Set color to use for themeable portions of the renderer.
     *
     * @param {String} color - A CSS hex color value.
     * @example
     * const seView = new Presence.SecureEntryView();
     * seView.setBrandingColor('#076CD9');
     */
    setBrandingColor(color) {
        _renderer.get(this).brandingColor = color;
    }

    /**
     * @public
     * @description
     * Sets the error text to display if there is an error parsing the provided
     * token.
     *
     * Note that there is 60 character limit. If the character limit is
     * exceeded, the text "Reload ticket" is rendered instead.
     *
     * @param {String} errorText - The error text to use. Defaults to "Reload ticket"
     * @example
     * const seView = new Presence.SecureEntryView();
     * seView.setErrorText('Please visit the box office');
     */
    setErrorText(errorText) {
        _renderer.get(this).errorText = errorText;
    }
}

module.exports = SecureEntryView;
