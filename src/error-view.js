const { TokenViewBase } = require('./token-views');
const { container, error: errorDimensions } = require('./dimensions');
const { createElement, applyStyle } = require('./utils');
const alertIcon = require('./img/Alert-Filled-36.svg');

const DEFAULT_ERROR_TEXT = 'Reload ticket';
const MAX_ERROR_TEXT_LENGTH = 60;

/**
 * A class representing an invalid token.
 */
class ErrorView extends TokenViewBase {
    constructor(options = {}) {
        const defaults = { idPrefix: 'pseerrorview', errorText: DEFAULT_ERROR_TEXT };
        const mergedOptions = { ...defaults, ...options };
        super(mergedOptions);

        this._errorMessage = isValidErrorText(mergedOptions.errorText) ? mergedOptions.errorText : DEFAULT_ERROR_TEXT;
    }

    setSize({ containerWidth, containerHeight }) {
        const boundsPadding = containerWidth * errorDimensions.boundsPaddingPercentage;
        const errorWidth = Math.floor(containerWidth * (errorDimensions.minWidth / container.minWidth)) - boundsPadding * 2;
        const errorHeight = Math.floor(containerHeight * (errorDimensions.minHeight / container.minHeight)) - boundsPadding * 2;
        this._setContainerSize(errorWidth, errorHeight, '', `${boundsPadding}px`);

        // TODO: Refactor TokenViewBase to not assume canvas rendering
        this.el.querySelector('canvas').remove();

        applyStyle(this.el, {
            top: '50%',
            left: '50%',
            transform: 'translateY(-50%) translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignContent: 'center',
            backgroundColor: 'white',
            borderRadius: '4px',

            // TODO: Consider moving to view container in the event we render text in other views.
            color: '#7A7A7A',
            fontSize: `${containerHeight * errorDimensions.fontPercentage}px`,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Roboto", "Fira Sans", "Helvetica Neue", sans-serif'
        });

        const img = createElement('img',
            {
                src: `data:image/svg+xml;base64,${global.btoa(alertIcon)}`,
                width: errorDimensions.iconWidth,
                height: errorDimensions.iconHeight
            },
            {
                margin: `auto auto ${containerWidth * errorDimensions.internalPaddingPercentage}px auto`
            }
        );
        this.el.appendChild(img);

        const txt = createElement('p',
            null,
            {
                margin: '0px auto auto auto',
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }
        );
        this.el.appendChild(txt);
        this._textEl = txt;
    }

    render() {
        this._textEl.innerText = this._errorMessage;
    }
}

/**
 * Returns whether or not supplied text is valid error text.
 *
 * @param {Any} errorText
 */
const isValidErrorText = errorText => typeof errorText === 'string' && errorText.length <= MAX_ERROR_TEXT_LENGTH;

module.exports = {
    ErrorView
};
