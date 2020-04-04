"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const platform_1 = require("./platform");
const safeProcess = typeof process === 'undefined'
    ? {
        cwd() {
            return '/';
        },
        env: Object.create(null),
        get platform() {
            return platform_1.isWindows ? 'win32' : platform_1.isMacintosh ? 'darwin' : 'linux';
        },
        nextTick(callback) {
            return platform_1.setImmediate(callback);
        },
    }
    : process;
exports.cwd = safeProcess.cwd;
exports.env = safeProcess.env;
exports.platform = safeProcess.platform;
exports.nextTick = safeProcess.nextTick;
