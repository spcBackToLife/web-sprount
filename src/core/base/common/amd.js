"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const uri_1 = require("./uri");
function getPathFromAmdModule(requirefn, relativePath) {
    return uri_1.URI.parse(requirefn.toUrl(relativePath)).fsPath;
}
exports.getPathFromAmdModule = getPathFromAmdModule;
/**
 * Reference a resource that might be inlined.
 * Do not rename this method unless you adopt the build scripts.
 */
function registerAndGetAmdImageURL(absolutePath) {
    return require.toUrl(absolutePath);
}
exports.registerAndGetAmdImageURL = registerAndGetAmdImageURL;
