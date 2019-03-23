/**
 * @module
 */

const utils = require('./utils');
const { TokenSigner, DisplayType } = require('./token');
const { ErrorView } = require('./error-view');
const { StaticBarcodeView } = require('./static-barcode-view');
const { SecureTokenView } = require('./secure-token-view');
const { ToggleButton } = require('./toggle-button');
const { LoadingView } = require('./loading-view');
const { container: containerDimensions } = require('./dimensions');

const DEFAULT_BRANDING_COLOR = '#076CD9';
const REFRESH_INTERVAL = 15;

/**
 * Render Modes
 *
 * @readonly
 * @enum {String}
 */
const RenderModes = {
    /** Should render immediately after all rendering criteria is met. */
    IMMEDIATE: 'immediate',
    /** Should only render explicitly. */
    DEFERRED: 'deferred'
};

// We use WeakMaps to mimic private access modifier.
const _id = new WeakMap();
const _mode = new WeakMap();

/**
 * @typedef InternalRendererConfiguration
 * @property {String} [selector] - A `DOMString` containing a selector to match.
 * @property {String} [token] - A valid token.
 * @property {Object} [error] - An error object.
 * @property {String} [brandingColor] - A color.
 * @property {String} [errorText] - Deprecated: Use `parseErrorText` instead.
 * @property {String} [parseErrorText] - Text to display when parsing token fails.
 * @property {RenderModes} [renderMode] - Render mode.
 */

// TODO: More appropriate name, SecureEntryViewController?
/**
 *
 * @param {InternalRendererConfiguration} [options] - Renderer configuration.
 */
class InternalRenderer {
    constructor(options = {}) {
        _id.set(this, utils.getRandomIdentifier());
        _mode.set(this, options.renderMode || RenderModes.DEFERRED);

        this._viewContainer = utils.createElement('div', { id: `pseview-${_id.get(this)}` });
        this._loadingView = null;
        this._barcodeView = null;
        this._secureTokenView = null;

        /** @type ToggleButton */
        this._toggleButton = null;

        /** @type TokenSigner */
        this._tokenSigner = null;

        this.setConfiguration(options);
    }

    /**
     * This allows complete instance configuration after its instantiation.
     *
     * @param {InternalRendererConfiguration} options - Renderer configuration.
     */
    setConfiguration(options = {}) {
        // We must access private members directly to avoid accidently
        // triggering multiple renders with the accessors.
        this._selector = options.selector;
        this.updateBarcodeContainerSize();

        this._token = options.token;
        this._tokenSigner = new TokenSigner(this._token);
        this.parseErrorText = options.parseErrorText || options.errorText;

        this.brandingColor = options.brandingColor || DEFAULT_BRANDING_COLOR;

        (_mode.get(this) === RenderModes.IMMEDIATE && this.isRenderable) && this.render();
    }

    /**
     * Unique identifier for this instance. This should be used when assigning
     * ids to any DOM elements the renderer creates.
     *
     * @readonly
     * @type {String}
     */
    get id() {
        return _id.get(this);
    }

    /**
     * Render mode
     */
    get mode() {
        return _mode.get(this);
    }

    set mode(val) {
        const newMode = RenderModes[val.toUpperCase()];
        if (newMode) {
            _mode.set(this, newMode);
        }
    }

    /**
     * The CSS selector this renderer should render to.
     *
     * If `token` is set and `mode` is `RenderModes.IMMEDIATE`, will
     * automatically render.
     *
     * @type {String}
     */
    get selector() {
        return this._selector;
    }

    set selector(sel) {
        let oldSel;
        [this._selector, oldSel] = [sel, this._selector];

        // TODO: Always attempt to reattach to the integrator node.
        // TODO: Resize all child views in the event we are attached to a new element of a different size.

        this.updateBarcodeContainerSize();

        if (this.mode === RenderModes.IMMEDIATE && !oldSel) {
            this.render();
        }
    }

    /**
     * The token the renderer should render.
     *
     * If `selector` is set and `mode` is `RenderModes.IMMEDIATE`, will
     * automatically render.
     *
     * @type {String}
     */
    get token() {
        return this._token;
    }

    set token(token) {
        let oldToken;
        [this._token, oldToken] = [token, this._token];

        // This seems problematic if we want to support null to clear renderer state
        this._tokenSigner = new TokenSigner(this._token);

        if (this.mode === RenderModes.IMMEDIATE && !oldToken) {
            this.render();
        }
    }

    /**
     * The error the renderer should render.
     *
     * If `selector` is set and `mode` is `RenderModes.IMMEDIATE`, will
     * automatically render.
     *
     * @type {Object}
     */
    get error() {
        return this._error;
    }

