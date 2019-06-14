import { TokenViewBase } from './token-views';
import { container, error as errorDimensions } from '../helpers/dimensions';
import { createElement, applyStyle } from '../helpers/utils';
import alertIcon from '../assets/error-icon.svg';

export const DEFAULT_ERROR_TEXT = 'Reload ticket';
export const MAX_ERROR_TEXT_LENGTH = 60;
export const DEFAULT_ICON_URL = `data:image/svg+xml;base64,${global.btoa(alertIcon)}`;

/**
 * A class representing an invalid token.
 */
export class ErrorView extends TokenViewBase {
    constructor(options = {}) {
        const defaults = {
            idPrefix: 'pseerrorview',
            errorText: DEFAULT_ERROR_TEXT,
            iconURL: DEFAULT_ICON_URL
        };
        const mergedOptions = { ...defaults, ...options };
        super(mergedOptions);

        this.setSize({
            containerWidth: options.w,
            containerHeight: options.h
        });

        this._errorMessage = isValidErrorText(mergedOptions.errorText) ? mergedOptions.errorText : DEFAULT_ERROR_TEXT;
        this._iconURL = isValidImageURL(mergedOptions.iconURL) ? mergedOptions.iconURL : DEFAULT_ICON_URL;
        this._icon.src = this._iconURL;
    }

    setSize({ containerWidth, containerHeight }) {
        const boundsPadding = containerWidth * errorDimensions.boundsPaddingPercentage;
        const errorWidth = Math.floor(containerWidth * (errorDimensions.minWidth / container.minWidth)) - boundsPadding * 2;
        const errorHeight = Math.floor(containerHeight * (errorDimensions.minHeight / container.minHeight)) - boundsPadding * 2;
        this._setContainerSize(errorWidth, errorHeight, '', `${boundsPadding}px`);

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

        this._icon = createElement('img',
            {
                src: this._iconURL,
                width: errorDimensions.iconWidth,
                height: errorDimensions.iconHeight
            },
            {
                margin: `auto auto ${containerWidth * errorDimensions.internalPaddingPercentage}px auto`
            }
        );
        this.el.appendChild(this._icon);

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

/**
 * Returns whether or not supplied image url is valid.
 *
 * @param {Any} imageURL
 */
const isValidImageURL = imageURL => typeof imageURL === 'string' && imageURL !== '';
