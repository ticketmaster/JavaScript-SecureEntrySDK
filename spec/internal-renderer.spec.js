const expect = require('chai').expect;
const { InternalRenderer, RenderModes } = require('../src/internal-renderer');
const { objectToEncodedToken } = require('./helpers');
const { getRandomIdentifier } = require('../src/utils');
const { container: containerDimensions, pdf417 } = require('../src/dimensions');

const tokenSecureToken = objectToEncodedToken({ b: 'b', t: 't', ck: 'ck' });
const barcodeSecureToken = objectToEncodedToken({ b: 'b' });

describe('internal-renderer', () => {
    it('should generate an immutable unique identifier', () => {
        const renderer1 = new InternalRenderer();
        const renderer2 = new InternalRenderer();

        expect(renderer1.id).to.exist;
        expect(renderer2.id).to.exist;
        expect(renderer1.id).to.not.equal(renderer2.id);

        const newID = 'foo';
        renderer1.id = newID;
        expect(renderer1.id).to.not.equal(newID);
    });

    it('should support render modes', () => {
        const renderer = new InternalRenderer();
        expect(renderer.mode).to.equal(RenderModes.DEFERRED);

        renderer.mode = RenderModes.IMMEDIATE;
        expect(renderer.mode).to.equal(RenderModes.IMMEDIATE);

        renderer.mode = 'nonsense';
        expect(renderer.mode).to.equal(RenderModes.IMMEDIATE);

        const renderer2 = new InternalRenderer({ renderMode: RenderModes.IMMEDIATE });
        expect(renderer2.mode).to.equal(RenderModes.IMMEDIATE);
    });

    it('should report renderable', () => {
        const renderer = new InternalRenderer();
        expect(renderer.isRenderable, 'initially not renderable').to.be.false;

        renderer.isRenderable = true;
        expect(renderer.isRenderable).to.be.false;

        renderer.selector = 'selector';
        renderer.token = 'token';
        expect(renderer.isRenderable).to.be.true;
    });

    describe('RenderModes.IMMEDIATE', () => {
        let container;
        let containerSelector;
        const token = '123456';

        beforeEach(() => {
            container = document.createElement('div');
            container.id = `container${getRandomIdentifier()}`;
            containerSelector = `#${container.id}`;
            document.body.append(container);
        });

        afterEach(() => {
            container.remove();
        });

        it('should immediately render a barcode when renderable on initialization', () => {
            const renderer = new InternalRenderer({
                selector: containerSelector,
                token,
                renderMode: RenderModes.IMMEDIATE
            });
            const el = container.querySelector('div');
            expect(el).to.exist;
            expect(el.id).to.contain(renderer.id);
        });

        it('should immediately render a barcode when renderable after initialization', () => {
            const renderer = new InternalRenderer({
                renderMode: RenderModes.IMMEDIATE
            });
            expect(container.hasChildNodes()).to.be.false;

            renderer.selector = containerSelector;
            renderer.token = token;
            expect(container.hasChildNodes()).to.be.true;
        });

        it('should render invalid token error', () => {
            const renderer = new InternalRenderer({
                renderMode: RenderModes.IMMEDIATE
            });
            expect(container.hasChildNodes()).to.be.false;

            renderer.selector = containerSelector;
            renderer.token = token;

            const el = container.querySelector('div[id*=pseerrorview]');
            expect(el).to.exist;
        });

        it('should render a custom error', () => {
            const renderer = new InternalRenderer({
                renderMode: RenderModes.IMMEDIATE
            });
            expect(container.hasChildNodes()).to.be.false;

            renderer.selector = containerSelector;
            renderer.error = {
                text: 'Custom error text',
                iconURL: 'avalidurl'
            };

            const el = container.querySelector('div[id*=pseerrorview]');
            expect(el).to.exist;

            const textEl = el.querySelector('p');
            expect(textEl.innerText).to.equal('Custom error text');

            const imageEl = el.querySelector('img');
            expect(imageEl.src).to.match(/avalidurl$/);
        });
    });

    describe('RenderModes.DEFERRED', () => {
        let container;
        let containerSelector;
        const token = '123456';

        beforeEach(() => {
            container = document.createElement('div');
            container.id = `container${getRandomIdentifier()}`;
            containerSelector = `#${container.id}`;
            document.body.append(container);
        });

        afterEach(() => {
            container.remove();
        });

        it('should not immediately render a barcode when renderable on initialization', () => {
            /* eslint-disable-next-line no-new */
            new InternalRenderer({
                selector: containerSelector,
                token
            });
            expect(container.hasChildNodes()).to.be.false;
        });

        it('should not immediately render a barcode when renderable after initialization', () => {
            const renderer = new InternalRenderer();

            renderer.selector = containerSelector;
            renderer.token = token;

            expect(container.hasChildNodes()).to.be.false;
        });

        it('should render when explicitly called', () => {
            const renderer = new InternalRenderer();

            renderer.selector = containerSelector;
            renderer.token = token;

            expect(container.hasChildNodes()).to.be.false;

            renderer.render();
            const el = container.querySelector('div');
            expect(el).to.exist;
            expect(el.id).to.contain(renderer.id);
        });

        it('should render invalid token error', () => {
            const renderer = new InternalRenderer({
                selector: containerSelector,
                token: token
            });
            expect(container.hasChildNodes()).to.be.false;

            renderer.render();

            const el = container.querySelector('div[id*=pseerrorview]');
            expect(el).to.exist;
        });

        it('should render a custom error', () => {
            const renderer = new InternalRenderer();
            renderer.selector = containerSelector;
            renderer.error = {
                text: 'Custom error text',
                iconURL: 'avalidurl'
            };
            expect(container.hasChildNodes()).to.be.false;

            renderer.render();

            const el = container.querySelector('div[id*=pseerrorview]');
            expect(el).to.exist;

            const textEl = el.querySelector('p');
            expect(textEl.innerText).to.equal('Custom error text');

            const imageEl = el.querySelector('img');
            expect(imageEl.src).to.match(/avalidurl$/);
        });
    });

    describe('rendered aspect ratio', () => {
        let container;
        let containerWidth = 216;
        let renderer;

        beforeEach(() => {
            container = document.createElement('div');
            container.id = `container${getRandomIdentifier()}`;
            container.style.width = `${containerWidth}px`;
            document.body.appendChild(container);

            renderer = new InternalRenderer({
                selector: `#${container.id}`,
                renderMode: RenderModes.IMMEDIATE
            });
        });

        afterEach(() => {
            renderer = null;
            container.remove();
        });

        it('should add an element to the DOM sized at a 4:1 ratio plus padding provided token', () => {
            renderer.token = tokenSecureToken;
            const el = container.querySelector('div[id*=psetokenview]');
            const padding = containerWidth * pdf417.paddingPercentage;
            const expectedContainerHeight = pdf417.minHeight + padding;
            expect(el).to.exist;
            expect(el.clientHeight).to.equal(expectedContainerHeight);
        });

        it('should add an element to the DOM sized at a 1:1 ratio when provided barcode', () => {
            renderer.token = barcodeSecureToken;
            const el = container.querySelector('div[id*=psebarcodeview]');
            expect(el).to.exist;
            expect(el.clientWidth).to.equal(el.clientHeight);
        });
    });

    describe('minimum sizing', () => {
        let container;
        /** @type InternalRenderer */
        let renderer;

        beforeEach(() => {
            container = document.createElement('div');
            container.id = `container${getRandomIdentifier()}`;
            document.body.append(container);
            renderer = new InternalRenderer({ renderMode: RenderModes.IMMEDIATE });
        });

        afterEach(() => {
            renderer = null;
            container.remove();
        });

        it('should be minimum size with small container', () => {
            container.style.width = '100px';

            renderer.selector = `#${container.id}`;
            renderer.token = tokenSecureToken;

            const el = container.querySelector('div[id*=pseview]');
            expect(el.clientWidth).to.equal(containerDimensions.minWidth);
            expect(el.clientHeight).to.equal(containerDimensions.minHeight);
        });

        it('should be proportional to larger container', () => {
            const expectedWidth = 500;
            const expectedHeight = Math.ceil(expectedWidth * containerDimensions.ratio);
            container.style.width = `${expectedWidth}px`;

            renderer.selector = `#${container.id}`;
            renderer.token = tokenSecureToken;

            const el = container.querySelector('div[id*=pseview]');
            expect(el.clientWidth).to.equal(expectedWidth);
            expect(el.clientHeight).to.equal(expectedHeight);
        });
    });
});
