const pdf417Width = 200;
const pdf417Height = 50;
const qrWidth = 120;
const qrHeight = 120;

module.exports = {
    Dimensions: {
        pdf417: {
            PADDING: 8,
            WIDTH: pdf417Width,
            HEIGHT: pdf417Height,
            RATIO: pdf417Height / pdf417Width
        },
        qrcode: {
            WIDTH: qrWidth,
            HEIGHT: qrHeight,
            RATIO: qrHeight / qrWidth
        }
    }
};
