const expect = require('chai').expect;
const { testObjectAPI } = require('./helpers');
const { SecureEntryView } = require('../src/views/secure-entry-view');
const { RenderModes } = require('../src/controllers/internal-renderer');
const { getRandomIdentifier } = require('../src/helpers/utils');
const { InternalRenderer } = require('../src/controllers/internal-renderer');

describe('SecureEntryView', () => {
    it('should be instantiated with `new`', () => {
        const seView = new SecureEntryView({ renderMode: RenderModes.DEFERRED });
        expect(seView).to.exist;

        let err;
        try {
            err = SecureEntryView();
        } catch (e) {
            err = e;
        }
        expect(err).to.be.an.instanceOf(TypeError);
    });

    // If this test fails, you have altered public API. If this is intentional
    // please be sure to update the test and documentation accordingly.
    it('should expose public API', () => {
        testObjectAPI({
            object: new SecureEntryView({ renderMode: RenderModes.DEFERRED }),
            expectedMethods: [
                'constructor',
                'setToken',
                'setSelector',
                'setBrandingColor',
                'setErrorText',
                'showError',
                'enableBrandedSubtitle',
                'setPDF417Subtitle',
                'setQRCodeSubtitle',
                'teardown'
            ]
        });
    });

    describe('rendering behavior', () => {
        let container;
        let selector;
        const token = '123456';
        const error = { text: 'error text', iconURL: 'iconurl' };
        let view;

        beforeEach(() => {
            container = document.createElement('div');
            container.id = `container${getRandomIdentifier()}`;
            selector = `#${container.id}`;
            document.body.append(container);
        });

        afterEach(() => {
            container.remove();
        });

        it('should immediately render with container node in setter', () => {
            const containerNode = document.createElement('div');
            view = new SecureEntryView();
            view.setSelector(containerNode);
            view.setToken(token);

            const el = containerNode.querySelector('div[id*=pseview]');
            expect(el).to.exist;
        });

        it('should immediately render with container node in constructor', () => {
            const containerNode = document.createElement('div');
            view = new SecureEntryView({ selector: containerNode });
            view.setToken(token);

            const el = containerNode.querySelector('div[id*=pseview]');
            expect(el).to.exist;
        });

        it('should immediately render with no options object in constructor', () => {
            view = new SecureEntryView();
            view.setSelector(selector);
            view.setToken(token);

            const el = container.querySelector('div[id*=pseview]');
            expect(el).to.exist;
        });

        it('should immediately render with `null` options object in constructor', () => {
            view = new SecureEntryView(null);
            view.setSelector(selector);
            view.setToken(token);

            const el = container.querySelector('div[id*=pseview]');
            expect(el).to.exist;
        });

        it('should immediately render with options object in constructor and `setToken` setter', () => {
            view = new SecureEntryView({ selector });
            view.setToken(token);

            const el = container.querySelector('div[id*=pseview]');
            expect(el).to.exist;
        });

        it('should immediately render with options object in constructor and `setSelector` setter', () => {
            view = new SecureEntryView({ token });
            view.setSelector(selector);

            const el = container.querySelector('div[id*=pseview]');
            expect(el).to.exist;
        });

        it('should immediately render with options object in constructor', () => {
            view = new SecureEntryView({ selector, token });
            view.setSelector(selector);
            view.setToken(token);

            const el = container.querySelector('div[id*=pseview]');
            expect(el).to.exist;
        });

        it('should immediately render an error with no options object in constructor', () => {
            view = new SecureEntryView();
            view.setSelector(selector);
            view.showError(error);

            const el = container.querySelector('div[id*=pseerrorview]');
            expect(el).to.exist;
        });

        it('should immediately render an error with options object in constructor', () => {
            view = new SecureEntryView({ selector });
            view.showError(error);

            const el = container.querySelector('div[id*=pseerrorview]');
            expect(el).to.exist;
        });
    });

    describe('barcode subtitle', () => {
        let view;
        let internalRenderer;
        const expectedDefaultSubtitle = 'Screenshots are not valid';

        beforeEach(() => {
            internalRenderer = new InternalRenderer();
            view = new SecureEntryView({}, internalRenderer);
        });

        it('should allow enabling branded subtitle', () => {
            expect(internalRenderer.isBrandingColoredSubtitleEnabled).to.be.false;

            view.enableBrandedSubtitle(true);
            expect(internalRenderer.isBrandingColoredSubtitleEnabled).to.be.true;
        });

        it('should allow setting PDF417 subtitle', () => {
            expect(internalRenderer.pdf417Subtitle).to.equal(expectedDefaultSubtitle);

            const expectedSubtitle = 'Custom PDF417 subtitle';
            view.setPDF417Subtitle(expectedSubtitle);
            expect(internalRenderer.pdf417Subtitle).to.equal(expectedSubtitle);
        });

        it('should allow setting QR code subtitle', () => {
            expect(internalRenderer.qrCodeSubtitle).to.equal(expectedDefaultSubtitle);

            const expectedSubtitle = 'Custom QR code subtitle';
            view.setQRCodeSubtitle(expectedSubtitle);
            expect(internalRenderer.qrCodeSubtitle).to.equal(expectedSubtitle);
        });
    });
});
