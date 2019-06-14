const { expect } = require('chai');
const { ErrorView, DEFAULT_ERROR_TEXT, DEFAULT_ICON_URL, MAX_ERROR_TEXT_LENGTH } = require('../src/views/error-view');

describe('error-view', () => {
    describe('ErrorView', () => {
        it('should have default error text and image', () => {
            const errorView = new ErrorView();
            errorView.render();

            const textEl = errorView.el.querySelector('p');
            expect(textEl.innerText).to.equal(DEFAULT_ERROR_TEXT);

            const imageEl = errorView.el.querySelector('img');
            expect(imageEl.src).to.equal(DEFAULT_ICON_URL);
        });

        it('should support setting error text', () => {
            const testCases = [
                {
                    testMessage: 'Default text',
                    options: {},
                    expectedText: DEFAULT_ERROR_TEXT
                },
                {
                    testMessage: 'null text',
                    options: { errorText: null },
                    expectedText: DEFAULT_ERROR_TEXT
                },
                {
                    testMessage: 'void',
                    options: { errorText: void (0) },
                    expectedText: DEFAULT_ERROR_TEXT
                },
                {
                    testMessage: 'Custom text',
                    options: { errorText: 'Some custom text' },
                    expectedText: 'Some custom text'
                },
                {
                    testMessage: 'Custom text exceeds character limit',
                    options: { errorText: 'a'.repeat(MAX_ERROR_TEXT_LENGTH + 1) },
                    expectedText: DEFAULT_ERROR_TEXT
                },
                {
                    testMessage: 'No text',
                    options: { errorText: '' },
                    expectedText: ''
                }
            ];

            testCases.forEach(testCase => {
                const errorView = new ErrorView(testCase.options);
                errorView.render();
                const textEl = errorView.el.querySelector('p');
                expect(textEl.innerText).to.equal(testCase.expectedText, testCase.testMessage);

                const imageEl = errorView.el.querySelector('img');
                expect(imageEl.src).to.equal(DEFAULT_ICON_URL, testCase.testMessage);
            });
        });

        it('should support setting error image', () => {
            const testCases = [
                {
                    testMessage: 'Custom icon URL',
                    options: { iconURL: 'avalidurl' },
                    expectedImageSrcRegex: /avalidurl$/
                }
            ];

            testCases.forEach(testCase => {
                const errorView = new ErrorView(testCase.options);
                errorView.render();
                const imageEl = errorView.el.querySelector('img');
                expect(imageEl.src).to.match(testCase.expectedImageSrcRegex, testCase.testMessage);

                const textEl = errorView.el.querySelector('p');
                expect(textEl.innerText).to.equal(DEFAULT_ERROR_TEXT);
            });
        });

        it('should use default image when provided invalid image', () => {
            const testCases = [
                {
                    testMessage: 'null image',
                    options: { iconURL: null }
                },
                {
                    testMessage: 'void',
                    options: { iconURL: void (0) }
                },
                {
                    testMessage: 'Empty string',
                    options: { iconURL: '' }
                },
                {
                    testMessage: 'true literal',
                    options: { iconURL: true }
                },
                {
                    testMessage: 'false literal',
                    options: { iconURL: false }
                },
                {
                    testMessage: 'number literal',
                    options: { iconURL: 1 }
                }
            ];

            testCases.forEach(testCase => {
                const errorView = new ErrorView(testCase.options);
                errorView.render();
                const imageEl = errorView.el.querySelector('img');
                expect(imageEl.src).to.equal(DEFAULT_ICON_URL, testCase.testMessage);

                const textEl = errorView.el.querySelector('p');
                expect(textEl.innerText).to.equal(DEFAULT_ERROR_TEXT);
            });
        });
    });
});
