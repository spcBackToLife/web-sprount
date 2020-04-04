"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const sd = require("string_decoder");
const charCode_1 = require("../common/charCode");
/**
 * Convenient way to iterate over output line by line. This helper accommodates for the fact that
 * a buffer might not end with new lines all the way.
 *
 * To use:
 * - call the write method
 * - forEach() over the result to get the lines
 */
class LineDecoder {
    constructor(encoding = 'utf8') {
        this.stringDecoder = new sd.StringDecoder(encoding);
        this.remaining = null;
    }
    write(buffer) {
        const result = [];
        const value = this.remaining
            ? this.remaining + this.stringDecoder.write(buffer)
            : this.stringDecoder.write(buffer);
        if (value.length < 1) {
            return result;
        }
        let start = 0;
        let ch;
        let idx = start;
        while (idx < value.length) {
            ch = value.charCodeAt(idx);
            if (ch === charCode_1.CharCode.CarriageReturn || ch === charCode_1.CharCode.LineFeed) {
                result.push(value.substring(start, idx));
                idx++;
                if (idx < value.length) {
                    const lastChar = ch;
                    ch = value.charCodeAt(idx);
                    if ((lastChar === charCode_1.CharCode.CarriageReturn && ch === charCode_1.CharCode.LineFeed) || (lastChar === charCode_1.CharCode.LineFeed && ch === charCode_1.CharCode.CarriageReturn)) {
                        idx++;
                    }
                }
                start = idx;
            }
            else {
                idx++;
            }
        }
        this.remaining = start < value.length ? value.substr(start) : null;
        return result;
    }
    end() {
        return this.remaining;
    }
}
exports.LineDecoder = LineDecoder;
