const anime = require('animejs');
const { createElement } = require('./utils');

// We use WeakMaps to mimic private access modifier.
const _container = new WeakMap();
const _color = new WeakMap();
const _timeline = new WeakMap();

class OverlayView {
    constructor(color, width, height, padding) {
        const sharedCSS = {
            position: 'absolute',
            display: 'inline-block'
        };

        const primaryOverlay = createElement(
            'div',
            null,
            {
                backgroundColor: color,
                width: `${padding * 0.5}px`,
                height: '100%',
                left: '2px',
                top: '0px',
                ...sharedCSS
            }
        );

        const secondaryOverlayHeight = height - padding;
        const secondaryOverlay = createElement(
            'div',
            null,
            {
                backgroundColor: color,
                opacity: 0.50,
                width: `${padding}px`,
                height: `${secondaryOverlayHeight}px`,
                left: '0px',
                top: `${(height - secondaryOverlayHeight) * 0.5}px`,
                ...sharedCSS
            }
        );

        const overlayContainer = createElement(
            'div',
            null,
            {
                width: `${width}px`,
                height: `${height}px`,
                top: '0px',
                left: '0px',
                ...sharedCSS
            },
            [primaryOverlay, secondaryOverlay]
        );

        _container.set(this, overlayContainer);
        _color.set(this, color);
        _timeline.set(this, createAnimationTimeline(primaryOverlay, secondaryOverlay, width));
    }

    /**
     * @returns HTMLDivElement
     */
    get el() {
        return _container.get(this);
    }

    get color() {
        return _color.get(this);
    }

    set color(clr) {
        // TODO: prob won't work with invalid color
        _color.set(this, clr);

        /** @type HTMLElement */
        const el = _container.get(this);
        el.childNodes.forEach(el => {
            el.style.backgroundColor = clr;
        });
    }

    pauseAnimation() {
        _timeline.get(this).pause();
    }

    playAnimation() {
        _timeline.get(this).play();
    }
}

/**
 * @param {HTMLElement} primaryOverlay
 * @param {HTMLElement} secondaryOverlay
 * @param {Number} width
 */
function createAnimationTimeline(primaryOverlay, secondaryOverlay, width) {
    const easing = 'easeOutQuint';
    const duration = 1.5 * 1000;
    const offset = `-=${duration - 100}`;

    const timeline = anime.timeline({
        loop: true,
        autoplay: false,
        easing,
        duration
    });

    // Animate overlay movement to the right
    timeline.add({
        targets: primaryOverlay,
        translateX: width - parseInt(primaryOverlay.style.width) - (parseInt(primaryOverlay.style.left) * 2)
    });
    timeline.add({
        targets: secondaryOverlay,
        translateX: width - parseInt(secondaryOverlay.style.width),
        offset
    });

    // Animate overlay movement to the left
    timeline.add({
        targets: primaryOverlay,
        translateX: 0
    });
    timeline.add({
        targets: secondaryOverlay,
        translateX: 0,
        offset
    });

    return timeline;
}

module.exports = OverlayView;
