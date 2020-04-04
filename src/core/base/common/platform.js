"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const LANGUAGE_DEFAULT = 'zh-cn';
let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isNative = false;
let _isWeb = false;
let _locale = undefined;
let _language = LANGUAGE_DEFAULT;
let _translationsConfigFile = undefined;
let _userAgent = undefined;
const isElectronRenderer = (typeof process !== 'undefined' && typeof process.versions !== 'undefined' && typeof process.versions.electron !== 'undefined' && process.type === 'renderer');
// OS detection
if (typeof navigator === 'object' && !isElectronRenderer) {
    _userAgent = navigator.userAgent;
    _isWindows = _userAgent.indexOf('Windows') >= 0;
    _isMacintosh = _userAgent.indexOf('Macintosh') >= 0;
    _isLinux = _userAgent.indexOf('Linux') >= 0;
    _isWeb = true;
    _locale = navigator.language;
    _language = _locale;
}
else if (typeof process === 'object') {
    _isWindows = (process.platform === 'win32');
    _isMacintosh = (process.platform === 'darwin');
    _isLinux = (process.platform === 'linux');
    _locale = LANGUAGE_DEFAULT;
    _language = LANGUAGE_DEFAULT;
    const rawNlsConfig = process.env['VSCODE_NLS_CONFIG'];
    if (rawNlsConfig) {
        try {
            const nlsConfig = JSON.parse(rawNlsConfig);
            const resolved = nlsConfig.availableLanguages['*'];
            _locale = nlsConfig.locale;
            // VSCode's default language is 'en'
            _language = resolved ? resolved : LANGUAGE_DEFAULT;
            _translationsConfigFile = nlsConfig._translationsConfigFile;
        }
        catch (e) {
        }
    }
    _isNative = true;
}
var Platform;
(function (Platform) {
    Platform[Platform["Web"] = 0] = "Web";
    Platform[Platform["Mac"] = 1] = "Mac";
    Platform[Platform["Linux"] = 2] = "Linux";
    Platform[Platform["Windows"] = 3] = "Windows";
})(Platform = exports.Platform || (exports.Platform = {}));
function PlatformToString(platform) {
    switch (platform) {
        case Platform.Web: return 'Web';
        case Platform.Mac: return 'Mac';
        case Platform.Linux: return 'Linux';
        case Platform.Windows: return 'Windows';
    }
}
exports.PlatformToString = PlatformToString;
let _platform = Platform.Web;
if (_isMacintosh) {
    _platform = Platform.Mac;
}
else if (_isWindows) {
    _platform = Platform.Windows;
}
else if (_isLinux) {
    _platform = Platform.Linux;
}
exports.isWindows = _isWindows;
exports.isMacintosh = _isMacintosh;
exports.isLinux = _isLinux;
exports.isNative = _isNative;
exports.isWeb = _isWeb;
exports.platform = _platform;
exports.userAgent = _userAgent;
function isRootUser() {
    return _isNative && !_isWindows && (process.getuid() === 0);
}
exports.isRootUser = isRootUser;
/**
 * The language used for the user interface. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese)
 */
exports.language = _language;
var Language;
(function (Language) {
    function value() {
        return exports.language;
    }
    Language.value = value;
    function isDefaultVariant() {
        if (exports.language.length === 2) {
            return exports.language === 'en';
        }
        else if (exports.language.length >= 3) {
            return exports.language[0] === 'e' && exports.language[1] === 'n' && exports.language[2] === '-';
        }
        else {
            return false;
        }
    }
    Language.isDefaultVariant = isDefaultVariant;
    function isDefault() {
        return exports.language === 'en';
    }
    Language.isDefault = isDefault;
})(Language = exports.Language || (exports.Language = {}));
/**
 * The OS locale or the locale specified by --locale. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese). The UI is not necessarily shown in the provided locale.
 */
exports.locale = _locale;
/**
 * The translatios that are available through language packs.
 */
exports.translationsConfigFile = _translationsConfigFile;
const _globals = (typeof self === 'object' ? self : typeof global === 'object' ? global : {});
exports.globals = _globals;
exports.setImmediate = (function defineSetImmediate() {
    if (exports.globals.setImmediate) {
        return exports.globals.setImmediate.bind(exports.globals);
    }
    if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
        return process.nextTick.bind(process);
    }
    const _promise = Promise.resolve();
    return (callback) => _promise.then(callback);
})();
var OperatingSystem;
(function (OperatingSystem) {
    OperatingSystem[OperatingSystem["Windows"] = 1] = "Windows";
    OperatingSystem[OperatingSystem["Macintosh"] = 2] = "Macintosh";
    OperatingSystem[OperatingSystem["Linux"] = 3] = "Linux";
})(OperatingSystem = exports.OperatingSystem || (exports.OperatingSystem = {}));
exports.OS = (_isMacintosh ? OperatingSystem.Macintosh : (_isWindows ? OperatingSystem.Windows : OperatingSystem.Linux));
