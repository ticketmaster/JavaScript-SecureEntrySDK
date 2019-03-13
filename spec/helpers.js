const { expect } = require('chai');

function testObjectAPI({ object, expectedProperties = [], expectedMethods = [] }) {
    const actualProperties = Object.getOwnPropertyNames(object);
    expect(actualProperties.sort()).to.eql(expectedProperties.sort());

    const objectPrototype = Object.getPrototypeOf(object);
    const actualMethods = Object.getOwnPropertyNames(objectPrototype);
    expect(actualMethods.sort()).to.eql(expectedMethods.sort());
}

/**
 * Utility to test CSS attribute string values as integer values. Useful to
 * prevent constant conversion of string value with measurement unit to an
 * integer. For example '200px' to '200'.
 *
 * @param {CSSStyleDeclaration} styleDeclaration - The declaration to test
 * @param {Object} expectedDeclarationMap - An object with expected CSS attribute keys and values
 */
function testCSSValuesAsIntegers(styleDeclaration, expectedDeclarationMap) {
    Object.keys(expectedDeclarationMap).forEach(attribute => {
        const msg = `CSS '${attribute}' attribute`;
        expect(parseInt(styleDeclaration[attribute]), msg).to.equal(expectedDeclarationMap[attribute]);
    });
}

/**
 * Utility to convert a token object literal into an base64 encoded JSON string.
 *
 * @param {Object} tokenObject
 */
function objectToEncodedToken(tokenObject) {
    return btoa(JSON.stringify(tokenObject));
}

module.exports = {
    testObjectAPI,
    testCSSValuesAsIntegers,
    objectToEncodedToken
};
