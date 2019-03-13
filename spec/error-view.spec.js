const { expect } = require('chai');
const { ErrorView } = require('../src/error-view');

describe('error-view', () => {
    describe('ErrorView', () => {
        it('should support setting error text', () => {
            const testCases = [
                {
                    testMessage: 'Default text',
                    options: {},
                    expectedText: 'Reload ticket'
                },
                {
                    testMessage: 'null text',
                    options: { errorText: null },
                    expectedText: 'Reload ticket'
                },
                {
                    testMessage: 'void',
                    options: { errorText: void (0) },
                    expectedText: 'Reload ticket'
                },
                {
                    testMessage: 'Custom text',
                    options: { errorText: 'Some custom text' },
                    expectedText: 'Some custom text'
                },
                {
                    testMessage: 'Custom text exceeds character limit',
                    options: { errorText: 'a'.repeat(61) },
                    expectedText: 'Reload ticket'
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
                const el = errorView.el.querySelector('p');
                expect(el.innerText, testCase.testMessage).to.equal(testCase.expectedText);
            });
        });
    });
});