    set error(err) {
        this._error = err;

        if (this.mode === RenderModes.IMMEDIATE) {
            this.render();
        }
    }

    // TODO: Prefix internal methods with '_'.
    /**
     * Whether or not the renderer is currently renderable.
     *
     * @readonly
     * @type {Boolean}
     */
    get isRenderable() {
        return !!(this.selector && (this.token || this.error));
    }

    // TODO: Prefix internal methods with '_'.
    updateBarcodeContainerSize() {
        const integratorContainer = document.querySelector(this.selector);
        if (integratorContainer) {
            (this.mode === RenderModes.IMMEDIATE) && integratorContainer.appendChild(this._viewContainer);

            const width = Math.max(integratorContainer.clientWidth, containerDimensions.minWidth);
            const height = Math.ceil(width * containerDimensions.ratio);

            utils.applyStyle(this._viewContainer, {
                width: `${width}px`,
                height: `${height}px`,
                display: 'inline-block',
                margin: 0,
                padding: 0,
                position: 'relative',
                overflow: 'hidden'
            });

            if (!this._loadingView) {
                this._loadingView = new LoadingView({
                    id: _id.get(this),
                    w: this._viewContainer.clientWidth,
                    h: this._viewContainer.clientHeight
                });
                utils.applyStyle(this._loadingView.el, { opacity: 1 });
                this._viewContainer.appendChild(this._loadingView.el);
            }
        }
    }

    // TODO: Support reusing this instance to render a new token
    //          - Create views once
    //          - Append view container once? Might not be necessary as would already support 'moving' to new selector
    //          - How to handle new token generates error?
    // TODO: Useful and updated log messages. Perhaps lower log level console isn't spammed by default?
    render() {
        if (!this.isRenderable) {
            return;
        }

        utils.Logger.log(`'render' called with selector '${this.selector}' and barcode '${this.token}'`);

        const integratorContainer = document.querySelector(this.selector);
        if (!integratorContainer) {
            utils.Logger.error(`No element found for selector '${this.selector}'`);
            return;
        }

        integratorContainer.appendChild(this._viewContainer);

        const viewOptions = {
            id: _id.get(this),
            w: this._viewContainer.clientWidth,
            h: this._viewContainer.clientHeight,
            color: this.brandingColor || DEFAULT_BRANDING_COLOR,
            errorText: this.parseErrorText
        };

        if (this.error) {
            viewOptions.errorText = this.error.text;
            viewOptions.iconURL = this.error.iconURL;
        }

        const displayType = this._tokenSigner.displayType;

        // We always render at least a QR code or error state.
        let BarcodeViewClass = (displayType === DisplayType.INVALID) ? ErrorView : StaticBarcodeView;
        this._barcodeView = new BarcodeViewClass(viewOptions);
        let mainContentViewEl = this._barcodeView.el;
        utils.applyStyle(this._barcodeView.el, { opacity: 0 });

        this._viewContainer.appendChild(this._barcodeView.el);
        this._barcodeView.render(this._tokenSigner.barcode);

        // If we have RET, we'll enhance qr code view with secure token view
        if (displayType === DisplayType.ROTATING || displayType === DisplayType.STATIC_PDF) {
            // Setup SecureTokenView
            this._secureTokenView = new SecureTokenView(viewOptions);
            mainContentViewEl = this._secureTokenView.el;
            this._secureTokenView.render(this._tokenSigner.generateSignedToken());

            if (displayType === DisplayType.ROTATING) {
                setInterval(() => {
                    this._secureTokenView.render(this._tokenSigner.generateSignedToken());
                }, REFRESH_INTERVAL * 1000);
            }

            // Add toggle button
            this._toggleButton = new ToggleButton({
                ...viewOptions,
                onToggle: () => utils.swapElementStyles(this._secureTokenView.el, this._barcodeView.el, ['top', 'opacity'])
            });

            // Reposition views as SecureTokenView should now be primary
            utils.applyStyle(this._secureTokenView.el, { top: '0px', opacity: 0 });
            utils.applyStyle(this._barcodeView.el, { top: `${viewOptions.h}px`, opacity: 0 });
            utils.applyStyle(this._toggleButton.el, { opacity: 0 });

            this._viewContainer.appendChild(this._secureTokenView.el);
            this._viewContainer.appendChild(this._toggleButton.el);
        }

        // Now that we've rendered content, fade in the main content view.
        utils.swapElementStyles(this._loadingView.el, mainContentViewEl, ['opacity']);
        if (displayType === DisplayType.ROTATING || displayType === DisplayType.STATIC_PDF) {
            utils.swapElementStyles(this._loadingView.el, this._toggleButton.el, ['opacity']);
        }
    }
}

module.exports = {
    InternalRenderer,
    RenderModes
};
