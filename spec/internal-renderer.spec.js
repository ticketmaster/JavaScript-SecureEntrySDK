const expect = require('chai').expect;
const { InternalRenderer, RenderModes } = require('../src/controllers/internal-renderer');
const { objectToEncodedToken } = require('./helpers');
const { container: containerDimensions, pdf417 } = require('../src/helpers/dimensions');

const timeSync = require('../src/helpers/time-sync');
timeSync.syncTime(0);

const tokenSecureToken = objectToEncodedToken({ b: 'b', t: 't', ck: 'ck' });
const barcodeSecureToken = objectToEncodedToken({ b: 'b' });
const DEFAULT_BRANDING_COLOR = '#076CD9';

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

        renderer.containerNode = document.createElement('div');
        renderer.token = 'token';
        expect(renderer.isRenderable).to.be.true;
    });

    describe('RenderModes.IMMEDIATE', () => {
        let containerNode;
        const token = '123456';

        beforeEach(() => {
            containerNode = document.createElement('div');
            document.body.append(containerNode);
        });

        afterEach(() => {
            containerNode.remove();
        });

        it('should immediately render a barcode when renderable on initialization', () => {
            const renderer = new InternalRenderer({
                containerNode,
                token,
                renderMode: RenderModes.IMMEDIATE
            });
            const el = containerNode.querySelector('div');
            expect(el).to.exist;
            expect(el.id).to.contain(renderer.id);
        });

        it('should immediately render a barcode when renderable after initialization', () => {
            const renderer = new InternalRenderer({
                renderMode: RenderModes.IMMEDIATE
            });
            expect(containerNode.hasChildNodes()).to.be.false;

            renderer.containerNode = containerNode;
            renderer.token = token;
            expect(containerNode.hasChildNodes()).to.be.true;
        });

        it('should render invalid token error', () => {
            const renderer = new InternalRenderer({
                renderMode: RenderModes.IMMEDIATE
            });
            expect(containerNode.hasChildNodes()).to.be.false;

            renderer.containerNode = containerNode;
            renderer.token = token;

            const el = containerNode.querySelector('div[id*=pseerrorview]');
            expect(el).to.exist;
        });

        it('should render a custom error', () => {
            const renderer = new InternalRenderer({
                renderMode: RenderModes.IMMEDIATE
            });
            expect(containerNode.hasChildNodes()).to.be.false;

            renderer.containerNode = containerNode;
            renderer.error = {
                text: 'Custom error text',
                iconURL: 'avalidurl'
            };

            const el = containerNode.querySelector('div[id*=pseerrorview]');
            expect(el).to.exist;

            const textEl = el.querySelector('p');
            expect(textEl.innerText).to.equal('Custom error text');

            const imageEl = el.querySelector('img');
            expect(imageEl.src).to.match(/avalidurl$/);
        });
    });

    describe('RenderModes.DEFERRED', () => {
        let containerNode;
        const token = '123456';

        beforeEach(() => {
            containerNode = document.createElement('div');
            document.body.append(containerNode);
        });

        afterEach(() => {
            containerNode.remove();
        });

        it('should not immediately render a barcode when renderable on initialization', () => {
            /* eslint-disable-next-line no-new */
            new InternalRenderer({
                containerNode,
                token
            });
            expect(containerNode.hasChildNodes()).to.be.false;
        });

        it('should not immediately render a barcode when renderable after initialization', () => {
            const renderer = new InternalRenderer();

            renderer.containerNode = containerNode;
            renderer.token = token;

            expect(containerNode.hasChildNodes()).to.be.false;
        });

        it('should render when explicitly called', () => {
            const renderer = new InternalRenderer();

            renderer.containerNode = containerNode;
            renderer.token = token;

            expect(containerNode.hasChildNodes()).to.be.false;

            renderer.render();
            const el = containerNode.querySelector('div');
            expect(el).to.exist;
            expect(el.id).to.contain(renderer.id);
        });

        it('should render invalid token error', () => {
            const renderer = new InternalRenderer({
                containerNode,
                token: token
            });
            expect(containerNode.hasChildNodes()).to.be.false;

            renderer.render();

            const el = containerNode.querySelector('div[id*=pseerrorview]');
            expect(el).to.exist;
        });

        it('should render a custom error', () => {
            const renderer = new InternalRenderer();
            renderer.containerNode = containerNode;
            renderer.error = {
                text: 'Custom error text',
                iconURL: 'avalidurl'
            };
            expect(containerNode.hasChildNodes()).to.be.false;

            renderer.render();

            const el = containerNode.querySelector('div[id*=pseerrorview]');
            expect(el).to.exist;

            const textEl = el.querySelector('p');
            expect(textEl.innerText).to.equal('Custom error text');

            const imageEl = el.querySelector('img');
            expect(imageEl.src).to.match(/avalidurl$/);
        });
    });

    describe('rendered aspect ratio', () => {
        let containerNode;
        let containerWidth = 216;
        let renderer;

        beforeEach(() => {
            containerNode = document.createElement('div');
            containerNode.style.width = `${containerWidth}px`;
            document.body.appendChild(containerNode);

            renderer = new InternalRenderer({
                containerNode,
                renderMode: RenderModes.IMMEDIATE
            });
        });

        afterEach(() => {
            renderer = null;
            containerNode.remove();
        });

        it('should add an element to the DOM sized at a 4:1 ratio plus padding provided token', () => {
            renderer.token = tokenSecureToken;
            const el = containerNode.querySelector('div[id*=psetokenview]');
            const padding = containerWidth * pdf417.paddingPercentage;
            const expectedContainerHeight = pdf417.minHeight + padding;
            expect(el).to.exist;
            expect(el.clientHeight).to.equal(expectedContainerHeight);
        });

        it('should add an element to the DOM sized at a 1:1 ratio when provided barcode', () => {
            renderer.token = barcodeSecureToken;
            const el = containerNode.querySelector('div[id*=psebarcodeview]');
            expect(el).to.exist;
            expect(el.clientWidth).to.equal(el.clientHeight);
        });
    });

    describe('minimum sizing', () => {
        let containerNode;
        /** @type InternalRenderer */
        let renderer;

        beforeEach(() => {
            containerNode = document.createElement('div');
            document.body.append(containerNode);
            renderer = new InternalRenderer({ renderMode: RenderModes.IMMEDIATE });
        });

        afterEach(() => {
            renderer = null;
            containerNode.remove();
        });

        it('should be minimum size with small container', () => {
            containerNode.style.width = '100px';

            renderer.containerNode = containerNode;
            renderer.token = tokenSecureToken;

            const el = containerNode.querySelector('div[id*=pseview]');
            expect(el.clientWidth).to.equal(containerDimensions.minWidth);
            expect(el.clientHeight).to.equal(containerDimensions.minHeight);
        });

        it('should be proportional to larger container', () => {
            const expectedWidth = 500;
            const expectedHeight = Math.ceil(expectedWidth * containerDimensions.ratio);
            containerNode.style.width = `${expectedWidth}px`;

            renderer.containerNode = containerNode;
            renderer.token = tokenSecureToken;

            const el = containerNode.querySelector('div[id*=pseview]');
            expect(el.clientWidth).to.equal(expectedWidth);
            expect(el.clientHeight).to.equal(expectedHeight);
        });
    });

    describe('branding color alpha value', () => {
        let renderer;
        beforeEach(() => {
            renderer = new InternalRenderer();
        });

        it('should not allow `transparent` keyword', () => {
            renderer.brandingColor = 'transparent';
            expect(renderer.brandingColor).to.equal(DEFAULT_BRANDING_COLOR);
        });

        function testColors(colors, renderer) {
            colors.map(color => {
                renderer.brandingColor = color.actual;
                expect(renderer.brandingColor).to.equal(color.expected, color.message);
            });
        }

        it('should not allow alpha channel in hex color notation', () => {
            const hexColorTests = [
                {
                    actual: '#fff',
                    expected: '#fff',
                    message: '3 digit hex should not have alpha channel'
                },
                {
                    actual: '#fff0',
                    expected: '#fff',
                    message: '4 digit hex should not have alpha channel'
                },
                {
                    actual: '#ffffff',
                    expected: '#ffffff',
                    message: '6 digit hex should not have alpha channel'
                },
                {
                    actual: '#ffffff00',
                    expected: '#ffffff',
                    message: '8 digit hex should not have alpha channel'
                }
            ];

            testColors(hexColorTests, renderer);
        });

        it('should not allow alpha channel via color funcitonal notation', () => {
            const rgbColorTests = [
                {
                    actual: 'rgb(50% 50% 50%)',
                    expected: 'rgb(50%,50%,50%)',
                    message: '3 arguments to function with space delimiter should not have alpha channel'
                },
                {
                    actual: 'rgb(50%, 50%, 50%)',
                    expected: 'rgb(50%,50%,50%)',
                    message: '3 arguments to function with comma delimiter should not have alpha channel'
                },
                {
                    actual: 'rgb(50% 50% 50%, 0%)',
                    expected: 'rgb(50%,50%,50%)',
                    message: '4 arguments to function with space delimiter should not have alpha channel'
                },
                {
                    actual: 'rgba(50% 50% 50%, 0%)',
                    expected: 'rgb(50%,50%,50%)',
                    message: '4 arguments to alpha function alias with space delimiter should not have alpha channel'
                },
                {
                    actual: 'rgb(50%, 50%, 50%, 0%)',
                    expected: 'rgb(50%,50%,50%)',
                    message: '4 arguments to function with comma delimiter should not have alpha channel'
                },
                {
                    actual: 'rgb(255 0 153 / 100%)',
                    expected: 'rgb(255,0,153)',
                    message: '4 arguments to function with slash delimiter should not have alpha channel'
                },
                {
                    actual: 'rgba(255 0 153 / 100%)',
                    expected: 'rgb(255,0,153)',
                    message: '4 arguments to alpha function alias with slash delimiter should not have alpha channel'
                }

            ];

            testColors(rgbColorTests, renderer);
        });
    });
});
