import { InternalRenderer, RenderModes } from './../controllers/internal-renderer';

// We use WeakMaps to mimic private access modifier.
const _renderer = new WeakMap();

const getNode = selOrNode => (selOrNode instanceof global.Node) ? selOrNode : document.querySelector(selOrNode);

/**
 * @public
 * @description
 *
 * Class for rendering secure entry tokens in PDF417 format.
 *
 * A token will be rendered immediately after the instance is "renderable".
 *
 * The view is considered renderable when it has a valid CSS query selector and
 * a token or an error is set with `showError`.
 *
 * @param {Object} [options] - Configuration options for the renderer.
 * @param {String|Node} [options.selector] - A selector or DOM node for the HTML container element the token will render in.
 * @param {String} [options.token] - A secure token retrieved from the Presence Delivery API.
 * @param {Object} [options.error] - An error object.
 * @param {String} [options.brandingColor] - A CSS hex color value.
 * @param {String} [options.errorText] Deprecated: Use optional parameter to `setToken` instead.
 *
 * @example
 * const seView = new Presence.SecureEntryView({
 *     selector: '#token-container',
 *     token: '1234567890'
 * });
 *
 * const seView = new Presence.SecureEntryView({
 *     selector: aDOMNode,
 *     token: '1234567890'
 * });
 */
export class SecureEntryView {
    constructor(options, _diRenderer) {
        if (options && options.selector) {
            options.containerNode = getNode(options.selector);
        }
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
     * @param {String|Node} sel - A selector or DOM node for the HTML container element the token will render in.
     * @example
     * const seView = new Presence.SecureEntryView();
     * seView.setSelector('#token-container');
     *
     * const seView = new Presence.SecureEntryView();
     * seView.setSelector(aDOMNode);
     */
    setSelector(sel) {
        _renderer.get(this).containerNode = getNode(sel);
    }

    /**
     * @public
     * @description
     * Set the token for this renderer.
     *
     * If a valid selector is already set, the token will be rendered immediately.
     *
     * Optionally customize any token parsing errors.
     *
     * Note that there is 60 character limit. If the character limit is
     * exceeded, the text "Reload ticket" is rendered instead.
     *
     * @param {String} token - A secure token retrieved from the Presence Delivery API.
     * @param {String} [parseErrorText] - The error text to use if token parsing fails. Defaults to "Reload ticket"
     * @example
     * const seView = new Presence.SecureEntryView();
     * seView.setToken('123456');
     *
     * const seView = new Presence.SecureEntryView();
     * seView.setToken('123456', 'Please visit the box office');
     */
    setToken(token, parseErrorText) {
        /** @type InternalRenderer */
        const renderer = _renderer.get(this);
        renderer.parseErrorText = parseErrorText;
        renderer.token = token;
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
     * Deprecated: Use `setToken(token, parseErrorText)` instead.
     *
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
        _renderer.get(this).parseErrorText = errorText;
    }

    /**
     * @public
     * @description
     * Displays a custom error message.
     *
     * Note that there is 60 character limit. If the character limit is
     * exceeded, the text "Reload ticket" is rendered instead.
     *
     * @param {Object} error - An error object.
     * @param {String} error.text - The text of the error
     * @param {String} [error.iconURL] - A URL for a 36x32 image for the error icon.
     * @example
     * const seView = new Presence.SecureEntryView();
     * seView.showError({
     *     text: 'Ticket not found'
     *     iconURL: 'https://your-cdn.com/36x32-error.png'
     * });
     */
    showError(error) {
        _renderer.get(this).error = error;
    }

    /**
     * @public
     * @description
     * Allows branding color on subtitle text to be enabled.
     *
     * @param {Boolean} isEnabled - Whether or not subtitle should use branding color
     * @example
     * const seView = new Presence.SecureEntryView();
     * seView.setBrandingColor('#076CD9');
     * seView.enableBrandedSubtitle(true)
     */
    enableBrandedSubtitle(isEnabled) {
        _renderer.get(this).isBrandingColoredSubtitleEnabled = !!isEnabled;
    }

    /**
     * @public
     * @description
     * Creates a custom subtitle for the PDF417 variant of the SafeTix ticket.
     * Will truncate if longer than the barcode.
     *
     * Note: If set to a falsy value, the barcode subtitle will be hidden.
     *
     * @param {String} subtitle - The text to display beneath PDF417 barcode
     * @example
     * const seView = new Presence.SecureEntryView();
     * seView.setPDF417Subtitle('A custom subtitle');
     */
    setPDF417Subtitle(subtitle) {
        _renderer.get(this).pdf417Subtitle = subtitle;
    }

    /**
     * @public
     * @description
     * Creates a custom subtitle for the QR code variant of the SafeTix ticket.
     * Will truncate if longer than the barcode.
     *
     * Note: If set to a falsy value, the barcode subtitle will be hidden.
     *
     * @param {String} subtitle - The text to display beneath QR barcode
     * @example
     * const seView = new Presence.SecureEntryView();
     * seView.setQRCodeSubtitle('A custom subtitle');
     */
    setQRCodeSubtitle(subtitle) {
        _renderer.get(this).qrCodeSubtitle = subtitle;
    }

    /**
     * @public
     * @description
     * Performs clean steps so that the SecureEntryView can be safely removed from DOM tree.
     *
     * @example
     * const seView = new Presence.SecureEntryView();
     *
     * // Sometime later prior to removing the container element or SecureEntryView from DOM tree.
     * seView.teardown();
     */
    teardown() {
        _renderer.get((this)).teardown();
    }
}
