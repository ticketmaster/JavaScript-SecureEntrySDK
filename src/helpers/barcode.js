/**
 * Module for handling PDF417 barcode data.
 *
 * @module barcode
 */

import { PDF417 } from '../vendor/pdf417';
import { createElement } from './utils';

const BLOCK_WIDTH = 2;
const BLOCK_SIZE_RATIO = 1;

/**
 * Wrapper for PDF417's barcode array representation.
 *
 * @typedef BarcodeMatrix
 * @property {String} dataMatrix - A multi-dimensional array representation of the barcode
 * @property {String} columnLength - The number of columns in `dataMatrix`
 * @property {String} rowLength - The number of rows in `dataMatrix`
 */

/**
 * Dimensions that should be applied to a HTMLCanvasElement and its
 * CanvasRenderingContext2D for barcode rendering.
 *
 * @typedef CanvasDimensions
 * @property {Number} width - Width value the HTMLCanvasElement should be set to
 * @property {Number} height - Height value the HTMLCanvasElement should be set to
 * @property {Number} scale - Scale value the CanvasRenderingContext2D should be set to
 */

/**
 * Wrapper over PDF417.init to return a BarcodeMatrix and meta data.
 *
 * @param {String} barcodeString
 *
 * @return {BarcodeMatrix}
 */
export function createBarcodeMatrix(barcodeString) {
    PDF417.init(barcodeString);
    const barcodeMatrix = PDF417.getBarcodeArray();

    return {
        columnLength: barcodeMatrix.num_cols,
        rowLength: barcodeMatrix.num_rows,
        dataMatrix: barcodeMatrix.bcode
    };
}

/**
 * Return a CanvasDimensions for the supplied BarcodeMatrix.
 *
 * This should be used to make sure a HTMLCanvasElement is sized appropriately
 * for a barcode to be rendered in.
 *
 * @param {BarcodeMatrix} barcodeMatrix
 * @param {Number} containerWidth
 * @param {Number} blockWidth
 * @param {Number} ratio
 *
 * @return {CanvasDimensions}
 */
export function getCanvasDimsForBarcode(barcodeMatrix, containerWidth, blockWidth = BLOCK_WIDTH, ratio = BLOCK_SIZE_RATIO) {
    const blockHeight = blockWidth * ratio;
    const barcodeWidth = blockWidth * barcodeMatrix.columnLength;
    const barcodeHeight = blockHeight * barcodeMatrix.rowLength;
    const scale = containerWidth / barcodeWidth;
    const height = barcodeHeight * scale;

    return {
        width: containerWidth,
        height,
        scale
    };
}

/**
 * Perform actual rendering of a barcode string into a HTMLCanvasElement.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {String} barcodeString
 * @param {Number} blockWidth
 * @param {Number} ratio
 */
export function drawBarcodeInCanvas(ctx1, barcodeString, blockWidth = BLOCK_WIDTH, ratio = BLOCK_SIZE_RATIO) {
    const barcodeArray = createBarcodeMatrix(barcodeString);

    const dpr = global.devicePixelRadius || 1;

    // Offscreen rendering
    const offscreenCanvas = createElement(
        'canvas',
        {
            width: blockWidth * barcodeArray.columnLength * dpr,
            height: blockWidth * barcodeArray.rowLength * dpr
        }
    );
    const ctx = offscreenCanvas.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const blockHeight = blockWidth * ratio;
    // graph barcode elements
    let y = 0;
    // for each row
    for (let r = 0; r < barcodeArray.rowLength; ++r) {
        let x = 0;
        // for each column
        for (let c = 0; c < barcodeArray.columnLength; ++c) {
            if (barcodeArray.dataMatrix[r][c] === '1') {
                ctx.fillRect(x, y, blockWidth, blockHeight);
            }
            x += blockWidth;
        }
        y += blockHeight;
    }

    // Onscreen rendering
    const img = new window.Image();
    img.onload = function () {
        ctx1.clearRect(0, 0, ctx1.canvas.width, ctx1.canvas.height);
        ctx1.drawImage(this, 0, 0, ctx1.canvas.width, ctx1.canvas.height);
    };
    img.src = offscreenCanvas.toDataURL();
}
