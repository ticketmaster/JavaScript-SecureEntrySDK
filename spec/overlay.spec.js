const { testCSSValuesAsIntegers } = require('./helpers');
const { OverlayView } = require('../src/views/overlay');
const { Dimensions } = require('../src/helpers/constants');

describe('overlay', () => {
    const overlayWidth = Dimensions.pdf417.WIDTH + Dimensions.pdf417.PADDING * 2;
    const overlayHeight = Dimensions.pdf417.HEIGHT + Dimensions.pdf417.PADDING * 2;
    const overlay = new OverlayView('blue', overlayWidth, overlayHeight, Dimensions.pdf417.PADDING);

    it('should size and place container element correctly', () => {
        const expectedCSSValues = {
            width: overlayWidth,
            height: overlayHeight,
            top: 0,
            left: 0
        };
        testCSSValuesAsIntegers(overlay.el.style, expectedCSSValues);
    });

    it('shold size and place primary bar element correctly', () => {
        const primaryOverlay = overlay.el.childNodes[0];
        const expectedCSSValues = {
            width: Dimensions.pdf417.PADDING * 0.5,
            height: 100,
            left: 2
        };
        testCSSValuesAsIntegers(primaryOverlay.style, expectedCSSValues);
    });

    it('should size and place secondary bar element correctly', () => {
        const secondaryOverlay = overlay.el.childNodes[1];
        const expectedHeight = overlayHeight - Dimensions.pdf417.PADDING;
        const expectedCSSValues = {
            width: Dimensions.pdf417.PADDING,
            height: expectedHeight,
            top: (overlayHeight - expectedHeight) * 0.5
        };
        testCSSValuesAsIntegers(secondaryOverlay.style, expectedCSSValues);
    });
});
