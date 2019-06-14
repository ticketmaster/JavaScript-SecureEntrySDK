const { expect } = require('chai');
const { testCSSValuesAsIntegers } = require('./helpers');
const { StaticBarcodeView } = require('../src/views/static-barcode-view');

const ID_PREFIX = 'psebarcodeview-';

describe('static-barcode-view', () => {
    describe('StaticBarcodeView', () => {
        it('should expose a div element', () => {
            const view = new StaticBarcodeView();
            expect(view.el).to.exist;
            expect(view.el).to.be.an.instanceOf(HTMLDivElement);
        });

        it('should assign an element id based on provided id', () => {
            const providedId = 'providedId';
            const view = new StaticBarcodeView({ id: providedId });
            expect(view.el.id).to.equal(`${ID_PREFIX}div-${providedId}`);
        });

        it('should assign an element id with no provided id', () => {
            const views = [
                // No options (and thus no id).
                new StaticBarcodeView(),

                // Options, but no id.
                new StaticBarcodeView({})
            ];

            views.forEach((view) => {
                const [, actualId] = view.el.id.split(ID_PREFIX);
                expect(actualId).to.exist;
                expect(actualId).to.not.equal('undefined');
            });
        });

        it('should have an underlying canvas', () => {
            const view = new StaticBarcodeView();
            const canvas = view.el.querySelector('canvas');
            expect(canvas).to.exist;
        });

        it('should be aspect ratio of 1:1 of the provided height', () => {
            const barcodeSize = 120;
            const expectedSize = barcodeSize;
            const view = new StaticBarcodeView({ w: 5, h: barcodeSize });
            testCSSValuesAsIntegers(
                view.el.style,
                {
                    width: expectedSize,
                    height: expectedSize
                }
            );
        });
    });

    describe('barcode subtitle', () => {
        const subtitle = 'subtitle';
        const subtitleSelector = 'p[id*=subtitle]';

        it('should not render subtitle when not provided in constructor', () => {
            const view = new StaticBarcodeView();
            expect(view.el.querySelector(`subtitle`)).to.not.exist;
        });

        it('should not render subtitle when property set to nil', () => {
            const view = new StaticBarcodeView();

            expect(view.el.querySelector(subtitleSelector)).to.not.exist;

            view.subtitle = subtitle;

            const subtitleEl = view.el.querySelector(subtitleSelector);
            expect(subtitleEl).to.exist;
            expect(subtitleEl.innerHTML).to.equal(subtitle);

            view.subtitle = null;
            expect(view.el.querySelector(subtitleSelector)).to.not.exist;
        });

        it('should render subtitle when provided in constructor', () => {
            const view = new StaticBarcodeView({ subtitle });

            const subtitleEl = view.el.querySelector(subtitleSelector);
            expect(subtitleEl).to.exist;
            expect(subtitleEl.innerHTML).to.equal(subtitle);
        });

        it('should render subtitle when provided in property', () => {
            const view = new StaticBarcodeView();

            let subtitleEl = view.el.querySelector(subtitleSelector);
            expect(subtitleEl).to.not.exist;

            view.subtitle = subtitle;

            subtitleEl = view.el.querySelector(subtitleSelector);
            expect(subtitleEl).to.exist;
            expect(subtitleEl.innerHTML).to.equal(subtitle);
        });
    });
});
