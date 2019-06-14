/**
 * @typedef BarcodeDimensions
 * @property {Number} minWidth
 * @property {Number} minHeight
 * @property {Number} ratio
 * @property {Number} [paddingPercentage]
 * @property {Number} [verticalPaddingPercentage]
 * @property {Number} [horizontalPaddingPercentage]
 * @property {Number} [fontPercentage]
 * @property {Number} [boundsPaddingPercentage]
 * @property {Number} [internalPaddingPercentage]
 */

const containerMinSize = { w: 216, h: 160 };
const pdf417MinSize = { w: 200, h: 50 };
const errorMinSize = {
    w: 200,
    h: 120,
    iconWidth: 36,
    iconHeight: 32,
    font: 11,
    boundsPadding: 10,
    internalPadding: 8
};

/**
 *
 * @param {*} size
 * @param {*} addPaddingPercentage
 *
 * @returns {BarcodeDimensions}
 */
function generateSizing(size, addPaddingPercentage = false) {
    const sizing = {
        minWidth: size.w,
        minHeight: size.h,
        ratio: size.h / size.w
    };

    if (addPaddingPercentage) {
        sizing.paddingPercentage = (containerMinSize.w - size.w) / containerMinSize.w;
        sizing.verticalPaddingPercentage = (containerMinSize.h - size.h) / containerMinSize.h;
        sizing.horizontalPaddingPercentage = (containerMinSize.w - size.w) / containerMinSize.w;

        if (size.font) {
            sizing.fontPercentage = size.font / containerMinSize.h;
        }

        if (size.iconWidth && size.iconHeight) {
            sizing.iconWidth = size.iconWidth;
            sizing.iconHeight = size.iconHeight;
        }

        if (size.boundsPadding) {
            sizing.boundsPaddingPercentage = size.boundsPadding / containerMinSize.w;
            sizing.internalPaddingPercentage = size.internalPadding / containerMinSize.w;
        }
    }

    return sizing;
};

export const container = generateSizing(containerMinSize);
export const pdf417 = generateSizing(pdf417MinSize, true);
export const error = generateSizing(errorMinSize, true);
