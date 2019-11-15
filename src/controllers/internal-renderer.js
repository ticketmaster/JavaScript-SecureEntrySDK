/**
 * @module
 */

import * as utils from '../helpers/utils';
import { EntryData, DisplayType } from '../models/entry-data';
import { ErrorView } from '../views/error-view';
import { StaticBarcodeView } from '../views/static-barcode-view';
import { SecureTokenView } from '../views/secure-token-view';
import { LoadingView } from '../views/loading-view';
import {
    container as legacyDimensions,
    containerNew as newDimensions,
    containerSizes
} from '../helpers/dimensions';
import * as timeSync from '../helpers/time-sync';

const DEFAULT_BRANDING_COLOR = '#076CD9';
const REFRESH_INTERVAL = 15;
const HEX_COLOR_WITH_ALPHA_REGEX = /(#\w{6})\w{2}$/;
const SHORTHAND_HEX_COLOR_WITH_ALPHA_REGEX = /(#\w{3})\w$/;
const COLOR_FUNCTION_REGEX = /(\w+?)a?\((.+?)\)$/;
const DEFAULT_BARCODE_SUBTITLE = `Screenshots won't get you in.`;

/**
 * Render Modes
 *
 * @readonly
 * @enum {String}
 */
export const RenderModes = {
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
 * @property {Node} [containerNode] - A DOM node that will be rendered into.
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
export class InternalRenderer {
    constructor(options = {}) {
        _id.set(this, utils.getRandomIdentifier());
        _mode.set(this, options.renderMode || RenderModes.DEFERRED);

        this._rootEl = utils.createElement('div', { id: `pseview-${_id.get(this)}` });
        this._loadingView = null;
        this._barcodeView = null;
        this._secureTokenView = null;
        this._brandingColor = DEFAULT_BRANDING_COLOR;

        /**
         * Whether or not subtitle text color should be set to `brandingColor`.
         *
         * @type Boolean
         * @default false
         */
        this.isBrandingColoredSubtitleEnabled = false;

        /**
         * Text to display beneath the PDF417 variant of the barcode. If set
         * to a falsy value, the text will be hidden.
         *
         * @type String
         */
        this.pdf417Subtitle = DEFAULT_BARCODE_SUBTITLE;

        /**
         * Text to display beneath the PDF417 variant of the barcode. If set
         * to a falsy value, the text will be hidden.
         *
         * @type String
         */
        this.qrCodeSubtitle = DEFAULT_BARCODE_SUBTITLE;

        /** @type EntryData */
        this._entryData = null;

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
        this._useNewSpec = containerSizes.hasOwnProperty(`SIZE_${options.containerSize}`);
        this._containerNode = options.containerNode;
        this.updateBarcodeContainerSize();

        this._token = options.token;
        this._entryData = new EntryData(this._token);
        this.parseErrorText = options.parseErrorText || options.errorText;

        this.brandingColor = options.brandingColor || this.brandingColor;

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
     * The node this renderer should render to.
     *
     * If `token` is set and `mode` is `RenderModes.IMMEDIATE`, will
     * automatically render.
     *
     * @type {String}
     */
    get containerNode() {
        return this._containerNode;
    }

    set containerNode(node) {
        this._containerNode = node;

        // TODO: Always attempt to reattach to the integrator node.
        // TODO: Resize all child views in the event we are attached to a new element of a different size.

        this.updateBarcodeContainerSize();

        if (this.mode === RenderModes.IMMEDIATE) {
            this.render();
        }
    }

    /**
     * The token the renderer should render.
     *
     * If `containerNode` is set and `mode` is `RenderModes.IMMEDIATE`, will
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
        this._entryData = new EntryData(this._token);

        if (this.mode === RenderModes.IMMEDIATE && !oldToken) {
            this.render();
        }
    }

    /**
     * The error the renderer should render.
     *
     * If `containerNode` is set and `mode` is `RenderModes.IMMEDIATE`, will
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

    get brandingColor() {
        return this._brandingColor;
    }

    set brandingColor(color) {
        if (color === 'transparent') {
            return;
        }

        let regexResult;
        let newColor = color;

        // Strip alpha channel from full and shorthand hex color notation.
        regexResult = color.match(HEX_COLOR_WITH_ALPHA_REGEX);
        if (regexResult) {
            newColor = regexResult[1];
        }
        regexResult = color.match(SHORTHAND_HEX_COLOR_WITH_ALPHA_REGEX);
        if (regexResult) {
            newColor = regexResult[1];
        }

        // Strip alpha channel from functional color notation.
        regexResult = color.match(COLOR_FUNCTION_REGEX);
        if (regexResult) {
            let colorFunctionParameters = regexResult[2]
                // Normalize parameter delimiters to spaces.
                .replace(/[/,]/g, ' ').split(/\s+/)
                // CSS color functions we're supporting have alpha channel as
                // optional 4th parameter, so we only want parameters up to there.
                .slice(0, 3);
            newColor = `${regexResult[1]}(${colorFunctionParameters.join()})`;
        }

        this._brandingColor = newColor;
    }

    /**
     * Performs clean up steps allowing safe removal from DOM tree.
     */
    teardown() {
        // TODO: Look into a MutationObserver to automatically cleanup.
        clearInterval(this._tokenRefreshIntervalID);
    }

    // TODO: Prefix internal methods with '_'.
    /**
     * Whether or not the renderer is currently renderable.
     *
     * @readonly
     * @type {Boolean}
     */
    get isRenderable() {
        return !!(this._containerNode && (this.token || this.error));
    }

    // TODO: Prefix internal methods with '_'.
    updateBarcodeContainerSize() {
        if (this._containerNode) {
            (this.mode === RenderModes.IMMEDIATE) && this._containerNode.appendChild(this._rootEl);

            const dimensions = (this._useNewSpec) ? newDimensions : legacyDimensions;
            const width = Math.max(this._containerNode.clientWidth, dimensions.minWidth);
            const height = Math.ceil(width * dimensions.ratio);

            utils.applyStyle(this._rootEl, {
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
                    w: this._rootEl.clientWidth,
                    h: this._rootEl.clientHeight
                });
                utils.applyStyle(this._loadingView.el, { opacity: 1 });
                this._rootEl.appendChild(this._loadingView.el);
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

        utils.Logger.log(`'render' called on '${`pseview-${_id.get(this)}`}' with token '${this.token}'`);

        if (!this._containerNode) {
            utils.Logger.error(`'render' called on '${`pseview-${_id.get(this)}`}' with no container`);
            return;
        }

        this._containerNode.appendChild(this._rootEl);

        const viewOptions = {
            id: _id.get(this),
            w: this._rootEl.clientWidth,
            h: this._rootEl.clientHeight,
            color: this.brandingColor || DEFAULT_BRANDING_COLOR,
            errorText: this.parseErrorText,
            useBrandingColorForSubtitle: this.isBrandingColoredSubtitleEnabled,
            useNewSpec: this._useNewSpec
        };

        if (this.error) {
            viewOptions.errorText = this.error.text;
            viewOptions.iconURL = this.error.iconURL;
        }

        const displayType = this._entryData.displayType;
        switch (displayType) {
            case DisplayType.STATIC_QR:
                this.setupSimpleView(StaticBarcodeView, viewOptions);
                break;

            case DisplayType.ROTATING: case DisplayType.STATIC_PDF:
                this.setupSafeTixView(viewOptions);
                break;

            default:
                this.setupSimpleView(ErrorView, viewOptions);
        }
    }

    /**
     * Setup the provided BarcodeViewClass
     *
     * @param {Object} BarcodeViewClass - The class to create and render.
     * @param {Object} viewOptions - The view options used in class creation.
     * @param {Boolean} displayImmediately - Whether or not the class should immediately be visible.
     */
    setupSimpleView(BarcodeViewClass, viewOptions, displayImmediately = true) {
        this._barcodeView = new BarcodeViewClass(viewOptions);
        utils.applyStyle(this._barcodeView.el, { opacity: 0 });
        this._barcodeView.render(this._entryData.barcode);
        this._rootEl.appendChild(this._barcodeView.el);

        if (displayImmediately) {
            utils.swapElementStyles(this._loadingView.el, this._barcodeView.el, ['opacity']);
        }
    }

    /**
     * Setup the SafeTix view.
     *
     * @param {Object} viewOptions - The view options used in class creation.
     */
    setupSafeTixView(viewOptions) {
        this._secureTokenView = new SecureTokenView({
            subtitle: this.pdf417Subtitle,
            ...viewOptions
        });

        timeSync.syncTime(null, timeDelta => {
            const date = timeSync.dateFromTimeDelta(timeDelta);
            this._secureTokenView.render(this._entryData.generateSignedToken(date));

            if (this._entryData.displayType === DisplayType.ROTATING) {
                this._tokenRefreshIntervalID = setInterval(() => {
                    utils.Logger.debug(`pseview-${_id.get(this)} refreshed token at ${new Date()}`);
                    const date = timeSync.dateFromTimeDelta(timeSync.getCachedTimeDelta());
                    this._secureTokenView.render(this._entryData.generateSignedToken(date));
                }, REFRESH_INTERVAL * 1000);
            }

            utils.applyStyle(this._secureTokenView.el, { top: '0px', opacity: 0 });
            this._rootEl.appendChild(this._secureTokenView.el);
            utils.swapElementStyles(this._loadingView.el, this._secureTokenView.el, ['opacity']);
        });
    }
}
