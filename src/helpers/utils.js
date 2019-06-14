import * as anime from 'animejs';

// Uses `webpack-auto-inject-version` package to inject version string
const LOG_PREFIX = 'Ticketmaster Presence SDK v[AIV]{version}[/AIV]: ';

/**
 * Utility for creating DOM elements.
 *
 * @param {String} element
 * @param {Object} elementAttributes
 * @param {Object} cssAttributes
 * @param {Array} children
 *
 * @returns HTMLElement
 */
export const createElement = (element, elementAttributes = {}, cssAttributes = {}, children = []) => {
    const el = document.createElement(element);

    // TODO: Perhaps use Object.entries
    elementAttributes && Object.keys(elementAttributes).forEach(function (attr) { this[attr] = elementAttributes[attr]; }, el);
    cssAttributes && Object.keys(cssAttributes).forEach(function (attr) { this[attr] = cssAttributes[attr]; }, el.style);

    children.forEach(childEl => { el.appendChild(childEl); });

    return el;
};

/**
 * Utility for applying a series of updates to the provided element's CSSStyleDeclaration
 *
 * @param {HTMLElement} element
 * @param {Object} cssAttributes
 */
export const applyStyle = (element, cssAttributes) => {
    cssAttributes && Object.keys(cssAttributes).forEach(function (attr) { this[attr] = cssAttributes[attr]; }, element.style);
};

// TODO: Document
export function getRandomIdentifier() {
    return Math.round(Math.random() * 1e10);
}

// TODO: Document
export class Logger {
    static log(msg) {
        console.log(`${LOG_PREFIX}${msg}`);
    }

    static error(msg) {
        console.error(`${LOG_PREFIX}${msg}`);
    }

    static debug(msg) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`${LOG_PREFIX}[DEBUG]: ${msg}`);
        }
    }
}

/**
 * Swap CSS properties between two elements. Defaults to being animated with an easing function of
 * `easeOutBack` and duration of 300ms.
 *
 * @param {HTMLElement} el1 - The first element.
 * @param {HTMLElement} el2 - The second element.
 * @param {Array} cssProperties - Array of CSS properties to swap.
 * @param {Function} [complete] - Function to execute when animation is complete
 * @param {String} [easing] - Easing function to use when animated. Defaults to 'easeOutBack'
 * @param {Number} [duration] - Duration of animation in milliseconds. Defaults to 300.
 */
export const swapElementStyles = (el1, el2, cssProperties, complete, easing = 'easeOutBack', duration = 300) => {
    const timeline = anime.timeline({ easing, duration, complete });

    let el1Anim = { targets: el1, offset: 0 };
    let el2Anim = { targets: el2, offset: 0 };

    cssProperties.forEach(prop => {
        const props = [el2.style[prop], el1.style[prop]];
        el2Anim[prop] = props;
        el1Anim[prop] = [...props].reverse();
    });

    timeline.add({ ...el1Anim });
    timeline.add({ ...el2Anim });
};
