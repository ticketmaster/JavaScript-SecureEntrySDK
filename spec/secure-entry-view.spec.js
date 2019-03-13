const expect = require('chai').expect;
const { testObjectAPI } = require('./helpers');
const SecureEntryView = require('../src/secure-entry-view');
const { InternalRenderer, RenderModes } = require('../src/internal-renderer');
const { getRandomIdentifier } = require('../src/utils');

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
                'setErrorText'
            ]
        });
    });

    it('should be passthrough for `InternalRenderer`', () => {
        const mockRender = new InternalRenderer();

        const options = {
            selector: 'selector',
            token: 'token',
            brandingColor: 'brandingColor'
        };

        const view = new SecureEntryView(options, mockRender);
        expect(view).to.exist;
        expect(mockRender.selector).to.equal(options.selector);
        expect(mockRender.token).to.equal(options.token);
        expect(mockRender.brandingColor).to.equal(options.brandingColor);

        view.setSelector('newselector');
        expect(mockRender.selector).to.equal('newselector');

        view.setToken('newtoken');
        expect(mockRender.token).to.equal('newtoken');

        view.setBrandingColor('color');
        expect(mockRender.brandingColor).to.equal('color');
    });

    describe('rendering behavior', () => {
        let container;
        let selector;
        const token = '123456';
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
    });
});
