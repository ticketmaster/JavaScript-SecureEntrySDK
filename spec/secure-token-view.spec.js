const { expect } = require('chai');
const { testCSSValuesAsIntegers } = require('./helpers');
const { SecureTokenView } = require('../src/views/secure-token-view');
const { pdf417 } = require('../src/helpers/dimensions');

const ID_PREFIX = 'psetokenview-';

describe('secure-token-view', () => {
    describe('SecureTokenView', () => {
        it('should expose an underlying div element', () => {
            const view = new SecureTokenView();
            expect(view.el).to.exist;
            expect(view.el).to.be.an.instanceOf(HTMLDivElement);
        });

        it('should assign an element id based on provided id', () => {
            const providedId = 'providedId';
            const view = new SecureTokenView({ id: providedId });
            expect(view.el.id).to.equal(`${ID_PREFIX}div-${providedId}`);
        });

        it('should assign an element id with no provided id', () => {
            const views = [
                // No options (and thus no id).
                new SecureTokenView(),

                // Options, but no id.
                new SecureTokenView({})
            ];

            views.forEach((view) => {
                const [, actualId] = view.el.id.split(ID_PREFIX);
                expect(actualId).to.exist;
                expect(actualId).to.not.equal('undefined');
            });
        });

        it('should have an underlying canvas', () => {
            const view = new SecureTokenView();
            const canvas = view.el.querySelector('canvas');
            expect(canvas).to.exist;
        });

        it('should be aspect ratio of 4:1 of the provided width', () => {
            const expectedWidth = 300;
            const padding = Math.floor(expectedWidth * pdf417.paddingPercentage);
            const canvasWidth = expectedWidth - padding;
            const canvasHeight = Math.floor(canvasWidth * pdf417.ratio);
            const expectedHeight = canvasHeight + padding;

            const view = new SecureTokenView({ w: expectedWidth, h: 10 });

            testCSSValuesAsIntegers(
                view.el.style,
                {
                    width: expectedWidth,
                    height: expectedHeight
                }
            );
        });

        it('should flip vertically when rendered', () => {
            const view = new SecureTokenView();
            const style = view.el.querySelector('canvas').style;

            view.render('flip');
            expect(style.transform).to.equal('scaleY(1)');

            view.render('flip');
            expect(style.transform).to.equal('scaleY(-1)');
        });
    });
});
